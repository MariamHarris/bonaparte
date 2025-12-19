const fs = require('fs');

const seedPath = process.argv[2] || 'database/mysql/02_seed.sql';
const sql = fs.readFileSync(seedPath, 'utf8');

function extractTuples(table) {
  const re = new RegExp(
    `INSERT\\s+IGNORE\\s+INTO\\s+${table}\\s*\\([^)]*\\)\\s*VALUES\\s*([\\s\\S]*?);`,
    'gi',
  );
  const blocks = [];
  let m;
  while ((m = re.exec(sql))) blocks.push(m[1]);

  const tuples = [];
  for (const b of blocks) {
    // Extract top-level (...) tuples even if values contain nested parentheses (e.g., NOW()).
    let depth = 0;
    let start = -1;
    let inQ = false;
    let qChar = '';
    let inBlockComment = false;
    for (let i = 0; i < b.length; i += 1) {
      const ch = b[i];
      const next = b[i + 1] || '';

      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false;
          i += 1;
        }
        continue;
      }

      // Skip SQL comments (best-effort) when not inside quotes.
      // Note: MySQL line comments are typically '-- ' (double dash + space).
      if (!inQ) {
        if (ch === '/' && next === '*') {
          inBlockComment = true;
          i += 1;
          continue;
        }
        if (ch === '-' && next === '-') {
          // Consume until newline.
          while (i < b.length && b[i] !== '\n') i += 1;
          continue;
        }
        if (ch === '#') {
          while (i < b.length && b[i] !== '\n') i += 1;
          continue;
        }
      }

      if (inQ) {
        if (ch === qChar && b[i - 1] !== '\\') inQ = false;
        continue;
      }
      if (ch === "'" || ch === '"') {
        inQ = true;
        qChar = ch;
        continue;
      }

      if (ch === '(') {
        if (depth === 0) start = i + 1;
        depth += 1;
        continue;
      }
      if (ch === ')') {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          tuples.push(b.slice(start, i));
          start = -1;
        }
      }
    }
  }
  return tuples;
}

function splitCsv(tuple) {
  const out = [];
  let cur = '';
  let inQ = false;
  let qChar = '';

  for (let i = 0; i < tuple.length; i += 1) {
    const ch = tuple[i];
    if (inQ) {
      cur += ch;
      if (ch === qChar && tuple[i - 1] !== '\\') inQ = false;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQ = true;
      qChar = ch;
      cur += ch;
      continue;
    }
    if (ch === ',') {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }

  if (cur.trim()) out.push(cur.trim());
  return out;
}

function unquote(v) {
  const s = String(v ?? '').trim();
  if (!s) return null;
  if (s.toUpperCase() === 'NULL') return null;
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    return s.slice(1, -1);
  }
  return s;
}

function dupes(arr) {
  const seen = new Set();
  const d = new Set();
  for (const x of arr) {
    if (seen.has(x)) d.add(x);
    else seen.add(x);
  }
  return [...d];
}

function showSome(label, arr) {
  console.log(label, arr.length);
  for (const x of arr.slice(0, 10)) console.log('  ', JSON.stringify(x));
  if (arr.length > 10) console.log('  ...');
}

const companies = extractTuples('companies')
  .map((t) => unquote(splitCsv(t)[0]))
  .filter(Boolean);
const companySet = new Set(companies);

const users = [];
const userCompanyRefs = [];
for (const t of extractTuples('users')) {
  const cols = splitCsv(t);
  const id = unquote(cols[0]);
  const role = unquote(cols[3]);
  const companyId = unquote(cols[4]);
  if (id) users.push(id);
  if (role === 'empresa' && companyId) userCompanyRefs.push({ userId: id, companyId });
}

const vacancies = [];
const vacancyCompanyRefs = [];
for (const t of extractTuples('vacancies')) {
  const cols = splitCsv(t);
  const id = unquote(cols[0]);
  const companyId = unquote(cols[1]);
  if (id) vacancies.push(id);
  if (id && companyId) vacancyCompanyRefs.push({ vacancyId: id, companyId });
}
const vacancySet = new Set(vacancies);

const interactions = [];
const interactionRefs = [];
for (const t of extractTuples('interactions')) {
  const cols = splitCsv(t);
  const id = unquote(cols[0]);
  const vacancyId = unquote(cols[1]);
  const companyId = unquote(cols[2]);
  if (id) interactions.push(id);
  if (id) interactionRefs.push({ interactionId: id, vacancyId, companyId });
}

const badUserRefs = userCompanyRefs.filter((r) => r.companyId && !companySet.has(r.companyId));
const badVacRefs = vacancyCompanyRefs.filter((r) => r.companyId && !companySet.has(r.companyId));
const badIntVac = interactionRefs.filter((r) => r.vacancyId && !vacancySet.has(r.vacancyId));
const badIntCo = interactionRefs.filter((r) => r.companyId && !companySet.has(r.companyId));

console.log('--- Seed validation summary ---');
console.log('file:', seedPath);
console.log('companies:', companies.length, 'unique:', companySet.size, 'dupes:', dupes(companies).length);
console.log('users:', users.length, 'unique:', new Set(users).size, 'dupes:', dupes(users).length);
console.log('vacancies:', vacancies.length, 'unique:', vacancySet.size, 'dupes:', dupes(vacancies).length);
console.log('interactions:', interactions.length, 'unique:', new Set(interactions).size, 'dupes:', dupes(interactions).length);

showSome('bad user.company_id refs:', badUserRefs);
showSome('bad vacancy.company_id refs:', badVacRefs);
showSome('bad interaction.vacancy_id refs:', badIntVac);
showSome('bad interaction.company_id refs:', badIntCo);

const companyDupes = dupes(companies);
if (companyDupes.length) console.log('duplicate company ids (first 10):', companyDupes.slice(0, 10));
const vacancyDupes = dupes(vacancies);
if (vacancyDupes.length) console.log('duplicate vacancy ids (first 10):', vacancyDupes.slice(0, 10));
