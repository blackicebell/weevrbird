import { AdminMetric, FeedItem, Person, Smartfeed } from "../types/product";

export const launchFeeds: Smartfeed[] = [
  {
    id: "atlanta",
    name: "Atlanta",
    type: "city",
    description: "Local culture, city updates, public notices, events, and neighborhood recommendations.",
    members: "2.4k local readers",
    newItems: 11,
    palette: "#56AB82",
    joined: true
  },
  {
    id: "black-tech",
    name: "Black Tech",
    type: "community",
    description: "Founders, designers, engineers, operators, and useful career signals.",
    members: "940 builders",
    newItems: 7,
    palette: "#2D63B5",
    joined: true
  },
  {
    id: "creative-community",
    name: "Creative Community",
    type: "interest",
    description: "Design, writing, photography, music, craft, and creative work in progress.",
    members: "1.1k working creatives",
    newItems: 5,
    palette: "#F47E4D",
    joined: true
  },
  {
    id: "food-culture",
    name: "Food and Culture",
    type: "interest",
    description: "Restaurants, pop-ups, recipes, cultural notes, and local recommendations.",
    members: "1.8k local regulars",
    newItems: 3,
    palette: "#DBA85B",
    joined: true
  },
  {
    id: "faith-community",
    name: "Faith and Community",
    type: "community",
    description: "Thoughtful questions, mutual care, reading, gatherings, and service.",
    members: "710 thoughtful readers",
    newItems: 2,
    palette: "#0F3D2E",
    joined: false
  },
  {
    id: "travel",
    name: "Travel",
    type: "interest",
    description: "Solo trips, city guides, practical itineraries, and saved discoveries.",
    members: "1.5k field-note keepers",
    newItems: 6,
    palette: "#61A7D8",
    joined: false
  }
];

export const feedItems: FeedItem[] = [
  {
    id: "item-1",
    itemType: "external_article",
    feedId: "atlanta",
    sourceId: "atl-mag",
    sourceName: "Atlanta Magazine",
    title: "A new weekend guide to small cultural spaces across Atlanta",
    excerpt: "A compact guide to galleries, listening rooms, bookstores, and neighborhood events worth keeping on your radar.",
    url: "https://example.com/atlanta-culture",
    publishedAt: "Today",
    createdAt: "2026-07-17T09:00:00Z",
    imported: true,
    saved: true,
    replies: 14,
    reactionLabel: "People found this useful"
  },
  {
    id: "item-2",
    itemType: "question",
    feedId: "food-culture",
    authorId: "maya",
    title: "Where would you take someone for a first Atlanta food weekend?",
    body: "Looking for places that feel specific to the city, not just the obvious lists. Bonus points for a good walking plan between stops.",
    publishedAt: "38m ago",
    createdAt: "2026-07-17T10:15:00Z",
    imported: false,
    replies: 23,
    reactionLabel: "This sparked discussion"
  },
  {
    id: "item-3",
    itemType: "discussion",
    feedId: "black-tech",
    authorId: "darius",
    title: "What makes a career community actually useful?",
    body: "I keep seeing big communities turn into job boards and launch announcements. What small rituals make people keep showing up?",
    publishedAt: "1h ago",
    createdAt: "2026-07-17T09:40:00Z",
    imported: false,
    saved: true,
    replies: 18,
    reactionLabel: "Builders saved this"
  },
  {
    id: "item-4",
    itemType: "external_podcast",
    feedId: "creative-community",
    sourceName: "Independent Design Radio",
    title: "Designing for slower attention",
    excerpt: "A conversation about editorial interfaces, quieter social spaces, and the value of letting people read before reacting.",
    url: "https://example.com/design-podcast",
    publishedAt: "Yesterday",
    createdAt: "2026-07-16T15:00:00Z",
    imported: true,
    replies: 9,
    reactionLabel: "Thought-provoking"
  },
  {
    id: "item-5",
    itemType: "recommendation",
    feedId: "atlanta",
    authorId: "imani",
    title: "Try the Sunday market near Grant Park before noon",
    body: "Better parking, quieter lines, and the flower vendor still has the good bundles. The coffee stand is worth the wait.",
    publishedAt: "2h ago",
    createdAt: "2026-07-17T08:05:00Z",
    imported: false,
    replies: 11,
    reactionLabel: "Locals want to try this"
  },
  {
    id: "item-6",
    itemType: "long_read",
    feedId: "creative-community",
    authorId: "noah",
    title: "Notes on making portfolio work feel less performative",
    excerpt: "A practical essay about showing thinking, constraints, and taste without turning every project into a stage.",
    publishedAt: "3h ago",
    createdAt: "2026-07-17T07:15:00Z",
    imported: false,
    replies: 7,
    reactionLabel: "Useful to creatives"
  },
  {
    id: "item-7",
    itemType: "official_update",
    feedId: "atlanta",
    sourceName: "City of Atlanta",
    title: "Weekend street closure notice for downtown events",
    excerpt: "A short official update with closures, transit notes, and expected reopening times.",
    url: "https://example.com/city-update",
    publishedAt: "Today",
    createdAt: "2026-07-17T06:30:00Z",
    imported: true,
    replies: 4,
    reactionLabel: "Saved by local readers"
  }
];

export const people: Person[] = [
  {
    id: "maya",
    displayName: "Maya Ellis",
    username: "mayae",
    city: "Atlanta",
    bio: "Writes about food, neighborhoods, books, and better weekend plans.",
    interests: ["Food", "Atlanta", "Culture"],
    linked: true,
    avatar: 0
  },
  {
    id: "darius",
    displayName: "Darius King",
    username: "dking",
    city: "Atlanta",
    bio: "Product operator, community builder, and practical startup notes collector.",
    interests: ["Black Tech", "Startups", "UX"],
    linked: false,
    avatar: 1
  },
  {
    id: "imani",
    displayName: "Imani Brooks",
    username: "imani",
    city: "Decatur",
    bio: "Finding quiet places, local gems, and useful rituals.",
    interests: ["Local Food", "Travel", "Faith"],
    linked: false,
    avatar: 2
  },
  {
    id: "noah",
    displayName: "Noah Reed",
    username: "noahnotes",
    city: "Atlanta",
    bio: "Collects notes on slower attention, independent publishing, and creative work that feels grounded.",
    interests: ["UX Design", "Books", "Creative Community"],
    linked: false,
    avatar: 7
  }
];

export const interests = [
  "Atlanta",
  "Black Tech",
  "UX Design",
  "Nigerian Business",
  "Faith",
  "Solo Travel",
  "Local Food",
  "Photography",
  "Parenting",
  "Independent Music",
  "Books",
  "Startups"
];

export const adminMetrics: AdminMetric[] = [
  { label: "Reports awaiting review", value: "8", tone: "attention" },
  { label: "External items imported", value: "214", tone: "good" },
  { label: "Ingestion failures", value: "3", tone: "attention" },
  { label: "Active joined feeds", value: "42", tone: "calm" }
];
