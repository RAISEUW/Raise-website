import slug from 'slug';

const seen = new Map();  // slug to count

// Keep slugs short: take first 6 words of title, slugify, dedupe with -2/-3 suffixes.
export function makeSlug(title, hint) {
  const base = slug(title.split(/\s+/).slice(0, 6).join(' '), { lower: true });
  const candidate = hint ? `${base}-${slug(hint, { lower: true })}` : base;
  const count = (seen.get(candidate) ?? 0) + 1;
  seen.set(candidate, count);
  return count === 1 ? candidate : `${candidate}-${count}`;
}

export function resetSlugCache() { seen.clear(); }
