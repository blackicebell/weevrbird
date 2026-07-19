import { Ionicons } from "@expo/vector-icons";

import { palette } from "../theme/tokens";
import { ContentLayer, SmartfeedFilter } from "../types/product";

export type AppTab = "Today" | "Feeds" | "Contribute" | "Library" | "You";
export type OnboardingStep = "welcome" | "city" | "interests" | "avatar" | "profile" | "ready";

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
  { key: "Saved", label: "Saved" }
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

export const avatarMarks: Array<{
  id: string;
  label: string;
  background: string;
  foreground: string;
  accent: string;
  chest: string;
  beak: string;
  crest: boolean;
  neckTilt: number;
}> = [
  { id: "green-weaver", label: "Green Weaver", background: "#DDF0E4", foreground: "#0F3D2E", accent: "#DBA85B", chest: "#A6B39A", beak: "#C86F4A", crest: false, neckTilt: -8 },
  { id: "blue-finch", label: "Blue Finch", background: "#DCE9F8", foreground: "#173C76", accent: "#4F9E77", chest: "#E8EEF0", beak: "#DBA85B", crest: true, neckTilt: -4 },
  { id: "clay-sparrow", label: "Clay Sparrow", background: "#F7DDCE", foreground: "#8E442B", accent: "#2D63B5", chest: "#FFF8F2", beak: "#DBA85B", crest: false, neckTilt: -10 },
  { id: "gold-oriole", label: "Gold Oriole", background: "#E9DDBE", foreground: "#6D4C17", accent: "#0F3D2E", chest: "#DBA85B", beak: "#C86F4A", crest: true, neckTilt: -6 },
  { id: "teal-heron", label: "Teal Heron", background: "#E8EEF0", foreground: "#3E6D75", accent: "#C86F4A", chest: "#D6F1E5", beak: "#DBA85B", crest: false, neckTilt: -12 },
  { id: "sage-wren", label: "Sage Wren", background: "#E3E8DA", foreground: "#4E6251", accent: "#DBA85B", chest: "#FFFDF8", beak: "#C86F4A", crest: false, neckTilt: -5 },
  { id: "plum-martin", label: "Plum Martin", background: "#ECE3EC", foreground: "#5A3D55", accent: "#4F9E77", chest: "#F7DDCE", beak: "#DBA85B", crest: true, neckTilt: -7 },
  { id: "brown-thrush", label: "Brown Thrush", background: "#E7D7C8", foreground: "#866653", accent: "#173C76", chest: "#FFFDF8", beak: "#DBA85B", crest: false, neckTilt: -9 }
];

export const avatars = avatarMarks.map((mark) => mark.label);

export const profileCollections = [
  {
    title: "Atlanta places I return to",
    meta: "Five saved places / Updated this week",
    description: "Coffee, books, galleries, and tucked-away corners.",
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
    section: "Reflection",
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

export function getLayerTone(layer: ContentLayer) {
  if (layer === "Community") return palette.clay;
  if (layer === "Reading") return palette.indigo;
  return palette.deepForest;
}
