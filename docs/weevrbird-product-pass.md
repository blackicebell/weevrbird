# Weevrbird Product Pass Checkpoint

Date: 2026-07-19

## Summary

This pass moved Weevrbird toward a usable personal information product. The app now centers on a finite daily issue, Smartfeeds as magazine sections, a personal library, contribution drafting, a browsable attention-map profile, email-link identity, and lightweight local persistence.

## Major Changes

- Extracted the app into focused modules under `src/app`, `src/components`, `src/screens`, and `src/theme`.
- Reframed onboarding around building a first personal issue, with a brief issue-building transition.
- Redesigned Today as a finite issue with a beginning, useful modules, and an ending.
- Polished Smartfeeds, Library, Contribute, and Profile with stronger Weevrbird-specific language.
- Added empty states, pressed states, accessibility labels, and recovery actions.
- Added reader/detail navigation for feed items, Today modules, Library rows, Profile contributions, and shelf items.
- Added Profile shelf views, privacy/safety controls, Connect/Linked language, and a two-tap reset flow.
- Added email-link identity with optional pen name.
- Added native local persistence for onboarding progress, preferences, selected feed/filter, contribution draft, saved items, useful marks, opened history, profile setup, and connection count.
- Added build-prep checks for TypeScript, content-source routing, app assets, and app config.
- Added paste-content classification checks for article, video, image, resource, and plain-text contribution flows.
- Added copy guardrails to keep deprecated topic names and harsh end-of-issue language from returning.
- Added legal/store-doc checks for privacy draft, terms draft, and support contact consistency.
- Added release scripts for build-number status, dry-run previews, and Android/iOS bumping.
- Added in-app release info to the Profile safety panel, with checks to keep it synced to `app.json`.
- Added store-readiness docs with listing copy, data-safety notes, privacy/terms drafts, and public-launch blockers.

## Verification

- `npm run check` passes, including TypeScript, content-source routing, app asset dimensions, and app config.
- Browser flows verified on `http://127.0.0.1:8100`.
- Checked onboarding, Today, Feeds, Library, Contribute, Profile, reader detail, shelf detail, safety controls, persistence, and reset.
- Android config targets API level 35, and EAS iOS builds use an Xcode 26 image.
- Release preflight prints the current app version, Android `versionCode`, iOS `buildNumber`, bundle/package identifiers, release-info sync state, EAS project id, and iOS build image.

## Notes

- State is currently local-device storage through AsyncStorage. Backend sync, cross-device auth completion, and production email delivery still need implementation.
- Native dependency changes require a fresh iOS/Android build before device QA.
- Profile connection count is local and private to the signed-in user experience.
- Detail navigation is an in-app overlay rather than a full route stack.
- Store privacy and data-safety answers should be finalized only after the production backend, account deletion path, and source-ingestion policies are in place.
