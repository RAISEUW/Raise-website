import matter from 'gray-matter';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { cleanFrontmatter } from '../lib/mdx.mjs';

const PEOPLE_DIR = 'src/content/people';
const PUBS_DIR = 'src/content/publications';
const EVENTS_DIR = 'src/content/events';

async function readCollection(dir) {
  const files = (await readdir(dir)).filter(f => f.endsWith('.mdx'));
  const entries = [];
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), 'utf8');
    const parsed = matter(raw);
    entries.push({
      id: f.replace(/\.mdx$/, ''),
      data: parsed.data,
      content: parsed.content,
      path: path.join(dir, f),
    });
  }
  return entries;
}

function nameKey(s) {
  return (s ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export async function wireLinks() {
  const people = await readCollection(PEOPLE_DIR);
  const pubs = await readCollection(PUBS_DIR);
  const events = await readCollection(EVENTS_DIR);

  let pubLinks = 0, talkLinks = 0;

  for (const person of people) {
    const personKey = nameKey(person.data.name);
    const linkedPubs = pubs
      .filter(p => (p.data.authors ?? []).some(a => nameKey(a) === personKey))
      .map(p => p.id);
    const linkedTalks = events
      .filter(e => nameKey(e.data.speaker) === personKey)
      .map(e => e.id);

    if (
      linkedPubs.length === 0 &&
      linkedTalks.length === 0 &&
      (person.data.linkedPublications ?? []).length === 0 &&
      (person.data.linkedTalks ?? []).length === 0
    ) {
      continue;
    }

    person.data.linkedPublications = linkedPubs;
    person.data.linkedTalks = linkedTalks;

    await writeFile(
      person.path,
      matter.stringify(person.content, cleanFrontmatter(person.data)),
      'utf8',
    );
    pubLinks += linkedPubs.length;
    talkLinks += linkedTalks.length;
  }

  return { pubLinks, talkLinks };
}
