// Generates README screenshots + verifies the app runs without console errors.
// Usage: node scripts/screenshots.mjs [url]  (default http://localhost:5173)
// Requires: npm i --no-save playwright @sparticuz/chromium
import { chromium as pw } from 'playwright';
import chromium from '@sparticuz/chromium';
import fs from 'node:fs';
import path from 'node:path';

process.env.LD_LIBRARY_PATH = '/tmp/al2023x/lib'; // shared libs for the bundled chromium

const BASE = process.argv[2] ?? 'http://localhost:5173';
const OUT = path.resolve('docs/screenshots');
fs.mkdirSync(OUT, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

const browser = await pw.launch({
  executablePath: await chromium.executablePath(),
  args: [...chromium.args, '--font-render-hinting=none'],
  headless: true,
  timezoneId: 'Asia/Kolkata',
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const page = await browser.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => pageErrors.push(String(err)));

const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dstr = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ── 1. Onboarding ─────────────────────────────────────────────────────────────
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('text=Welcome to your Command Center');
await shot('01-onboarding');
await page.click('text=Continue');
await sleep(200);
await page.click('text=Continue');
await sleep(200);
await page.click('text=Generate my week');
await page.waitForSelector('text=Start My Day');
await shot('02-start-my-day');

// ── 2. Seed a realistic 12-day history through localStorage ──────────────────
await page.evaluate((today) => {
  const KEY = 'jhcc-state-v1';
  const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
  const s = raw.state;
  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const dstr = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayTasks = Object.values(s.tasks).filter((t) => t.date === today);

  // sessions + history for the last 12 days (skip one day to show grace)
  for (let i = 12; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (i === 6) continue; // one rest day — streaks forgive it
    const start = new Date(`${ds}T07:05:00`).getTime();
    const end = new Date(`${ds}T22:20:00`).getTime();
    s.sessions[ds] = {
      date: ds,
      startedAt: start,
      endedAt: end,
      review: { wentWell: 'Deep work block held', wentWrong: '', improve: 'Start DSA on time', sleepTime: '23:10' },
    };
    const dayFactor = i === 9 ? 0.55 : i === 3 ? 0.8 : 0.9;
    for (const t of todayTasks) {
      if (t.date !== today) continue;
      const clone = { ...t, id: uid('task'), date: ds, status: 'todo', focusSec: 0, completedAt: undefined };
      if (t.category === 'break') {
        s.tasks[clone.id] = clone;
        continue;
      }
      const r = Math.random();
      if (r < dayFactor) {
        clone.status = 'done';
        clone.completedAt = end;
        clone.focusSec = Math.round((Math.min(3600, 5400) * (0.6 + Math.random() * 0.5)) * (t.category === 'aiml' ? 2.2 : 1));
      } else if (r < dayFactor + 0.1) {
        clone.status = 'skipped';
      } else {
        clone.focusSec = 900 + Math.round(Math.random() * 1800);
      }
      s.tasks[clone.id] = clone;
    }
  }

  // today's session + partial progress
  s.sessions[today] = { date: today, startedAt: new Date(`${today}T07:02:00`).getTime() };
  const nowH = new Date().getHours();
  let doneCount = 0;
  for (const t of todayTasks) {
    if (t.category === 'break') continue;
    const endH = parseInt(t.end.slice(0, 2), 10);
    if (endH <= nowH - 1 && Math.random() < 0.85) {
      t.status = 'done';
      t.completedAt = Date.now();
      t.focusSec = 1500 + Math.round(Math.random() * 4200);
      doneCount++;
    }
  }

  // DSA entries (streak!)
  const topics = ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'Linked List', 'Trees', 'Heap / Priority Queue'];
  const problems = ['Valid Anagram', 'Top K Frequent Elements', 'Longest Consecutive Sequence', 'Valid Palindrome', '3Sum', 'Longest Substring Without Repeating Characters', 'Min Stack', 'Koko Eating Bananas', 'Reverse Linked List', 'Merge Two Sorted Lists', 'Same Tree', 'Last Stone Weight'];
  let pi = 0;
  for (let i = 13; i >= 0; i--) {
    if (i === 6 || i === 0) continue;
    const ds = dstr(-i);
    s.dsa.push({
      id: uid('dsa'), date: ds, problem: problems[pi % problems.length], difficulty: pi % 3 === 0 ? 'Easy' : 'Medium',
      topic: topics[pi % topics.length], minutes: 18 + (pi % 4) * 9, independent: pi % 5 !== 0, hints: pi % 5 === 0,
      insight: pi % 2 === 0 ? 'Reduce to a known pattern first; then handle edge cases.' : '',
      notes: '', link: '',
    });
    pi++;
  }
  for (const p of s.dsaCatalog) {
    if (problems.some((x) => x.toLowerCase() === p.name.toLowerCase())) p.solved = true;
  }

  // Books
  const bookTopics = ['Ch. 1 — The ML Landscape', 'Ch. 2 — End-to-End ML Project', 'Ch. 4 — Training Models', 'Ch. 5 — SVMs', 'Ch. 6 — Decision Trees', 'Ch. 7 — Ensembles', 'Ch. 8 — Dimensionality Reduction', 'Attention Is All You Need', 'Ch. 11 — Training Deep Nets'];
  let bi = 0;
  for (let i = 12; i >= 0; i--) {
    if (i === 6 || i === 0) continue;
    s.books.push({
      id: uid('book'), date: dstr(-i), book: 'Hands-On Machine Learning', topic: bookTopics[bi % bookTopics.length],
      pages: 14 + (bi % 3) * 6, keyConcepts: 'bias/variance tradeoff, regularization', learned: '',
      notes: '', canExplain: bi % 3 !== 0,
    });
    bi++;
  }

  // Jobs
  const companies = [
    ['Stripe', 'ML Engineer', 'LinkedIn', 'applied'],
    ['Notion', 'ML Engineer, Search', 'Referral', 'assessment'],
    ['Postman', 'Data Scientist', 'Careers page', 'interview'],
    ['Zoho', 'ML Engineer', 'LinkedIn', 'applied'],
    ['Freshworks', 'AI Engineer', 'AngelList', 'technical'],
    ['Razorpay', 'Applied Scientist', 'LinkedIn', 'applied'],
    ['Swiggy', 'ML Engineer', 'Referral', 'rejected'],
    ['Atlassian', 'Software Engineer, AI', 'Careers page', 'applied'],
  ];
  companies.forEach(([company, role, portal, status], idx) => {
    const id = uid('job');
    s.jobs[id] = {
      id, company, role, portal, dateApplied: dstr(-(idx + 1)), status,
      resumeVersion: 'v4-ml-focus', coverNote: '', followUpDate: idx % 3 === 0 ? dstr(2) : '',
      notes: '', createdAt: Date.now() - idx * 86400000, updatedAt: Date.now() - idx * 3600000,
    };
  });

  // Roadmap progress (first ~7 topics various stages)
  s.roadmap.topics.slice(0, 4).forEach((t, i) => {
    const stages = ['learn', 'build', 'practice', 'revise', 'teach'];
    stages.forEach((st, si) => {
      if (si <= 4 - i) { t.stages[st] = true; t.stageDates[st] = dstr(-(20 - si * 2)); }
    });
    t.isCurrent = i === 4;
  });
  s.roadmap.topics[4].stages.learn = true;
  s.roadmap.topics[4].stageDates.learn = dstr(-1);
  s.roadmap.topics.slice(5, 8).forEach((t, i) => {
    if (i < 2) { t.stages.learn = true; t.stageDates.learn = dstr(-(3 - i)); }
  });
  s.roadmap.topics.forEach((t) => { if (t.isCurrent && t.title !== 'Linear algebra essentials') t.isCurrent = false; });
  s.roadmap.topics[4].isCurrent = true;

  localStorage.setItem(KEY, JSON.stringify(raw));
}, dstr(0));

await page.reload({ waitUntil: 'networkidle' });
await sleep(800);

// ── 3. Today dashboard ────────────────────────────────────────────────────────
await page.waitForSelector('text=Today');
await shot('03-today-dashboard');

// ── 4. Focus mode ─────────────────────────────────────────────────────────────
await page.keyboard.press('f');
await sleep(900);
await shot('04-focus-mode');
await page.keyboard.press('Escape');
await sleep(300);

// ── 5. Sections ───────────────────────────────────────────────────────────────
const sections = [
  ['t', '05-tasks'],
  ['r', null], // roadmap needs click due to shortcut r
];
await page.keyboard.press('t');
await sleep(500);
await shot('05-tasks');

await page.click('nav[aria-label="Main navigation"] button:has-text("Roadmap")');
await sleep(600);
await shot('06-roadmap');

await page.click('nav[aria-label="Main navigation"] button:has-text("DSA")');
await sleep(600);
await shot('07-dsa');

await page.click('nav[aria-label="Main navigation"] button:has-text("Jobs")');
await sleep(600);
await shot('08-jobs');

await page.click('nav[aria-label="Main navigation"] button:has-text("Analytics")');
await sleep(1500);
await shot('09-analytics');

await page.click('nav[aria-label="Main navigation"] button:has-text("Review")');
await sleep(600);
await shot('10-weekly-review');

// ── 6. Light theme shot ───────────────────────────────────────────────────────
await page.click('nav[aria-label="Main navigation"] button:has-text("Today")');
await page.click('button[aria-label*="Theme"]');
await sleep(400);
await shot('11-today-light');
await page.click('button[aria-label*="Theme"]');
await sleep(200);

await browser.close();

console.log('\nConsole errors:', consoleErrors.length ? consoleErrors : 'none');
console.log('Page errors:', pageErrors.length ? pageErrors : 'none');
if (consoleErrors.length || pageErrors.length) process.exit(1);
console.log('Screenshots saved to', OUT);
