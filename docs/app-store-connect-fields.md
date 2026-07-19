# Weevrbird App Store Connect Fields

Date: 2026-07-19

Use this as a working entry sheet for TestFlight and early App Store setup. Confirm every answer again before public release, especially after production auth, backend storage, analytics, crash reporting, notifications, subscriptions, or live source ingestion are added.

## App Identity

- App name: Weevrbird
- Bundle ID: `com.weevrbird.app`
- Current version: `0.1.0`
- Current iOS build number: `1`
- Primary category suggestion: News
- Secondary category suggestion: Lifestyle or Productivity
- Pricing: Free

## Subtitle Options

- Your finite daily issue
- Useful reading, saved context
- Smartfeeds for real curiosity

## Promotional Text Draft

Weevrbird turns trusted sources, useful links, and thoughtful contributions into a finite daily issue built around your interests.

## Description Draft

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

## Keywords

reading,RSS,news,links,library,discovery,smartfeeds,articles,recommendations,community,notes,interests

## Support And Policy URLs

Use these only after they return HTTP 200:

- Privacy policy: `https://blackicebell.github.io/weevrbird/privacy.html`
- Terms of Use: `https://blackicebell.github.io/weevrbird/terms.html`

Support email:

- `support@weevrbird.app`

If GitHub Pages is blocked, publish the same `public/` folder with another static host and use that URL instead.

## TestFlight Beta Notes

Initial TestFlight build for Weevrbird.

Please test onboarding, Today, Smartfeeds, Library saves, Contribute paste flow, Profile setup, sharing, source labels, and app state after closing and reopening.

Known early-stage limitations:

- Email-link identity is represented in the app flow, but production email delivery and backend account sync are not connected yet.
- Saved state and drafts are currently local to the device.
- Live source ingestion and production moderation are not enabled yet.

## App Review Notes

Use this only if submitting for review before production backend systems are connected.

Weevrbird is currently an early local-first build. Testers can complete onboarding, choose interests and a broad location, browse the finite Today issue, save pieces to Library, create local contribution drafts, and use the profile/safety flows.

No paid login is required. Email-link identity appears in the app flow, but production email delivery is not connected yet.

## App Privacy Working Answers

This is a draft for the current local-first build.

Current app state may include:

- Email address when the user starts or completes the email-link identity flow
- Optional pen name
- Broad location preference
- Interests
- Saved pieces
- Opened reading history
- Contribution drafts and submitted contributions
- Private connection count

Current privacy notes:

- The app does not request precise GPS location in this build.
- The app does not upload user photos, videos, or custom avatar images in this build.
- Most app state is currently stored on the device with AsyncStorage.
- Production backend storage is not implemented yet.

Do not claim production cross-device sync, production account deletion, live email authentication, automated source ingestion, analytics, push notifications, or paid features until those systems are implemented.

## Screenshots

Apple accepts 6.9-inch iPhone portrait screenshots at `1320 x 2868`, `1290 x 2796`, or `1260 x 2736`. This repo exports the large `1320 x 2868` set.

App Store iPhone 6.9-inch screenshots:

- `store-assets/app-store/iphone-69/01-today.png`
- `store-assets/app-store/iphone-69/02-smartfeeds.png`
- `store-assets/app-store/iphone-69/03-contribute.png`
- `store-assets/app-store/iphone-69/04-library.png`
- `store-assets/app-store/iphone-69/05-profile.png`

Google Play reference images:

- `store-assets/google-play/screenshots/01-today.png`
- `store-assets/google-play/screenshots/02-smartfeeds.png`
- `store-assets/google-play/screenshots/03-contribute.png`
- `store-assets/google-play/screenshots/04-library.png`
- `store-assets/google-play/screenshots/05-profile.png`

## iOS Build Status

- `npm run build:ios:production` is configured to use the Xcode 26 EAS image.
- Apple Developer login is required before EAS can continue.
- Run it interactively when ready to sign in:
  - `npm run build:ios:production`
