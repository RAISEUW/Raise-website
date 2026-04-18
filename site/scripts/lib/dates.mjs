import { parse as parseFns, isValid } from 'date-fns';

const FORMATS = [
  'd MMMM yyyy',      // "7 June 2025"
  'd MMM yyyy',       // "8 Apr 2025"
  'MMMM d, yyyy',     // "April 19, 2023"
  'MMMM dd, yyyy',    // "October 08, 2023"
  'MMM d yyyy',       // event fallback after ordinal strip
  'MMM dd yyyy',
  'yyyy-MM-dd',
];

export function parseDate(raw) {
  if (!raw) return undefined;
  // Strip ordinal suffixes (1st, 2nd, 3rd, 4th, AND the "3th" typo from source)
  const cleaned = raw.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
  for (const fmt of FORMATS) {
    const d = parseFns(cleaned, fmt, new Date());
    if (isValid(d)) return d;
  }
  return undefined;  // omit when unparseable (D-03)
}
