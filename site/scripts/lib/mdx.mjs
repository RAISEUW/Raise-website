import matter from 'gray-matter';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Strip undefined/null/empty-string values so D-03 (omit-when-missing) is enforced.
// Use spread-conditional at call sites: ...(val && { field: val })
export function cleanFrontmatter(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (Array.isArray(v) && v.length === 0 && k !== 'researchAreas' && k !== 'topics') continue;
    out[k] = v;
  }
  return out;
}

export async function writeEntry({ dir, filename, frontmatter, body = '' }) {
  const clean = cleanFrontmatter(frontmatter);
  const mdx = matter.stringify(body, clean);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), mdx, 'utf8');
}
