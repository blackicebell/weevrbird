# Weevrbird Google Play Console Fields

Date: 2026-07-19

Use this as a working entry sheet for Google Play internal testing and early store setup. Confirm every answer again before a public release, especially after production auth, backend storage, analytics, crash reporting, notifications, or live source ingestion are added.

## App Identity

- App name: Weevrbird
- Package name: `com.weevrbird.app`
- Current version name: `0.1.0`
- Current Android version code: `6`
- Category suggestion: News & Magazines
- App type: App
- Pricing: Free

## Short Description

Weevrbird turns trusted sources and useful contributions into a finite daily issue built around your interests.

## Full Description

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

## Internal Testing Release Notes

Initial internal testing build for Weevrbird.

Please test onboarding, Today, Smartfeeds, Library saves, Contribute paste flow, Profile setup, sharing, source labels, and app state after closing and reopening.

Known early-stage limitations:

- Email-link identity is represented in the app flow, but production email delivery and backend account sync are not connected yet.
- Saved state and drafts are currently local to the device.
- Live source ingestion and production moderation are not enabled yet.

## Data Safety Working Answers

This section is a draft for the current local-first build.

Data collected or stored by the current app flow:

- Email address: used for account/profile identity once production auth is live.
- Optional pen name: used for contribution/profile identity.
- Broad location preference: used for relevance. The app does not request precise GPS location in this build.
- Interests: used to personalize Today and Smartfeeds.
- Saved pieces and opened history: used to support Library and return paths.
- Contribution drafts and submitted contributions: used for local contribution flows.
- Private connection count: shown only to the user.

Current storage note:

- The current build stores most state on the user's device with AsyncStorage.
- Production backend storage is not implemented yet.

Do not claim in Play Console that Weevrbird has production cross-device sync, production account deletion, live email authentication, or automated source ingestion until those systems are implemented.

## Privacy Policy Notes

Use `docs/privacy-policy-draft.md` as the source draft.

Hostable static pages:

- Privacy policy page: `public/privacy.html`
- Terms of Use page: `public/terms.html`
- GitHub Pages workflow: `.github/workflows/pages.yml`

Expected GitHub Pages URLs after Pages is enabled for the repository:

- Privacy policy: `https://blackicebell.github.io/weevrbird/privacy.html`
- Terms of Use: `https://blackicebell.github.io/weevrbird/terms.html`

Only paste these into Play Console after the URLs return HTTP 200. A 404 means GitHub Pages still needs to be enabled or the deploy workflow has not finished.

If GitHub Pages is blocked, use `docs/hosting-fallback.md` to publish the same files on another static host.

Before public release, publish a real privacy policy URL and confirm whether the production app adds:

- Backend account storage
- Analytics
- Crash reporting
- Push notifications
- Email delivery provider
- Source ingestion jobs
- Reporting and moderation storage

## App Access

Current internal build:

- No paid login is required.
- Email-link identity appears in the app flow, but production email delivery is not connected yet.
- If Play Console asks for app access instructions, note that testers can move through the prototype identity flow inside the app.

## Content Rating Notes

Suggested answers for the current curated prototype:

- News, education, reference, or user-generated contribution context may appear.
- No gambling.
- No simulated gambling.
- No in-app purchases in the current build.
- No precise location sharing.
- No user-uploaded avatar photos or videos in the current build.
- Contributions should be moderated before public launch.

## Store Assets Still Needed

- Phone screenshots for Today, Feeds, Contribute, Library, and Profile:
  - `store-assets/google-play/screenshots/01-today.png`
  - `store-assets/google-play/screenshots/02-smartfeeds.png`
  - `store-assets/google-play/screenshots/03-contribute.png`
  - `store-assets/google-play/screenshots/04-library.png`
  - `store-assets/google-play/screenshots/05-profile.png`
- Google Play feature graphic: `store-assets/google-play/feature-graphic.png`.
- App Store screenshots live separately in `store-assets/app-store/iphone-69/`.
- Public privacy policy URL using `public/privacy.html` or the deployed GitHub Pages URL.
- Support URL or final support email.
- Final source-policy review for enabled external sources.

## Current Upload

- AAB: `https://expo.dev/artifacts/eas/HESrVBePdREI43_XvJAyWkqopf2JFuedBESwan_u3JM.aab`
- Build commit: `da2f7b5`
- Handoff docs:
  - `docs/store-readiness.md`
  - `docs/internal-testing-qa.md`
  - `docs/internal-testing-invite.md`
