# Weevrbird Internal Testing QA

Date: 2026-07-19

Use this checklist for Google Play internal testing and TestFlight builds. The goal is to catch confusing flows, broken persistence, and store-blocking issues before a wider release.

## Tester Setup

- Install the latest internal testing build.
- Start from a fresh install when possible.
- Test on at least one smaller phone and one larger phone.
- Note device model, OS version, and build number when reporting issues.

## First-Run Flow

- The app opens without a blank screen or crash.
- Onboarding explains what Weevrbird offers in plain language.
- Topic choices include broad labels such as Tech and Business.
- Location choices include Global and named cities or countries.
- Bird avatar choices are centered and visually clear.
- Profile creation allows an optional pen name.
- Email-link identity copy is understandable and does not imply production email delivery until backend auth is live.

## Core Reading Flow

- Today loads with a finite issue.
- Feed cards show source/context clearly.
- Opening a piece shows title, source, summary, and actions.
- External reading opens the original source.
- Save works from a card and from the detail screen.
- Saved state is still present after closing and reopening the app.
- The end-of-issue state feels like a natural stopping point.

## Smartfeeds And Library

- Feeds tab loads without layout overlap.
- Interest and location feeds are understandable.
- Library shows saved items.
- Search and filter states do not create dead ends.
- Empty or low-content states still explain what to do next.

## Contributing

- Contribute opens without requiring a public profile first.
- Paste button works for article, image, and video links.
- Pasted content is classified in a useful way.
- Draft contribution fields are readable on small screens.
- Contribution drafts survive close and reopen.
- Submitted local contributions appear in the expected places.

## Profile And Safety

- Profile shows the selected bird mark, pen name, interests, and location.
- Private connection count is visible to the user without becoming a public popularity counter.
- Elsewhere links and copy actions give feedback.
- Safety actions are understandable.
- Support details copy includes app version and build info.
- Sign out or reset paths do not leave the app stuck.

## Share And Source Trust

- Share actions open the native share sheet.
- Copy link actions give feedback.
- Source transparency panels make external/imported content clear.
- No external source appears to be owned by Weevrbird.

## Accessibility And Layout

- Text is readable at normal phone sizes.
- Buttons have enough tap space.
- Bottom navigation does not cover important content.
- Long labels wrap cleanly.
- Screens still work with larger system text when possible.
- Loading and transition states do not feel broken.

## Report Format

Ask testers to send:

- Device and OS version
- Build number
- Screen or flow
- What they expected
- What happened
- Screenshot or screen recording when useful

## Pass Criteria

Before a wider beta, the build should have:

- No launch crashes
- No blocked onboarding path
- No broken save/persistence path
- No misleading auth, source, privacy, or public-count copy
- No major layout overlap on common phone sizes
- No store metadata mismatch with the actual build
