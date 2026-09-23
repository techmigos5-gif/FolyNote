# FolyNote × Supabase Setup

FolyNote now persists all data in **Supabase** (Postgres + Auth + Storage + Realtime).
The Express server is only a static host — no data ever touches it.

## 1. Environment variables

Copy `.env.example` → `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

Both values: **Supabase Dashboard → Project Settings → API**.
(The CLI is already linked — `supabase/.temp/project-ref` holds your project id.)

## 2. Apply the migrations

```bash
supabase db push
```

This creates:

| Object | Purpose |
| --- | --- |
| `profiles`, `thoughts`, `pinned_items`, `documents`, `ideas` | Per-user tables |
| Row Level Security policies | Every row strictly owner-scoped (`auth.uid() = user_id`) |
| `on_auth_user_created` trigger | Auto-provisions a `profiles` row on signup |
| `documents` Storage bucket (private, 25 MB limit) | PDFs/text/markdown/json binaries under `{userId}/` |
| Storage RLS policies | Objects readable/writable only by their owner |
| `supabase_realtime` publication | Powers multi-tab/device sync |

## 3. Auth settings (already applied to the linked project)

FolyNote signs users in with **mobile number + PIN** mapped onto Supabase
email/password auth (synthetic `@users.folynote.app` emails; each PIN digit maps
to a distinct letter — injective, so different PINs never collide, and the raw
PIN is never stored client-side).

Applied via CLI on the linked project:

```bash
npx supabase config pull --force --yes   # bring remote auth config local
# enable_confirmations was flipped to false in supabase/config.toml
npx supabase config push --yes           # disable "Confirm email"
npx supabase db push --yes               # apply the schema migration
```

Residual dashboard-only settings (optional):

1. **Twilio SMS provider is enabled remotely**; the CLI cannot switch an active SMS provider off. It's inert for this app — no code path uses phone OTP — but disable it in **Authentication → Providers → Phone** if you want zero unused providers.
2. Optional hardening: set **minimum password length** to 6 (the mapped password always satisfies this).

## 4. Run it

```bash
npm run dev
```

- Without `.env.local`, the app runs in **offline-only mode**: everything works against
  localStorage, no cloud sync.
- With it, sign-up/sign-in go through Supabase Auth; every mutation syncs row-by-row;
  realtime keeps multiple tabs and devices coherent.

## 5. Verify RLS

After signing up in the app, check in the SQL editor:

```sql
select email from auth.users;
select * from public.profiles;      -- auto-created by the trigger
select count(*) from public.thoughts; -- rows visible only for your session
```

## Architecture notes

- **Offline-first**: localStorage remains the immediate cache; Supabase is synced
  asynchronously (500 ms debounce, diff-based per-row pushes).
- **Multi-tab coherence**: `useWorkspaceSync` subscribes to `postgres_changes` on all
  workspace tables; external changes re-pull that table, own echoes are ignored via a
  last-write timestamp guard.
- **Documents**: metadata in `documents` table; original binary in Storage at
  `documents/{userId}/{docId}-{name}` (private bucket, RLS-enforced).
- **Auth**: see `src/api/auth.ts` for the mobile→email mapping and the injective PIN→password encoding.
