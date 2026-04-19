#!/usr/bin/env node
import * as cheerio from 'cheerio';
import { parsePublications } from './parsers/publications.mjs';
import { parsePeople } from './parsers/people.mjs';
import { parseEvents } from './parsers/events.mjs';
import { downloadAssets } from './parsers/assets.mjs';
import { wireLinks } from './parsers/links.mjs';

const UA = 'RAISE-content-migration/1.0 (https://raise.uw.edu)';

async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return cheerio.load(await res.text());
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const runAll = args.size === 0 || args.has('--all');

  if (runAll || args.has('--publications')) {
    console.log('Scraping publications...');
    const $ = await fetchPage('https://raise.uw.edu/publications/');
    const count = await parsePublications($);
    console.log(`  Wrote ${count} publications`);
  }

  if (runAll || args.has('--people')) {
    console.log('Scraping people...');
    const $ = await fetchPage('https://raise.uw.edu/people/');
    const count = await parsePeople($);
    console.log(`  Wrote ${count} people`);
  }

  if (runAll || args.has('--events')) {
    console.log('Scraping events...');
    const $ = await fetchPage('https://raise.uw.edu/talksevents/');
    const count = await parseEvents($);
    console.log(`  Wrote ${count} events`);
  }
  if (runAll || args.has('--assets')) {
    console.log('Downloading assets...');
    const result = await downloadAssets();
    console.log(`  Photos: ${result.imgOk} ok, ${result.imgFail} failed`);
    console.log(`  PDFs: ${result.pdfOk} ok, ${result.pdfFail} failed, ${result.pdfSkipped} skipped (external-only)`);
  }

  if (runAll || args.has('--links')) {
    console.log('Wiring linkedPublications / linkedTalks...');
    const result = await wireLinks();
    console.log(`  ${result.pubLinks} publication links, ${result.talkLinks} talk links`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
