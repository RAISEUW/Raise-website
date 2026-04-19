import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const UA = 'RAISE-content-migration/1.0 (https://raise.uw.edu)';

export async function downloadToFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  await mkdir(path.dirname(destPath), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

export function extFromUrl(urlStr, fallback = '.jpg') {
  try {
    const urlPath = new URL(urlStr).pathname;
    const m = urlPath.match(/\.(jpg|jpeg|png|webp|gif|pdf)$/i);
    return m ? m[0].toLowerCase() : fallback;
  } catch {
    return fallback;
  }
}
