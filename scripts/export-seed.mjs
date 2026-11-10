// Gera supabase/seed.sql a partir de src/dados/seed.ts (conteúdo demonstrativo).
// Uso: npm run seed:sql
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';

const out = await build({ entryPoints: ['src/dados/seed.ts'], bundle: true, format: 'esm', write: false, platform: 'node' });
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const q = (v) => (v === undefined || v === null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(',')}]::text[]`;
const rows = mod.SEED.map((i) =>
  `(${[q(i.id), q(i.type), q(i.title), q(i.summary), q(i.body), q(i.cover), q(i.area), q(i.category), arr(i.tags), q(i.level), q(i.duration), q(i.url), q(i.videoUrl), q(i.status), i.featured ? 'true' : 'false', i.demo ? 'true' : 'false', q(JSON.stringify(i.fields)) + '::jsonb'].join(', ')})`);
const groups = mod.SEED_GROUPS.map((g) => `(${[q(g.id), q(g.name), q(g.area), q(g.kind), q(g.description)].join(', ')})`);
writeFileSync('supabase/seed.sql', `-- Gerado por scripts/export-seed.mjs. Conteúdo DEMONSTRATIVO (fictício).\n-- Rode depois de schema.sql, no SQL Editor (como postgres, ignora RLS).\n\ninsert into public.content_items (id, type, title, summary, body, cover, area, category, tags, level, duration, url, video_url, status, featured, demo, fields) values\n${rows.join(',\n')}\non conflict (id) do nothing;\n\ninsert into public.communities (id, name, area, kind, description) values\n${groups.join(',\n')}\non conflict (id) do nothing;\n`);
console.log(`seed.sql: ${rows.length} conteúdos, ${groups.length} grupos`);
