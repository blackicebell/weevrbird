import { FeedItem, FeedItemType, Smartfeed } from "./product";

export type ContentSourceType = "rss" | "atom" | "youtube" | "podcast" | "calendar" | "manual" | "public_notice" | "public_api";
export type ContentSourceStatus = "active" | "experimental" | "paused" | "rejected";
export type SourceHealthStatus = "healthy" | "degraded" | "broken";
export type SourceTrustLevel = "known" | "community" | "experimental";
export type SourceCadence = "hourly" | "daily" | "weekly" | "manual";
export type SourceVerificationStatus = "verified" | "unverified" | "needs_review";
export type SourcePreferredPlacement = "today" | "discovery" | "both";
export type SourcePurpose =
  | "expert_context"
  | "curiosity_evergreen"
  | "science_technology"
  | "design_creativity"
  | "business_careers"
  | "culture_books"
  | "african_diaspora"
  | "food_travel"
  | "local_official";
export type CandidateLifecycleState = "imported" | "classified" | "eligible" | "selected" | "published" | "dismissed" | "duplicate" | "expired" | "needsReview";
export type CandidateDecisionType = "select" | "dismiss" | "markDuplicate" | "expire" | "needsReview";
export type LibraryItemStatus = "saved" | "opened" | "finished" | "removed";

export interface ContentSource {
  id: string;
  name: string;
  type: ContentSourceType;
  url?: string;
  officialFeedUrl?: string;
  sourceDirectoryUrl?: string;
  websiteUrl: string;
  allowedFeedIds: string[];
  eligibleSmartfeedIds: string[];
  purpose: SourcePurpose[];
  defaultTopics: string[];
  defaultItemType: FeedItemType;
  supportedLocations: string[];
  supportedLanguages: string[];
  status: ContentSourceStatus;
  verificationStatus: SourceVerificationStatus;
  syndicationNotes: string;
  includedKeywords: string[];
  excludedKeywords: string[];
  minimumCandidateScore: number;
  maximumItemsPerEdition: number;
  preferredPlacement: SourcePreferredPlacement;
  trustLevel: SourceTrustLevel;
  cadence: SourceCadence;
  enabled: boolean;
  lastVerifiedAt?: string;
  lastFetchedAt?: string;
}

export interface SourceHealth {
  sourceId: string;
  status: SourceHealthStatus;
  lastFetchedAt?: string;
  lastSuccessfulFetchAt?: string;
  lastError?: string;
}

export interface SmartfeedSourceRule {
  id: string;
  sourceId: string;
  feedId: string;
  enabled: boolean;
  status: "active" | "experimental" | "paused";
  allowedTopicIds: string[];
  excludedTopicIds: string[];
  allowedItemTypes: FeedItemType[];
  excludedItemTypes: FeedItemType[];
  allowedLanguages: string[];
  requiredLocationIds?: string[];
  includedKeywords: string[];
  excludedKeywords: string[];
  minimumRelevanceScore: number;
  sourcePriority: number;
  maxItemsPerEdition: number;
}

export interface Interest {
  id: string;
  label: string;
  keywords: string[];
  locationKeywords?: string[];
}

export interface UserInterestPreference {
  primaryInterestIds: string[];
  secondaryInterestIds: string[];
  location: string;
  language: string;
  preferredItemTypes: FeedItemType[];
  mutedSourceIds: string[];
  mutedInterestIds: string[];
  openedCandidateUrls: string[];
}

export interface SourceCandidate {
  id: string;
  sourceId: string;
  sourceName: string;
  feedId: string;
  state: CandidateLifecycleState;
  suggestedItemType: FeedItemType;
  title: string;
  excerpt?: string;
  url: string;
  canonicalUrl: string;
  guid?: string;
  author?: string;
  publishedAt: string;
  fetchedAt: string;
  language: string;
  categories: string[];
  imageUrl?: string;
}

export interface CandidateClassification {
  candidateId: string;
  interestIds: string[];
  locationMatches: string[];
  matchedKeywords: string[];
}

export interface CandidateDecision {
  candidateId: string;
  type: CandidateDecisionType;
  reason: string;
  decidedAt: string;
}

export interface CandidateScore {
  candidateId: string;
  score: number;
  reasons: string[];
}

export interface SmartfeedEdition {
  feed: Smartfeed;
  generatedAt: string;
  items: FeedItem[];
}

export interface LibraryItem {
  itemId: string;
  status: LibraryItemStatus;
  sourceCandidateId?: string;
  savedAt?: string;
  openedAt?: string;
  finishedAt?: string;
}
