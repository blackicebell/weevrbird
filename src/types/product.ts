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
  publishedAt: string;
  createdAt: string;
  imported: boolean;
  saved?: boolean;
  replies: number;
  reactionLabel: string;
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
