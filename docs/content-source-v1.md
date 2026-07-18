# Content Sources V1

Weevrbird ingests external sources as raw material. A source does not publish directly into a Smartfeed.

Operating principle: ingest broadly, classify precisely, deliver selectively.

## Local Prototype Flow

1. `ContentSource` describes a trusted supplier such as RSS, Atom, podcast, public notice, or manual link.
2. `SourceCandidate` stores the imported item with attribution, canonical URL, source metadata, and lifecycle state.
3. Deduplication removes repeated candidates by source GUID, normalized URL, and normalized headline.
4. Classification maps candidates to interests, locations, and matched keywords using deterministic source defaults and text matching.
5. Relevance scoring applies hard exclusions first, then scores the remaining candidates with a small set of transparent signals.
6. Edition composition selects a finite set of visible `FeedItem`s for each Smartfeed.

## Topics Versus Smartfeeds

Topics describe what a candidate is about. Smartfeeds are editorial and community containers.

For example, `black-tech` can remain a Smartfeed destination while broad topics such as `technology`, `business`, `work`, `society`, and `education` explain why a candidate belongs there. This keeps cultural or community Smartfeeds useful without turning every community identity into a hardcoded content taxonomy label.

## Source Lifecycle

- `active`: trusted, healthy, and eligible for edition composition.
- `experimental`: eligible with stricter thresholds and tight item limits.
- `paused`: configured but excluded from editions.
- `rejected`: should not be used because of trust, quality, attribution, or metadata problems.

Source health is tracked separately from source status. A source can be editorially `active` while its latest fetch health is degraded or broken.

## Curated Registry

The registry is intentionally small. A source being present does not mean it is subscribed to, shown to users, or enabled for ingestion.

Each source records:

- official feed URL when verified
- official feed directory when exact feed selection is still pending
- website URL
- verification status
- syndication notes
- eligible Smartfeeds
- source purpose
- default topics
- included and excluded keywords
- minimum candidate score
- maximum items per edition
- preferred placement

Verified feed directories can still remain disabled. For example, Smithsonian, MIT News, NASA, Atlanta Fed, and National Park Service have official RSS directories, but Weevrbird should choose narrower category feeds before enabling ingestion. This avoids turning Discovery into a generic news reader.

Unverified experimental publishers stay disabled by default. They exist as evaluation targets, not production dependencies.

## Routing Rules

`SmartfeedSourceRule` decides whether a candidate from a source may enter a Smartfeed. It supports:

- enabled/status gates
- allowed and excluded topic ids
- allowed and excluded item types
- language gates
- optional location requirements
- included and excluded keywords
- source priority
- minimum relevance score
- maximum items per edition

These rules define eligibility, not publication. The composer still enforces finite edition limits and source/topic diversity.

## Intentional Non-Features

- No generative summaries.
- No paid APIs.
- No raw RSS dump into Smartfeeds.
- No follower, popularity, reaction, or virality ranking.
- No backend scheduler yet.
- No authentication or admin tooling yet.
- No arbitrary user-submitted source URLs.
- No full-article storage.
- No publication unread counts.
- No source-following UI in v1.

## Deferred Backend Concerns

- Scheduled ingestion jobs.
- Source health monitoring across devices.
- Supabase persistence.
- Moderation queues.
- Admin review tools.
- Rate limiting and cache invalidation.
- Real RSS/Atom network fetch retries.
- User-specific source muting persistence.
