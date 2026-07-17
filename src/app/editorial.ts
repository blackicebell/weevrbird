import { Ionicons } from "@expo/vector-icons";

import { feedItems, launchFeeds } from "../data/mockData";
import { palette } from "../theme/tokens";
import { FeedItem, Smartfeed, SmartfeedFilter } from "../types/product";

export type AppTab = "Today" | "Feeds" | "Contribute" | "Library" | "You";
export type OnboardingStep = "welcome" | "city" | "interests" | "avatar" | "ready";

export const tabs: Array<{ key: AppTab; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: "Today", icon: "newspaper-outline" },
  { key: "Feeds", icon: "albums-outline" },
  { key: "Contribute", icon: "create-outline" },
  { key: "Library", icon: "bookmark-outline" },
  { key: "You", icon: "person-circle-outline" }
];

export const filters: Array<{ key: SmartfeedFilter; label: string }> = [
  { key: "Latest", label: "Today" },
  { key: "Conversations", label: "Discuss" },
  { key: "Reading", label: "Reading Room" },
  { key: "Saved", label: "Archive" }
];

export const contributionTypes = ["Note", "Question", "Discussion", "Recommendation", "Link", "Long Read"];

export const contributionMeta: Record<string, { icon: keyof typeof Ionicons.glyphMap; helper: string }> = {
  Note: { icon: "create-outline", helper: "Share a quick thought" },
  Question: { icon: "bulb-outline", helper: "Ask the community" },
  Discussion: { icon: "chatbubbles-outline", helper: "Start a conversation" },
  Recommendation: { icon: "ribbon-outline", helper: "Share something you love" },
  Link: { icon: "link-outline", helper: "Share an article, video, or resource" },
  "Long Read": { icon: "newspaper-outline", helper: "Write a deeper piece" }
};

export const avatars = ["W", "A", "C", "M", "S", "L", "T", "N"];

export const profileCollections = [
  {
    title: "Atlanta places I return to",
    meta: "Five saved places / Updated this week",
    description: "Coffee, books, galleries, and quiet corners.",
    icon: "map-outline" as keyof typeof Ionicons.glyphMap
  },
  {
    title: "Essays on slower attention",
    meta: "Seven reads / Last opened yesterday",
    description: "Design writing, interfaces, and attention rituals.",
    icon: "book-outline" as keyof typeof Ionicons.glyphMap
  },
  {
    title: "Tools for independent artists",
    meta: "Four resources / Studio shelf",
    description: "Practical links for making and sharing work.",
    icon: "construct-outline" as keyof typeof Ionicons.glyphMap
  }
];

export const profileContributionTypes = [
  { label: "Notes", count: 8 },
  { label: "Questions", count: 3 },
  { label: "Recommendations", count: 6 },
  { label: "Reading Lists", count: 2 }
];

export const feedIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  atlanta: "business-outline",
  "black-tech": "code-slash-outline",
  "creative-community": "pencil-outline",
  "food-culture": "restaurant-outline",
  "faith-community": "leaf-outline",
  travel: "airplane-outline"
};

export const feedEditorialMeta: Record<string, {
  section: string;
  edition: string;
  masthead: string;
  issue: string;
  motif: keyof typeof Ionicons.glyphMap;
  accent: string;
  paper: string;
  secondary: string;
}> = {
  atlanta: {
    section: "Weekend Guide",
    edition: "City Edition",
    masthead: "The Atlanta Edition",
    issue: "Issue 148",
    motif: "map-outline",
    accent: "#4F9E77",
    paper: "#FFFDF8",
    secondary: "#DDF0E4"
  },
  "black-tech": {
    section: "This Week",
    edition: "Signal Report",
    masthead: "Signal Report",
    issue: "Issue 29",
    motif: "terminal-outline",
    accent: "#173C76",
    paper: "#F8FBFF",
    secondary: "#DCE9F8"
  },
  "creative-community": {
    section: "Editor's Pick",
    edition: "Studio Notes",
    masthead: "Studio Notes",
    issue: "Issue 64",
    motif: "brush-outline",
    accent: "#B95E3F",
    paper: "#FFF8F2",
    secondary: "#F7DDCE"
  },
  "food-culture": {
    section: "Table Notes",
    edition: "Local Taste",
    masthead: "The Table",
    issue: "Issue 83",
    motif: "restaurant-outline",
    accent: "#A95E35",
    paper: "#FFF8EC",
    secondary: "#F2DBB6"
  },
  "faith-community": {
    section: "Quiet Read",
    edition: "Community Care",
    masthead: "Common Ground",
    issue: "Issue 17",
    motif: "sunny-outline",
    accent: "#8D6A2F",
    paper: "#FFF9E8",
    secondary: "#E9DDBE"
  },
  travel: {
    section: "Field Guide",
    edition: "Open Roads",
    masthead: "Field Notes",
    issue: "Issue 41",
    motif: "compass-outline",
    accent: "#377CA3",
    paper: "#F5FBFF",
    secondary: "#D5ECF8"
  }
};

