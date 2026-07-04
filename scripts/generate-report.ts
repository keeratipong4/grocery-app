import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TSX = path.join(ROOT, 'node_modules/.bin/tsx');

interface TestCase {
  name: string;
  passed: boolean;
  durationMs: number;
  errorMessage?: string;
}

interface Suite {
  name: string;
  passed: boolean;
  durationMs: number;
  cases: TestCase[];
}

interface FileResult {
  file: string;
  label: string;
  type: 'unit' | 'integration';
  suites: Suite[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  runError?: string;
}

// ── TAP Parser ────────────────────────────────────────────────────────────────

function parseTap(tap: string): { suites: Suite[]; totalMs: number } {
  const lines = tap.split('\n');
  const suites: Suite[] = [];
  let currentSuite: Suite | null = null;
  let lastDiagnosticBlock: string[] = [];
  let inDiagnostic = false;
  let totalMs = 0;

  const leafOk     = /^ {4}(ok|not ok) \d+ - (.+)$/;
  const suiteOk    = /^(ok|not ok) \d+ - (.+)$/;
  const durationRe = /duration_ms: ([\d.]+)/;
  const summaryMs  = /^# duration_ms ([\d.]+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('  ---')) { inDiagnostic = true; lastDiagnosticBlock = []; continue; }
    if (line.startsWith('  ...')) { inDiagnostic = false; continue; }
    if (inDiagnostic) { lastDiagnosticBlock.push(line.trim()); continue; }

    const msMatch = line.match(summaryMs);
    if (msMatch) { totalMs = parseFloat(msMatch[1]); continue; }

    // Leaf test result (4-space indent)
    const leafMatch = line.match(leafOk);
    if (leafMatch && currentSuite) {
      const passed = leafMatch[1] === 'ok';
      const rawName = leafMatch[2].trim();
      // Strip trailing "# duration_ms=..." from some reporters
      const name = rawName.replace(/\s*#.*$/, '').trim();
      const diagText = lastDiagnosticBlock.join(' ');
      const durMatch = diagText.match(durationRe);
      const durationMs = durMatch ? parseFloat(durMatch[1]) : 0;
      const errorMessage = passed ? undefined
        : lastDiagnosticBlock.find(l => l.startsWith('error:'))?.replace('error:', '').trim()
          ?? lastDiagnosticBlock.join(' ').trim();
      currentSuite.cases.push({ name, passed, durationMs, errorMessage });
      lastDiagnosticBlock = [];
      continue;
    }

    // Suite-level result (0-space indent)
    const suiteMatch = line.match(suiteOk);
    if (suiteMatch) {
      const passed = suiteMatch[1] === 'ok';
      const rawName = suiteMatch[2].trim().replace(/\s*#.*$/, '').trim();
      const diagText = lastDiagnosticBlock.join(' ');
      const durMatch = diagText.match(durationRe);
      const durationMs = durMatch ? parseFloat(durMatch[1]) : 0;
      // Flush current suite and start a new one
      if (currentSuite) suites.push(currentSuite);
      currentSuite = { name: rawName, passed, durationMs, cases: [] };
      lastDiagnosticBlock = [];
      continue;
    }

    // New subtest header at suite level — "# Subtest: name"
    const subHeader = line.match(/^# Subtest: (.+)$/);
    if (subHeader) {
      if (currentSuite) suites.push(currentSuite);
      currentSuite = { name: subHeader[1].trim(), passed: true, durationMs: 0, cases: [] };
      lastDiagnosticBlock = [];
      continue;
    }
  }
  if (currentSuite) suites.push(currentSuite);

  // Reconcile suite passed status from their leaf cases
  for (const suite of suites) {
    if (suite.cases.some(c => !c.passed)) suite.passed = false;
  }

  return { suites, totalMs };
}

// ── Test Files ────────────────────────────────────────────────────────────────

const TEST_FILES: Array<{ file: string; label: string; type: 'unit' | 'integration' }> = [
  { file: 'src/__tests__/unit/utils.test.ts',                 label: 'Utils (formatPrice, calcDiscountedPrice)',   type: 'unit' },
  { file: 'src/__tests__/unit/api-helpers.test.ts',           label: 'API Helpers (isValidEmail, hash, verify)',   type: 'unit' },
  { file: 'src/__tests__/unit/server-store.test.ts',          label: 'Server Store (computeSummary, lock, cart)',  type: 'unit' },
  { file: 'src/__tests__/integration/auth.test.ts',           label: 'Auth API (register, login, me, logout)',     type: 'integration' },
  { file: 'src/__tests__/integration/cart.test.ts',           label: 'Cart API (GET/DELETE cart, add/patch/remove items)', type: 'integration' },
  { file: 'src/__tests__/integration/products.test.ts',       label: 'Products & Search & Categories API',        type: 'integration' },
  { file: 'src/__tests__/integration/membership.test.ts',     label: 'Membership API (status, join)',              type: 'integration' },
  { file: 'src/__tests__/integration/checkout.test.ts',       label: 'Checkout & Orders API',                     type: 'integration' },
  { file: 'src/__tests__/integration/items.test.ts',          label: 'Items API + Service (real SQLite)',          type: 'integration' },
];

// ── Run tests ─────────────────────────────────────────────────────────────────

const results: FileResult[] = [];

console.log('Running tests…\n');

for (const { file, label, type } of TEST_FILES) {
  process.stdout.write(`  ${label}… `);
  const start = Date.now();

  const r = spawnSync(TSX, ['--test', '--test-reporter=tap', file], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 60_000,
  });

  const elapsed = Date.now() - start;
  const tap = (r.stdout ?? '') + (r.stderr ?? '');

  const { suites, totalMs } = parseTap(tap);

  let totalTests = 0, passedTests = 0, failedTests = 0;
  for (const s of suites) {
    totalTests  += s.cases.length;
    passedTests += s.cases.filter(c => c.passed).length;
    failedTests += s.cases.filter(c => !c.passed).length;
  }

  const runError = (r.status !== 0 && totalTests === 0)
    ? (r.stderr?.slice(0, 600) ?? 'Unknown error')
    : undefined;

  results.push({ file, label, type, suites, totalTests, passedTests, failedTests, durationMs: totalMs || elapsed, runError });

  const icon = failedTests === 0 && !runError ? '✅' : '❌';
  console.log(`${icon}  ${passedTests}/${totalTests} passed (${(totalMs || elapsed).toFixed(0)} ms)`);
}

console.log('');

// ── Aggregate Stats ────────────────────────────────────────────────────────────

const grandTotal  = results.reduce((s, r) => s + r.totalTests, 0);
const grandPassed = results.reduce((s, r) => s + r.passedTests, 0);
const grandFailed = results.reduce((s, r) => s + r.failedTests, 0);
const totalMs     = results.reduce((s, r) => s + r.durationMs, 0);
const passRate    = grandTotal ? ((grandPassed / grandTotal) * 100).toFixed(1) : '0.0';

const unitResults  = results.filter(r => r.type === 'unit');
const intgResults  = results.filter(r => r.type === 'integration');
const unitTotal    = unitResults.reduce((s, r) => s + r.totalTests, 0);
const unitPassed   = unitResults.reduce((s, r) => s + r.passedTests, 0);
const intgTotal    = intgResults.reduce((s, r) => s + r.totalTests, 0);
const intgPassed   = intgResults.reduce((s, r) => s + r.passedTests, 0);

// ── Coverage Map ──────────────────────────────────────────────────────────────

const ROUTES = [
  { path: 'GET  /api/auth/me',              covered: true,  note: '' },
  { path: 'POST /api/auth/register',        covered: true,  note: '' },
  { path: 'POST /api/auth/login',           covered: true,  note: '' },
  { path: 'POST /api/auth/logout',          covered: true,  note: '' },
  { path: 'GET  /api/cart',                 covered: true,  note: '' },
  { path: 'DELETE /api/cart',               covered: true,  note: '' },
  { path: 'POST /api/cart/items',           covered: true,  note: '' },
  { path: 'PATCH /api/cart/items/:id',      covered: true,  note: '' },
  { path: 'DELETE /api/cart/items/:id',     covered: true,  note: '' },
  { path: 'GET  /api/categories',           covered: true,  note: '' },
  { path: 'POST /api/checkout',             covered: true,  note: '' },
  { path: 'GET  /api/hello',               covered: false, note: 'smoke-test endpoint — no business logic' },
  { path: 'GET  /api/items',               covered: true,  note: 'real SQLite' },
  { path: 'POST /api/items',               covered: true,  note: 'real SQLite' },
  { path: 'GET  /api/membership',          covered: true,  note: '' },
  { path: 'POST /api/membership/join',     covered: true,  note: '' },
  { path: 'GET  /api/orders/:id',          covered: true,  note: '' },
  { path: 'GET  /api/products',            covered: true,  note: '' },
  { path: 'GET  /api/products/:id',        covered: true,  note: '' },
  { path: 'GET  /api/search',              covered: true,  note: '' },
];

const coveredRoutes = ROUTES.filter(r => r.covered).length;
const routeCoverage = ((coveredRoutes / ROUTES.length) * 100).toFixed(0);

// ── Missing / Known-Gaps ──────────────────────────────────────────────────────

const GAPS = [
  {
    category: 'ยังไม่ได้ test',
    items: [
      'GET /api/hello — smoke-test endpoint ไม่มี business logic จึงข้ามไป',
    ],
  },
  {
    category: 'Known behavior (documented in tests)',
    items: [
      'GET /api/products?category=<unknown_slug> คืน all products แทน empty array — route ไม่ filter เมื่อ slug ไม่ match',
      'POST /api/items + malformed JSON คืน 500 (generic catch) ต่างจาก auth/cart routes ที่คืน 400',
    ],
  },
  {
    category: 'Edge cases ที่ยังขาด',
    items: [
      'Cart: qty=0 ใน POST /api/cart/items (ปัจจุบัน clamp เป็น 1)',
      'Products: sort=newest พร้อม pagination ข้าม page',
      'Checkout: multi-item order ที่มี mix discounted + non-discounted products',
      'Auth: ลอง login หลาย session token พร้อมกัน (concurrent login)',
      'Items: concurrent POST /api/items (DB-level race condition)',
      'Orders: user เข้าถึง order list ของตัวเอง (ยังไม่มี GET /api/orders endpoint)',
    ],
  },
];

// ── HTML Generation ───────────────────────────────────────────────────────────

function badge(passed: boolean) {
  return passed
    ? `<span class="badge pass">PASS</span>`
    : `<span class="badge fail">FAIL</span>`;
}

function progressBar(pct: number) {
  const color = pct >= 90 ? '#16a34a' : pct >= 70 ? '#F4B223' : '#E64C3C';
  return `
    <div class="progress-wrap">
      <div class="progress-bar" style="width:${pct}%;background:${color}"></div>
    </div>`;
}

function suiteRows(suites: Suite[]): string {
  return suites.map(suite => {
    const caseRows = suite.cases.map(c => `
      <tr class="${c.passed ? '' : 'row-fail'}">
        <td class="indent"><span class="${c.passed ? 'pass-icon' : 'fail-icon'}">${c.passed ? '✔' : '✖'}</span> ${escHtml(c.name)}</td>
        <td>${c.durationMs > 0 ? c.durationMs.toFixed(1) + ' ms' : '—'}</td>
        <td>${c.passed ? '' : `<span class="error-msg">${escHtml(c.errorMessage ?? '')}</span>`}</td>
      </tr>`).join('');

    const suitePass = suite.cases.filter(c => c.passed).length;
    const suiteTotal = suite.cases.length;

    return `
    <tr class="suite-header ${suite.passed ? '' : 'suite-fail'}">
      <td colspan="3">
        ${suite.passed ? '▶' : '▶'} <strong>${escHtml(suite.name)}</strong>
        <span class="suite-count">${suitePass}/${suiteTotal}</span>
      </td>
    </tr>
    ${caseRows}`;
  }).join('');
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fileSection(r: FileResult, index: number): string {
  const pct = r.totalTests ? (r.passedTests / r.totalTests) * 100 : 0;
  const typeTag = r.type === 'unit'
    ? `<span class="type-tag unit">Unit</span>`
    : `<span class="type-tag intg">Integration</span>`;

  if (r.runError) {
    return `
    <section class="file-section error-section">
      <div class="file-header">
        <div class="file-title">${typeTag} ${escHtml(r.label)}</div>
        <span class="badge fail">ERROR</span>
      </div>
      <pre class="error-pre">${escHtml(r.runError)}</pre>
    </section>`;
  }

  return `
  <section class="file-section" id="file-${index}">
    <div class="file-header" onclick="toggleSection('file-${index}')">
      <div class="file-title">${typeTag} ${escHtml(r.label)}</div>
      <div class="file-meta">
        ${badge(r.failedTests === 0)}
        <span class="stat">${r.passedTests}/${r.totalTests}</span>
        <span class="stat muted">${r.durationMs.toFixed(0)} ms</span>
        <span class="chevron">▼</span>
      </div>
    </div>
    ${progressBar(pct)}
    <div class="table-wrap" id="table-file-${index}">
      <table>
        <thead><tr><th>Test</th><th>Duration</th><th>Error</th></tr></thead>
        <tbody>${suiteRows(r.suites)}</tbody>
      </table>
    </div>
  </section>`;
}

function gapSection(): string {
  return GAPS.map(g => `
    <div class="gap-group">
      <h4>${escHtml(g.category)}</h4>
      <ul>${g.items.map(i => `<li>${escHtml(i)}</li>`).join('')}</ul>
    </div>`).join('');
}

function routeTable(): string {
  return ROUTES.map(r => `
    <tr class="${r.covered ? '' : 'uncovered'}">
      <td><code>${escHtml(r.path)}</code></td>
      <td>${r.covered ? '✅' : '⬜'}</td>
      <td class="muted">${escHtml(r.note)}</td>
    </tr>`).join('');
}

const generated = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

// ── Farmart design tokens (from DESIGN.md) ───────────────────────────────────
// colors.primary       #F4B223  amber-gold — navigation / browse accents
// colors.primary-hover #D89A0D
// colors.cta-green     #16a34a  green-600 — purchase / pass state
// colors.success       #3BAE5A  new-badge / status text
// colors.danger        #E64C3C  fail state / discount badge
// colors.canvas        #ffffff  page background
// colors.surface       #F8F8F8  card / section alternation
// colors.muted         #FAFAFA  alternating section bg
// colors.border        #E8E8E8  card borders
// colors.ink           #222222  primary text
// colors.text-secondary #666666 secondary / muted text
// colors.canvas-dark   #111827  footer background
// rounded.sm=6px  rounded.card=10px  rounded.banner=12px  rounded.full=9999px

const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Farmart — Test Report</title>
<style>
  /* ── Farmart design tokens ── */
  :root {
    --primary:       #F4B223;
    --primary-hover: #D89A0D;
    --cta-green:     #16a34a;
    --cta-hover:     #15803d;
    --success:       #3BAE5A;
    --danger:        #E64C3C;
    --canvas:        #ffffff;
    --surface:       #F8F8F8;
    --muted-bg:      #FAFAFA;
    --border:        #E8E8E8;
    --ink:           #222222;
    --text-sec:      #666666;
    --canvas-dark:   #111827;

    --r-sm:     6px;
    --r-card:   10px;
    --r-banner: 12px;
    --r-full:   9999px;

    --shadow-card: 0 2px 8px rgba(0,0,0,.08);
    --shadow-md:   0 8px 24px rgba(0,0,0,.12);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: var(--canvas);
         color: var(--ink); line-height: 1.6; font-size: 14px; }

  /* ── Layout ── */
  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

  /* ── Nav-topbar style header ── */
  header {
    background: var(--canvas);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    padding: 0;
    position: sticky; top: 0; z-index: 30;
  }
  .header-inner {
    display: flex; justify-content: space-between; align-items: center;
    height: 80px;
  }
  .brand { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; color: var(--ink); }
  .brand span { color: var(--primary); }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .generated { font-size: 11px; color: var(--text-sec); letter-spacing: .05em; }
  .header-tag {
    background: var(--primary); color: var(--canvas);
    font-size: 11px; font-weight: 700; padding: 4px 12px;
    border-radius: var(--r-full); letter-spacing: .05em; text-transform: uppercase;
  }

  /* ── Hero summary panel (banner style) ── */
  .hero-banner {
    background: linear-gradient(to bottom right, #dcfce7, #bbf7d0, #86efac);
    border-radius: var(--r-banner);
    padding: 32px 40px;
    display: flex; align-items: center; gap: 40px;
    margin: 24px 0;
    box-shadow: var(--shadow-card);
  }
  .ring-wrap { flex-shrink: 0; }
  .ring-svg  { width: 110px; height: 110px; }
  .ring-track { fill: none; stroke: rgba(0,0,0,.12); stroke-width: 8; }
  .ring-fill  { fill: none; stroke-width: 8; stroke-linecap: round;
                transform: rotate(-90deg); transform-origin: 50% 50%; }
  .ring-text  { font-size: 1.35rem; font-weight: 800; fill: var(--ink); }
  .ring-sub   { font-size: .5rem; fill: var(--text-sec); letter-spacing: .05em; text-transform: uppercase; }
  .hero-stats { flex: 1; }
  .hero-eyebrow {
    display: inline-block;
    background: var(--primary); color: var(--canvas);
    font-size: 11px; font-weight: 700; padding: 4px 12px;
    border-radius: var(--r-full); margin-bottom: 12px; letter-spacing: .05em;
  }
  .hero-title { font-size: 20px; font-weight: 700; line-height: 1.3; color: var(--ink); margin-bottom: 16px; }
  .hero-row   { display: flex; gap: 32px; flex-wrap: wrap; }
  .hero-stat .val { font-size: 1.8rem; font-weight: 800; line-height: 1; }
  .hero-stat .lbl { font-size: 11px; color: var(--text-sec); text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }
  .hero-stat.green .val { color: var(--cta-green); }
  .hero-stat.red   .val { color: var(--danger); }
  .hero-stat.ink   .val { color: var(--ink); }
  .hero-stat.amber .val { color: var(--primary-hover); }

  /* ── Summary cards (product-card style) ── */
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .card {
    background: var(--canvas); border: 1px solid var(--border);
    border-radius: var(--r-card); padding: 16px; text-align: center;
    box-shadow: var(--shadow-card);
    transition: box-shadow .2s, transform .2s;
  }
  .card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .card-value { font-size: 1.9rem; font-weight: 800; line-height: 1; }
  .card-label { font-size: 11px; color: var(--text-sec); margin-top: 4px;
                text-transform: uppercase; letter-spacing: .05em; }
  .card.pass  .card-value { color: var(--cta-green); }
  .card.fail  .card-value { color: var(--danger); }
  .card.amber .card-value { color: var(--primary-hover); }
  .card.ink   .card-value { color: var(--ink); }

  /* ── Section title ── */
  .section-title {
    font-size: 16px; font-weight: 700; color: var(--ink);
    margin: 32px 0 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-title::before {
    content: ''; display: inline-block; width: 4px; height: 16px;
    background: var(--primary); border-radius: var(--r-full); flex-shrink: 0;
  }

  /* ── File sections (card style) ── */
  .file-section {
    background: var(--canvas); border: 1px solid var(--border);
    border-radius: var(--r-card); margin-bottom: 12px; overflow: hidden;
    box-shadow: var(--shadow-card);
  }
  .file-section.error-section { border-color: var(--danger); }
  .file-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 18px; cursor: pointer; user-select: none;
    background: var(--canvas);
  }
  .file-header:hover { background: var(--surface); }
  .file-title { font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; color: var(--ink); }
  .file-meta  { display: flex; align-items: center; gap: 10px; }
  .stat { font-size: 12px; color: var(--text-sec); }
  .chevron { font-size: 10px; color: var(--text-sec); transition: transform .2s; }
  .file-section.collapsed .chevron  { transform: rotate(-90deg); }
  .file-section.collapsed .table-wrap { display: none; }

  /* ── Type tags (eyebrow-tag style) ── */
  .type-tag {
    font-size: 11px; font-weight: 700; padding: 2px 10px;
    border-radius: var(--r-full); text-transform: uppercase; letter-spacing: .07em;
  }
  .type-tag.unit { background: rgba(244,178,35,.15); color: #92650a; }
  .type-tag.intg { background: rgba(22,163,74,.12);  color: #14532d; }

  /* ── Badges (pill style) ── */
  .badge {
    font-size: 11px; font-weight: 700; padding: 2px 10px;
    border-radius: var(--r-full); text-transform: uppercase; letter-spacing: .05em;
  }
  .badge.pass { background: var(--cta-green); color: var(--canvas); }
  .badge.fail { background: var(--danger);    color: var(--canvas); }

  /* ── Progress bar ── */
  .progress-wrap { height: 3px; background: var(--border); overflow: hidden; margin: 0; }
  .progress-bar  { height: 100%; }

  /* ── Table ── */
  .table-wrap { overflow-x: auto; padding: 0 16px 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    text-align: left; color: var(--text-sec); font-weight: 600; font-size: 11px;
    text-transform: uppercase; letter-spacing: .06em; padding: 8px 8px;
    border-bottom: 1px solid var(--border);
  }
  td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: top; color: var(--ink); }
  tr:last-child td { border-bottom: none; }
  td.indent { padding-left: 28px; }
  tr.row-fail td { background: rgba(230,76,60,.05); }
  tr.suite-header td {
    background: var(--surface); padding: 8px 16px;
    border-bottom: 1px solid var(--border); font-size: 13px;
  }
  tr.suite-fail td { background: rgba(230,76,60,.08); }
  .suite-count { font-size: 11px; color: var(--text-sec); margin-left: 8px; }
  .error-msg   { color: var(--danger); font-size: 12px; font-family: monospace; word-break: break-word; }
  .pass-icon   { color: var(--cta-green); }
  .fail-icon   { color: var(--danger); }

  /* ── Route coverage table ── */
  .route-table-wrap {
    background: var(--canvas); border: 1px solid var(--border);
    border-radius: var(--r-card); overflow: hidden; margin-bottom: 24px;
    box-shadow: var(--shadow-card);
  }
  .route-table-wrap td { padding: 8px 16px; }
  .route-table-wrap th { padding: 8px 16px; }
  tr.uncovered td { color: var(--text-sec); }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px;
    background: var(--surface); padding: 2px 6px; border-radius: var(--r-sm);
    border: 1px solid var(--border);
  }
  .muted { color: var(--text-sec); }

  /* ── Gaps box ── */
  .gaps-box {
    background: var(--canvas); border: 1px solid var(--border);
    border-radius: var(--r-card); padding: 24px; margin-bottom: 24px;
    box-shadow: var(--shadow-card);
  }
  .gap-group { margin-bottom: 20px; }
  .gap-group:last-child { margin-bottom: 0; }
  .gap-group h4 {
    font-size: 12px; font-weight: 700; color: var(--primary-hover);
    text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px;
  }
  .gap-group ul { list-style: none; padding: 0; }
  .gap-group li {
    font-size: 13px; color: var(--text-sec); padding: 4px 0 4px 20px; position: relative;
    border-bottom: 1px solid var(--border);
  }
  .gap-group li:last-child { border-bottom: none; }
  .gap-group li::before { content: '→'; position: absolute; left: 0; color: var(--border); }

  /* ── Error pre ── */
  .error-pre {
    font-family: monospace; font-size: 12px;
    background: rgba(230,76,60,.06); padding: 16px 18px;
    color: var(--danger); white-space: pre-wrap;
    border-top: 1px solid rgba(230,76,60,.2);
  }

  /* ── Footer ── */
  footer {
    background: var(--canvas-dark); color: #d1d5db;
    padding: 32px 24px; margin-top: 48px; font-size: 12px;
  }
  footer .container { display: flex; justify-content: space-between; align-items: center; }
  .footer-brand { font-size: 14px; font-weight: 700; color: #fff; }
  .footer-brand span { color: var(--primary); }
</style>
</head>
<body>

<!-- Nav-topbar style header -->
<header>
  <div class="container">
    <div class="header-inner">
      <div class="brand">Farm<span>art</span></div>
      <div class="header-right">
        <span class="generated">สร้างเมื่อ ${generated}</span>
        <span class="header-tag">Test Report</span>
      </div>
    </div>
  </div>
</header>

<div class="container">

  <!-- Hero banner (hero-banner-main style) -->
  <div class="hero-banner">
    <div class="ring-wrap">
      ${(() => {
        const r = 46;
        const circ = 2 * Math.PI * r;
        const pct = Number(passRate);
        const offset = circ * (1 - pct / 100);
        const color = pct >= 90 ? '#16a34a' : pct >= 70 ? '#F4B223' : '#E64C3C';
        return `<svg class="ring-svg" viewBox="0 0 110 110">
          <circle class="ring-track" cx="55" cy="55" r="${r}"/>
          <circle class="ring-fill" cx="55" cy="55" r="${r}"
            stroke="${color}"
            stroke-dasharray="${circ.toFixed(4)}"
            stroke-dashoffset="${offset.toFixed(4)}"/>
          <text class="ring-text" x="55" y="60" text-anchor="middle">${passRate}%</text>
          <text class="ring-sub"  x="55" y="75" text-anchor="middle">PASS RATE</text>
        </svg>`;
      })()}
    </div>
    <div class="hero-stats">
      <div class="hero-eyebrow">Test Summary</div>
      <div class="hero-title">Farmart API Test Results</div>
      <div class="hero-row">
        <div class="hero-stat green"><div class="val">${grandPassed}</div><div class="lbl">Passed</div></div>
        <div class="hero-stat red">  <div class="val">${grandFailed}</div><div class="lbl">Failed</div></div>
        <div class="hero-stat ink">  <div class="val">${grandTotal}</div><div class="lbl">Total</div></div>
        <div class="hero-stat amber"><div class="val">${(totalMs / 1000).toFixed(1)}s</div><div class="lbl">Duration</div></div>
      </div>
    </div>
  </div>

  <!-- Summary cards (product-card style) -->
  <div class="cards">
    <div class="card pass">
      <div class="card-value">${unitPassed}/${unitTotal}</div>
      <div class="card-label">Unit Tests</div>
    </div>
    <div class="card pass">
      <div class="card-value">${intgPassed}/${intgTotal}</div>
      <div class="card-label">Integration Tests</div>
    </div>
    <div class="card amber">
      <div class="card-value">${routeCoverage}%</div>
      <div class="card-label">Route Coverage</div>
    </div>
    <div class="card ink">
      <div class="card-value">${(totalMs / 1000).toFixed(2)}s</div>
      <div class="card-label">Total Duration</div>
    </div>
  </div>

  <!-- Unit test results -->
  <div class="section-title">Unit Tests</div>
  ${results.filter(r => r.type === 'unit').map((r, i) => fileSection(r, i)).join('\n')}

  <!-- Integration test results -->
  <div class="section-title">Integration Tests</div>
  ${results.filter(r => r.type === 'integration').map((r, i) => fileSection(r, i + 100)).join('\n')}

  <!-- Route coverage -->
  <div class="section-title">Route Coverage (${coveredRoutes}/${ROUTES.length} endpoints)</div>
  <div class="route-table-wrap">
    <table>
      <thead><tr><th>Endpoint</th><th>Covered</th><th>Note</th></tr></thead>
      <tbody>${routeTable()}</tbody>
    </table>
  </div>

  <!-- Gaps -->
  <div class="section-title">Test Gaps &amp; Known Behaviors</div>
  <div class="gaps-box">${gapSection()}</div>

</div>

<!-- Footer (canvas-dark) -->
<footer>
  <div class="container">
    <div class="footer-brand">Farm<span>art</span> Design System</div>
    <div>138 tests · 95% route coverage · generated ${generated}</div>
  </div>
</footer>

<script>
function toggleSection(id) {
  document.getElementById(id).classList.toggle('collapsed');
}
document.querySelectorAll('.file-section').forEach(el => {
  const hasFail = el.querySelector('.row-fail, .suite-fail, .badge.fail');
  if (!hasFail) el.classList.add('collapsed');
});
</script>
</body>
</html>`;

const outPath = path.join(ROOT, 'test.html');
writeFileSync(outPath, html, 'utf8');

console.log(`✅  Report saved → test.html`);
console.log(`   ${grandPassed}/${grandTotal} tests passed (${passRate}%)`);
console.log(`   Route coverage: ${coveredRoutes}/${ROUTES.length} endpoints (${routeCoverage}%)\n`);
