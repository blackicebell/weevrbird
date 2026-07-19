# Weevrbird

Weevrbird is an interest-first personal information app built with Expo and React Native.

Positioning: **Built for curiosity, not clout.**

## Run locally

```bash
npm install
npm run web
```

## Build checks

```bash
npm run check
```

This runs TypeScript validation, local state recovery checks, paste-content classification checks, copy guardrails, legal/store-doc checks, the content-source check, app asset validation, and app config validation.

The app uses native AsyncStorage for local-device persistence, so iOS/Android release testing needs a fresh native build after dependency or config changes.

## Native builds

```bash
npm run build:android:production
npm run build:ios:production
```

Android production builds generate an app bundle for Google Play. iOS builds use the Xcode 26 EAS image configured in `eas.json`.

Store submission scripts are also available after a production build is ready:

```bash
npm run submit:android:production
npm run submit:ios:production
```

Before uploading a replacement build, confirm:

- `app.json` Android `versionCode` is higher than the last Google Play upload.
- `app.json` iOS `buildNumber` is higher than the last App Store Connect upload.
- `app.json` `version` matches `package.json` `version`.
- `npm run check` passes after any dependency, asset, or config change.

Run the full local release preflight before starting a cloud build:

```bash
npm run release:preflight
```

Use this to print the current release values:

```bash
npm run release:status
```

Use these to preview the next build numbers without changing files:

```bash
npm run release:next:android
npm run release:next:ios
npm run release:next:all
```

Use these only when preparing a replacement upload:

```bash
npm run release:bump:android
npm run release:bump:ios
npm run release:bump:all
```

Build-number bump scripts update both `app.json` and `src/app/release.ts`, which keeps the in-app Safety panel aligned with the uploaded build.

Store copy, data-safety notes, privacy/terms drafts, and the public-launch checklist live in `docs/store-readiness.md`.

## Product Shape

- Editorial Today page instead of an endless timeline
- Smartfeeds for city, interest, and community streams
- Contribution flows for notes, questions, discussions, recommendations, links, and long reads
- Email-link identity with an optional pen name
- Local-device persistence for onboarding progress, saved items, opened history, contribution drafts, profile setup, and private connection count
- Curated local avatars, no user-uploaded photos or videos
- Imported reading cards labeled separately from community contributions
- Lightweight reactions, saves, replies, reports, blocks, and link requests
- Library, search, settings, moderation, and admin-ready data models

## Product rules

- Use **Contribute** instead of Post.
- Use **Connect** and **Linked** instead of follower/following.
- Keep feeds chronological and transparent.
- Seed empty feeds with clearly labeled external content.
- Avoid public popularity counters.
