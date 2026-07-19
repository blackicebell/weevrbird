# Weevrbird Privacy Policy Draft

Date: 2026-07-19

This is draft copy for store preparation. Review and update it before public launch, especially after production auth, backend sync, source ingestion, reporting, or account deletion systems are connected.

## Overview

Weevrbird is a personal information app that helps people read finite daily editions, follow Smartfeeds, save useful pieces, and contribute notes, questions, recommendations, links, and long reads.

The current build is local-first. Most app state is stored on the user's device.

## Information The App Stores

The current build may store:

- Onboarding progress
- Selected interests
- Broad location preference, such as Global, United States, Nigeria, Atlanta, Lagos, London, Toronto, or Accra
- Bird profile mark
- Optional pen name
- Email address when a user starts or completes the email-link identity flow
- Saved pieces
- Opened reading history
- Useful marks
- Contribution drafts and submitted contributions
- Profile setup
- Private connection count

## Information The App Does Not Collect In This Build

The current build does not request precise GPS location.

The current build does not upload user photos, videos, or custom avatar images.

The current build does not provide production cross-device sync yet.

## How Information Is Used

Weevrbird uses local app state to:

- Build a finite Today issue around selected interests and broad location
- Keep saved pieces available in Library
- Preserve contribution drafts
- Show private reading history on the device
- Help users return to useful pieces
- Show the user's private connection count to them
- Prepare contribution and profile identity once email-link auth is connected

## External Sources

Weevrbird may show attributed external articles, videos, podcasts, public notices, and other source material as reading cards.

External source links may open outside Weevrbird. Those external sites have their own privacy practices.

Production source ingestion and reuse terms should be verified before enabling live imported content.

## Contributions

Contributions are saved privately first. A user chooses where a contribution belongs before it becomes visible in a Smartfeed.

Production moderation, reporting, blocking, and backend storage still need implementation before a public launch.

## Account Deletion

The current build includes a copyable deletion request in Profile safety. Production account deletion should be implemented before public launch, or the privacy policy should clearly describe the support process for deleting account data.

Local device data can be cleared with Reset Weevrbird in Profile safety.

## Contact

Support: support@weevrbird.app

## Launch Notes

Before publishing this policy, confirm:

- The final support email or support URL
- The production account deletion process
- Whether backend sync stores email, contributions, saves, reports, blocks, or source interactions
- Whether analytics, crash reporting, push notifications, or third-party services are added
- Final Google Play Data Safety and App Store Privacy Nutrition answers
