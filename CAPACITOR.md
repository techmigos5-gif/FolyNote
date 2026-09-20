# FolyNote — Native Android & iOS via Capacitor

FolyNote ships the same React workspace as a native app. The PWA layer was
removed; Capacitor owns install, icons, splash, and notifications now.

## One-time setup

```bash
npm install                     # Capacitor core + platform packages are already in package.json
npm run build                   # Vite build → dist/ (Supabase env is baked from .env.local)
npx cap add android             # creates android/ (needs JDK 17 + Android Studio to run)
npx cap add ios                 # creates ios/ (needs Xcode, macOS only)
npm run cap:icons               # generates every launcher icon + splash from assets/
```

`assets/` (icon 1024px, splash 2732px light + dark) is generated from the
master artwork by `node scripts/generate-capacitor-assets.js`.

## Everyday workflow

```bash
npm run cap:sync                # rebuild web + copy to both platforms
npm run cap:open:android        # open in Android Studio → Run
npm run cap:open:ios            # open in Xcode → Run (macOS)
```

## What differs natively

- **Reminders** fire as real system notifications through
  `@capacitor/local-notifications` (see `src/lib/notifications.ts`); the web
  build uses the Notification API + in-app toasts instead.
- **Platform detection**: `src/lib/platform.ts` exports `IS_NATIVE`,
  `IS_ANDROID`, `IS_IOS` for native-only code paths.
- Config lives in `capacitor.config.ts` (`app.folynote.app`, webDir `dist/`).

## Notes

- Supabase env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are baked
  into the bundle at `npm run build` time from `.env.local` — rebuild + resync
  after changing them.
- Deep URL scheme is unnecessary: auth is mobile + PIN (email/password grant),
  which works from the native WebView out of the box.
- Keep `android/` and `ios/` in version control; their build outputs are
  gitignored.
