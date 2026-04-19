import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import pLimit from 'p-limit';
import { downloadToFile, extFromUrl } from '../lib/assets.mjs';
import { cleanFrontmatter } from '../lib/mdx.mjs';

const PEOPLE_DIR = 'src/content/people';
const PUBS_DIR = 'src/content/publications';
const IMG_DIR = 'public/images/people';
const PDF_DIR = 'public/pdfs';
const UA = 'RAISE-content-migration/1.0 (https://raise.uw.edu)';

function isExternalUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}

export async function downloadAssets() {
  const limit = pLimit(5);
  const jobs = [];
  let imgOk = 0, imgFail = 0, pdfOk = 0, pdfFail = 0, pdfSkipped = 0;

  // Re-scrape /people/ once to build name→photoURL map (cheap: one HTTP GET)
  const peopleRes = await fetch('https://raise.uw.edu/people/', {
    headers: { 'User-Agent': UA },
  });
  if (!peopleRes.ok) throw new Error(`people page: HTTP ${peopleRes.status}`);
  const $ = cheerio.load(await peopleRes.text());

  const nameToPhoto = new Map();
  $('.et_pb_team_member').each((_, tm) => {
    const $tm = $(tm);
    const name = $tm.find('.et_pb_module_header').text().trim();
    const imgUrl =
      $tm.closest('.et_pb_row').find('.et_pb_image img').first().attr('src') ||
      $tm.find('img').first().attr('src');
    if (name && imgUrl) nameToPhoto.set(name, imgUrl);
  });

  console.log(`  name→photo map: ${nameToPhoto.size} entries`);

  // Download headshots
  const peopleFiles = (await readdir(PEOPLE_DIR)).filter(f => f.endsWith('.mdx'));
  for (const file of peopleFiles) {
    const filePath = path.join(PEOPLE_DIR, file);
    const raw = await readFile(filePath, 'utf8');
    const parsed = matter(raw);
    const name = parsed.data.name;
    const url = nameToPhoto.get(name);
    if (!url) continue;

    const ext = extFromUrl(url, '.jpg');
    const slug = file.replace(/\.mdx$/, '');
    const dest = path.join(IMG_DIR, slug + ext);
    const localPath = `/images/people/${slug}${ext}`;

    jobs.push(
      limit(async () => {
        try {
          await downloadToFile(url, dest);
          parsed.data.photo = localPath;
          await writeFile(filePath, matter.stringify(parsed.content, cleanFrontmatter(parsed.data)), 'utf8');
          imgOk++;
        } catch (err) {
          console.warn(`  photo failed for ${name}: ${err.message}`);
          delete parsed.data.photo;
          await writeFile(filePath, matter.stringify(parsed.content, cleanFrontmatter(parsed.data)), 'utf8');
          imgFail++;
        }
      }),
    );
  }

  // Download PDFs — only direct .pdf URLs or arxiv.org/pdf/ links
  // ~34/43 publications link to DOI records or publisher pages — left as external (MIG-05 narrowed invariant)
  const pubFiles = (await readdir(PUBS_DIR)).filter(f => f.endsWith('.mdx'));
  for (const file of pubFiles) {
    const filePath = path.join(PUBS_DIR, file);
    const raw = await readFile(filePath, 'utf8');
    const parsed = matter(raw);
    const pdfVal = parsed.data.pdf;

    if (!pdfVal || !isExternalUrl(pdfVal)) {
      pdfSkipped++;
      continue;
    }
    if (!/\.pdf(\?|$)/i.test(pdfVal) && !/arxiv\.org\/pdf/i.test(pdfVal)) {
      pdfSkipped++;
      continue;
    }

    const slug = file.replace(/\.mdx$/, '');
    const dest = path.join(PDF_DIR, slug + '.pdf');
    const localPath = `/pdfs/${slug}.pdf`;

    jobs.push(
      limit(async () => {
        try {
          await downloadToFile(pdfVal, dest);
          parsed.data.pdf = localPath;
          await writeFile(filePath, matter.stringify(parsed.content, cleanFrontmatter(parsed.data)), 'utf8');
          pdfOk++;
        } catch (err) {
          console.warn(`  pdf failed for ${file}: ${err.message}`);
          pdfFail++;
        }
      }),
    );
  }

  await Promise.all(jobs);
  return { imgOk, imgFail, pdfOk, pdfFail, pdfSkipped };
}
