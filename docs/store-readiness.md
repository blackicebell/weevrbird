# Weevrbird Store Readiness

Date: 2026-07-19

This is the practical store checklist for the current app. It separates what is true in the build today from what still needs production infrastructure before a public launch.

## Current App Truth

- Weevrbird is a personal information app for finite daily editions, Smartfeeds, saved context, and useful contributions.
- The current build stores onboarding progress, selected interests, saved items, opened items, contribution drafts, profile setup, and private connection count on the device.
- Email-link identity is represented in the app flow, but production email delivery and backend account sync are not implemented yet.
- Users choose broad interests and a broad location preference such as Global, United States, Nigeria, Atlanta, Lagos, London, Toronto, or Accra.
- Users choose a local bird profile mark. The current build does not upload user photos, videos, or custom avatar images.
- External articles, videos, and sources are presented as attributed reading cards. Production source ingestion and reuse terms still need final verification before enabling live imports.

## Store Listing Draft

Short description:

Weevrbird turns trusted sources and useful contributions into a finite daily issue built around your interests.

Long description:

Weevrbird helps you keep up without falling into an endless feed. Choose a few interests, pick a broad location, and get a daily issue made from trusted sources, Smartfeeds, saved context, and useful contributions from people with overlapping attention.

The app is built around reading, saving, contributing, and returning to useful material. You can follow topics, save pieces to your library, draft notes or recommendations, and build a profile around what you notice instead of public popularity counts.

Core features:

- A finite Today issue instead of an endless timeline
- Smartfeeds for topics, cities, sources, and communities
- A personal library for saved reading and useful links
- Contribution tools for links, notes, questions, recommendations, and long reads
- Email-link identity with an optional pen name
- Bird profile marks instead of follower-performance avatars
- Private connection count visible only to the user

## App Store Subtitle Options

- Your finite daily issue
- Useful reading, saved context
- Smartfeeds for real curiosity

## Keyword Ideas

reading, RSS, news, links, library, discovery, smartfeeds, articles, recommendations, community, notes, interests

## Data Safety Draft

Use this as a working draft, not final legal text.

- Account email: required only for contribution/profile identity once production auth is live.
- Optional pen name: used as the public identity for contributions.
- Broad location preference: used for local relevance. The app does not request precise GPS location in the current build.
- Interests and saved content: used to personalize feeds and library state.
- Contributions: user-created links, notes, questions, recommendations, replies, and reading lists.
- Local storage: the current build persists app state on the device with AsyncStorage.

Do not claim cross-device sync, production account deletion, live email authentication, or automated source ingestion until those systems are implemented.

## Required Before Public Launch

- Publish a privacy policy URL. A working draft lives in `docs/privacy-policy-draft.md`.
- Publish a support URL or support email.
- Decide whether Terms of Use are needed before accepting public contributions. A working draft lives in `docs/terms-of-use-draft.md`.
- Connect production email-link auth.
- Add account deletion or a clear support path for deleting account data.
- Implement backend storage for accounts, contributions, saves, reports, blocks, and source imports.
- Verify reuse terms for every enabled external source.
- Run real-device QA on iOS and Android after the native build.
- Confirm Google Play Data Safety and App Store Privacy Nutrition details against the production backend, not the local prototype.

## Release Runbook

1. Run `npm run release:preflight`.
2. Confirm the current Android `versionCode` and iOS `buildNumber`.
3. If replacing an uploaded build, run the right bump command:
   - `npm run release:bump:android`
   - `npm run release:bump:ios`
   - `npm run release:bump:all`
   These update both `app.json` and the in-app release info shown in Profile safety.
4. Build production binaries:
   - `npm run build:android:production`
   - `npm run build:ios:production`
5. Test the installed build on a real phone.
6. Submit only after store metadata, privacy links, screenshots, and source-policy notes are ready.

## Current Internal Testing Handoff

Current Android internal testing build:

- Platform: Android
- Package: `com.weevrbird.app`
- Version: `0.1.0`
- Version code: `4`
- Target SDK: `35`
- Commit: `ff6ffef`
- AAB: `https://expo.dev/artifacts/eas/CQQ7KhRyvjeSFstcT5fvMfKDr0suE_ojYcClcku3hAY.aab`

Google Play upload path:

1. Open Google Play Console.
2. Select Weevrbird.
3. Go to Testing, then Internal testing.
4. Create a new release.
5. Upload the AAB above.
6. Save, review, and roll out to internal testers.

Automated Android submit status:

- `npm run submit:android:production` is configured.
- The latest submit attempt was stopped because EAS only found a Google service-account key for another app.
- Do not use that key for Weevrbird.
- Create or upload a dedicated Weevrbird Google Play service-account key before using automated submit.

Dedicated Google Play service-account setup:

1. In Google Play Console, open Setup, then API access.
2. Link or select the Google Cloud project used for Weevrbird.
3. Create a service account for Play uploads.
4. Grant it access only to Weevrbird.
5. Give it release permissions needed for internal testing uploads.
6. Download the JSON key.
7. Run `npm run submit:android:production`.
8. Choose Upload a new service account key and provide the Weevrbird JSON key.

iOS production build status:

- `npm run build:ios:production` is configured to use the Xcode 26 EAS image.
- The build requires Apple Developer login before EAS can continue.
- Run it interactively when ready to sign in:
  - `npm run build:ios:production`
