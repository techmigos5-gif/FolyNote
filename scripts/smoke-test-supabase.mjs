/**
 * Deployment smoke test for FolyNote's Supabase backend.
 *
 * Verifies the full mobile + PIN auth flow and data-plane security against a
 * live project, then deletes the test user (cascade removes their rows):
 *   1. Sign up  (tests: email confirmation disabled, synthetic email accepted)
 *   2. Profile  (tests: on_auth_user_created trigger auto-provisioned a row)
 *   3. Sign in  (tests: password grant works for the synthetic identity)
 *   4. Insert   (tests: RLS allows the owner to write their own row)
 *   5. Storage  (tests: private bucket upload + download on the owner path)
 *   6. Sign out (tests: anonymous access is denied — RLS blocks reads)
 *
 * Usage: node scripts/smoke-test-supabase.mjs
 * Requires VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in the environment
 * (loaded automatically from .env.local when present).
 * Optional: SUPABASE_SERVICE_ROLE_KEY lets the script delete its test user
 * afterwards (never commit this key; keep it shell-only).
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// --- tiny .env.local loader (key=value lines, # comments) -------------------
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (see .env.example)');
  process.exit(1);
}

const mobile = `55500${Math.floor(100000 + Math.random() * 899999)}`.slice(0, 11);
const pin = '987654';
const PIN_DIGIT_ALPHABET = 'abcdefghij';
const toEmail = (m) => `${m.replace(/[^0-9]/g, '')}@users.folynote.app`;
const pinToPassword = (p) =>
  `fn-${[...p.replace(/[^0-9]/g, '')].map((d) => PIN_DIGIT_ALPHABET[+d]).join('')}`;

const admin = createClient(url, anonKey, { auth: { persistSession: false } });
let passed = 0;

function ok(name, cond, extra = '') {
  console.log(`${cond ? '  ✓' : '  ✗'} ${name}${cond ? '' : ` — ${extra}`}`);
  if (cond) passed++;
}

console.log(`Smoke test against ${url}\n`);

// 1. Sign up (mobile + PIN → synthetic email)
const email = toEmail(mobile);
const { data: su, error: suErr } = await admin.auth.signUp({
  email,
  password: pinToPassword(pin),
  options: { data: { display_name: 'Smoke Test', mobile } },
});
ok('1. signup returns a session (confirmations disabled)', !suErr && !!su?.session, suErr?.message ?? 'no session');
const userId = su?.user?.id;
if (!userId) process.exit(1);

try {
  // 2. Profile trigger auto-provisioned a row
  await new Promise((r) => setTimeout(r, 1200)); // trigger fires async
  const { data: prof, error: profErr } = await admin
    .from('profiles').select('display_name, mobile').eq('id', userId).maybeSingle();
  ok('2. profile row auto-provisioned by trigger', !profErr && !!prof, profErr?.message ?? 'row missing');
  ok('   profile carries the display_name metadata', prof?.display_name === 'Smoke Test', `got "${prof?.display_name}"`);

  // 3. Fresh sign-in with the same mobile + PIN
  const { data: si, error: siErr } = await admin.auth.signInWithPassword({
    email,
    password: pinToPassword(pin),
  });
  ok('3. sign-in with mobile + PIN succeeds', !siErr && !!si?.session, siErr?.message ?? 'no session');

  // 4. RLS: owner can insert their own thought
  const { error: insErr } = await admin.from('thoughts').insert({
    id: 'smoke-thought-1',
    user_id: userId,
    entry_date: new Date().toISOString().slice(0, 10),
    title: 'Smoke test entry',
    content: 'Created by scripts/smoke-test-supabase.mjs',
  });
  ok('4. RLS allows owner insert into thoughts', !insErr, insErr?.message);

  // 5. Storage: upload + download on the owner's private path
  const path = `${userId}/smoke-test.txt`;
  const { error: upErr } = await admin.storage.from('documents')
    .upload(path, new Blob(['folynote smoke test'], { type: 'text/plain' }), { contentType: 'text/plain' });
  ok('5a. storage upload to own folder succeeds', !upErr, upErr?.message);
  const { data: blob, error: dlErr } = await admin.storage.from('documents').download(path);
  ok('5b. storage download returns the object', !dlErr && !!blob, dlErr?.message);
  await admin.storage.from('documents').remove([path]);

  // 6. Signed out → anonymous access is blocked everywhere
  await admin.auth.signOut();
  const { data: anonThoughts } = await admin.from('thoughts').select('*').eq('user_id', userId);
  ok('6a. anonymous read of user rows is blocked by RLS', (anonThoughts ?? []).length === 0);
  const { error: anonErr } = await admin.from('thoughts').insert({
    id: 'smoke-anon', user_id: userId, entry_date: '2026-01-01',
  });
  ok('6b. anonymous insert is blocked by RLS', !!anonErr, 'insert unexpectedly allowed');
} finally {
  // 7. Delete the test user (cascade removes profile + rows). Requires the
  //    service_role key — the anon key is correctly rejected (HTTP 403).
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = toEmail(mobile);
  if (svcKey) {
    const res = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${svcKey}`, apikey: svcKey },
    });
    ok('7. test user deleted via admin API', res.ok || res.status === 404, `HTTP ${res.status}`);
  } else {
    ok('7. cleanup skipped', true);
    console.log(`    → set SUPABASE_SERVICE_ROLE_KEY to auto-delete, or remove ${email} in the dashboard.`);
  }
}

console.log(`\n${passed}/10 checks passed.`);
process.exit(passed === 10 ? 0 : 1);
