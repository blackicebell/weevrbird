# Weevrbird Product Pass Checkpoint

Date: 2026-07-17

## Summary

This pass moved Weevrbird from a single-file polished concept toward a usable personal information product. The app now centers on a finite daily issue, Smartfeeds as magazine sections, a personal library, contribution drafting, a browsable attention-map profile, and lightweight local persistence.

## Major Changes

- Extracted the app into focused modules under `src/app`, `src/components`, `src/screens`, and `src/theme`.
- Reframed onboarding around building a first personal issue, with a brief issue-building transition.
- Redesigned Today as a finite issue with a beginning, useful modules, and an ending.
- Polished Smartfeeds, Library, Contribute, and Profile with stronger Weevrbird-specific language.
- Added empty states, pressed states, accessibility labels, and recovery actions.
- Added reader/detail navigation for feed items, Today modules, Library rows, Profile contributions, and shelf items.
- Added Profile shelf views, privacy/safety controls, Follow state, and reset flow.
- Added local persistence for onboarding, preferences, selected feed/filter, contribution draft, saved items, and useful marks.
- Added `Reset Weevrbird` to clear demo state and return to onboarding.

## Verification

- `npm run typecheck` passes.
- Browser flows verified on `http://127.0.0.1:8100`.
- Checked onboarding, Today, Feeds, Library, Contribute, Profile, reader detail, shelf detail, safety controls, persistence, and reset.

## Notes

- State is currently local browser storage, suitable for demo and product exploration.
- Profile Follow state is local to the mounted Profile screen and is not persisted yet.
- Detail navigation is an in-app overlay rather than a full route stack.
