// Transform data/catalog-raw.json (RainFocus rows) into a compact data/catalog.js
// and extract the curated AI/MCP calendar from ../AU2026-AI-MCP-calendar-v4.html into data/curated.js
// Usage: node scripts/build-catalog.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const strip = (h) => (h || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/\n{3,}/g, '\n\n').trim();

const raw = JSON.parse(readFileSync('data/catalog-raw.json', 'utf8'));
const TOPIC_ATTRS = new Set(['WhattopicsinterestyoumostSelectuptofive', 'Product', 'IndustrySegment', 'IndustryGroup', 'SessionSelectionTrack', 'AcceptedIndustry']);
const LEVEL_ATTR = 'Whatlevelofproficiencyappliestoyourcontent';
const out = [];
for (const r of raw) {
  const times = (r.times || []).filter(t => !t.isHidden).map(t => ({ date: t.date, s: t.startTimeMin, e: t.endTimeMin, room: t.room || '' }));
  if (!times.length && r.sessionTimeID) { /* row already flattened; nothing */ }
  const speakers = (r.participants || []).map(p => [
    [p.preferredFirstname || p.firstName, p.lastName].filter(Boolean).join(' '),
    p.jobTitle, p.companyName,
  ].filter(Boolean).join(', '));
  const topics = [], levels = [];
  for (const a of r.attributevalues || []) {
    if (TOPIC_ATTRS.has(a.attribute_id) && a.value && a.value !== 'Other') topics.push(a.value);
    if (a.attribute_id === LEVEL_ATTR && a.value) levels.push(a.value.split(' (')[0]);
  }
  out.push({
    code: r.code, id: r.sessionID, title: r.title, type: r.type,
    abstract: strip(r.abstract), speakers, times,
    topics: [...new Set(topics)], level: levels[0] || '',
    url: `https://conferences.autodesk.com/flow/autodesk/au2026/sessioncatalog/page/sessioncatalog/session/${r.sessionID}`,
  });
}
out.sort((a, b) => (a.times[0]?.date || '') < (b.times[0]?.date || '') ? -1 : 1);
writeFileSync('data/catalog.js', 'window.__CATALOG__=' + JSON.stringify(out) + ';\n');
const dates = {}; for (const s of out) for (const t of s.times) dates[t.date] = (dates[t.date] || 0) + 1;
console.log('catalog sessions', out.length, 'dates', dates, 'no-time', out.filter(s => !s.times.length).length);

const src = '../AU2026-AI-MCP-calendar-v4.html';
if (existsSync(src)) {
  const h = readFileSync(src, 'utf8');
  const m = h.match(/window\.__DATA__=(\{.*?\});\n/s);
  const d = JSON.parse(m[1]);
  writeFileSync('data/curated.js', 'window.__CURATED__=' + JSON.stringify(d) + ';\n');
  console.log('curated sessions', d.S.length);
}
