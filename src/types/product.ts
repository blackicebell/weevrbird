export type FeedItemType =
  | "note"
  | "question"
  | "discussion"
  | "recommendation"
  | "link"
  | "long_read"
  | "external_article"
  | "external_video"
  | "external_podcast"
  | "external_event"
  | "official_update";

export type SmartfeedFilter = "Latest" | "Conversations" | "Reading" | "Saved";

export type IssuePace = "Brief" | "Balanced" | "Deep";

export type ContentLayer = "Editorial" | "Reading" | "Community";

export type EditionModuleType =
  | "lead_story"
  | "what_changed"
  | "community_question"
  | "reading_list"
  | "recommendation"
  | "caught_up";

export interface Smartfeed {
  id: string;
  name: string;
  type: "city" | "interest" | "community";
  description: string;
  members: string;
  newItems: number;
  palette: string;
  joined: boolean;
}

export interface FeedItem {
  id: string;
  itemType: FeedItemType;
  feedId: string;
  authorId?: string;
  sourceId?: string;
  title?: string;
  body?: string;
  excerpt?: string;
  url?: string;
  sourceName?: string;
  localStatus?: "review" | "placed";
  publishedAt: string;
  createdAt: string;
  imported: boolean;
  saved?: boolean;
  replies: number;
  reactionLabel: string;
  engagementSummary?: {
    saves: number;
    useful: number;
    replyPreview?: string;
  };
}

export interface ContributionActivity {
  id: string;
  contributionId: string;
  title: string;
  body: string;
  feedName: string;
  meta: string;
  icon: "chatbubble-ellipses-outline" | "bookmark-outline" | "sparkles-outline";
}

export interface EditionModule {
  id: string;
  type: EditionModuleType;
  layer: ContentLayer;
  feed: Smartfeed;
  item?: FeedItem;
  title: string;
  body: string;
  action: string;
  reason: string;
  items?: FeedItem[];
}

export interface UserContentState {
  savedItemIds: string[];
  usefulItemIds: string[];
}

export interface SubmittedContribution {
  id: string;
  type: string;
  body: string;
  feedId: string;
  status: "draft" | "review" | "placed";
  createdAt: string;
  placedAt?: string;
}

export interface Person {
  id: string;
  displayName: string;
  username: string;
  city: string;
  bio: string;
  interests: string[];
  linked: boolean;
  avatar: number;
}

export interface AdminMetric {
  label: string;
  value: string;
  tone: "calm" | "attention" | "good";
}