export type ContentLayer = "Editorial" | "Reading" | "Community";
export type EditionModuleType =
  | "lead_story"
  | "what_changed"
  | "community_question"
  | "reading_list"
  | "recommendation"
  | "caught_up";

export type EditionModule = {
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
};

export function buildTodayEdition(joinedFeeds: Smartfeed[]): EditionModule[] {
  const atlanta = joinedFeeds.find((feed) => feed.id === "atlanta") ?? launchFeeds[0];
  const blackTech = joinedFeeds.find((feed) => feed.id === "black-tech") ?? launchFeeds[1];
  const creative = joinedFeeds.find((feed) => feed.id === "creative-community") ?? launchFeeds[2];
  const atlantaItems = feedItems.filter((item) => item.feedId === atlanta.id);
  const readingItems = feedItems.filter((item) => item.imported);
  const communityItems = feedItems.filter((item) => !item.imported);
  const creativeItems = feedItems.filter((item) => item.feedId === creative.id);

  return [
    {
      id: "lead-atlanta",
      type: "lead_story",
      layer: "Reading",
      feed: atlanta,
      item: atlantaItems[0],
      title: atlantaItems[0]?.title ?? "A useful local guide for today",
      body: atlantaItems[0]?.excerpt ?? "A compact local read chosen because it matches your city and saved interests.",
      action: "Read the guide",
      reason: "Based on your Atlanta interests."
    },
    {
      id: "changed-today",
      type: "what_changed",
      layer: "Editorial",
      feed: atlanta,
      title: "What changed since your last visit",
      body: "A weekend guide was updated, one city notice came in, and a Grant Park recommendation is gathering useful replies.",
      action: "Review updates",
      reason: "Updated since this morning.",
      items: atlantaItems.slice(0, 3)
    },
    {
      id: "open-question",
      type: "community_question",
      layer: "Community",
      feed: blackTech,
      item: communityItems.find((item) => item.feedId === blackTech.id),
      title: "What makes a career community actually useful?",
      body: "A practical prompt for builders, designers, and operators.",
      action: "Join the conversation",
      reason: "A practical Black Tech thread is active today."
    },
    {
      id: "worth-your-time",
      type: "reading_list",
      layer: "Reading",
      feed: creative,
      title: "Worth your time",
      body: "Three selected reads from your joined interests.",
      action: "Add to reading list",
      reason: "Selected from Atlanta, Black Tech, and Creative Community.",
      items: readingItems.slice(0, 3)
    },
    {
      id: "recommendation",
      type: "recommendation",
      layer: "Community",
      feed: launchFeeds.find((feed) => feed.id === "food-culture") ?? atlanta,
      item: communityItems.find((item) => item.itemType === "recommendation"),
      title: communityItems.find((item) => item.itemType === "recommendation")?.title ?? "A recommendation worth saving",
      body: communityItems.find((item) => item.itemType === "recommendation")?.body ?? "A useful weekend save from your local network.",
      action: "Add to weekend",
      reason: "Saved by local readers planning the weekend."
    },
    {
      id: "caught-up",
      type: "caught_up",
      layer: "Editorial",
      feed: creative,
      title: "You're caught up",
      body: "Six useful pieces. Nothing urgent waiting.",
      action: "Open Library",
      reason: "Return later for meaningful updates.",
      items: creativeItems.slice(0, 2)
    }
  ];
}

export function getLayerTone(layer: ContentLayer) {
  if (layer === "Community") return palette.clay;
  if (layer === "Reading") return palette.indigo;
  return palette.deepForest;
}
