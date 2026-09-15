// Fetch the full AU 2026 session catalog from the public RainFocus search API
// (same endpoint the "Digital" tab of the AU catalog uses; no login needed).
// Usage: node scripts/fetch-catalog.mjs   -> writes data/catalog.json + data/catalog-raw.json
import { writeFileSync, mkdirSync } from 'node:fs';

const API = 'https://attend.autodesk.com/api/search';
const HEADERS = {
  rfApiProfileId: 'aKTLFC98YJnUpg8C5UmdOLQAySZveYg6',
  rfWidgetId: '1767993912521015mJ1c',
  Referer: 'https://conferences.autodesk.com/flow/autodesk/au2026/sessioncatalog/page/digital',
  Origin: 'https://conferences.autodesk.com',
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
};
const SIZE = 50;

async function page(from) {
  const res = await fetch(API, { method: 'POST', headers: HEADERS, body: `type=session&size=${SIZE}&from=${from}` });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  const sec = d.sectionList ? (d.sectionList[0] || {}) : d;
  return { total: sec.total ?? d.totalSearchItems ?? 0, items: sec.items || [] };
}

const first = await page(0);
let items = first.items;
const total = first.total;
process.stdout.write(`total ${total}; fetched ${items.length}`);
for (let from = SIZE; from < total; from += SIZE) {
  const p = await page(from);
  items = items.concat(p.items);
  process.stdout.write(`, ${items.length}`);
}
console.log();
mkdirSync('data', { recursive: true });
writeFileSync('data/catalog-raw.json', JSON.stringify(items));
console.log('wrote data/catalog-raw.json');
