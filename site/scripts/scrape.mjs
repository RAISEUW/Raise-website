#!/usr/bin/env node
import * as cheerio from 'cheerio';
import { parsePublications } from './parsers/publications.mjs';
import { parsePeople } from './parsers/people.mjs';

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
  // Plan 02-02 will add --events
  // Plan 02-03 will add --assets and --article
}

main().catch(err => { console.error(err); process.exit(1); });
