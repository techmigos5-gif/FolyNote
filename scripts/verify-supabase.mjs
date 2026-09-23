import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const content = readFileSync('.env.local', 'utf8');
const url = content.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = content.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) { console.error('Missing env vars. URL:', url, 'Key present:', !!key); process.exit(1); }
console.log('URL:', url);
console.log('Key matches project:', key.includes('gwdhzrmwrfnhpbofdkys'));

const supabase = createClient(url, key);

console.log('\n--- Test 1: Auth endpoint ---');
const { data: session, error: sessionErr } = await supabase.auth.getSession();
console.log('getSession:', sessionErr ? 'ERROR: ' + sessionErr.message : 'OK (session: ' + !!session.session + ')');

console.log('\n--- Test 2: REST API ---');
const res = await fetch(url + '/rest/v1/thoughts?select=count&limit=1', {
  headers: { apikey: key, Authorization: 'Bearer ' + key }
});
console.log('REST status:', res.status);
const body = await res.text();
console.log('REST response:', body.substring(0, 200));

console.log('\n=== Supabase is ' + (!sessionErr && res.status === 200 ? 'WORKING ✓' : 'NOT WORKING ✗') + ' ===');
