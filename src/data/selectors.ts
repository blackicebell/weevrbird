import { feedItems, launchFeeds } from "./mockData";
import { ContributionActivity, EditionModule, FeedItem, FeedItemType, IssuePace, Smartfeed, SmartfeedFilter, SubmittedContribution, UserContentState } from "../types/product";

export function getDefaultSavedItemIds(items: FeedItem[] = feedItems) {
  return items.filter((item) => item.saved).map((item) => item.id);
}

export function getJoinedFeeds(feeds: Smartfeed[] = launchFeeds) {
  return feeds.filter((feed) => feed.joined);
}

export function getFeedById(feedId: string, feeds: Smartfeed[] = launchFeeds) {
  return feeds.find((feed) => feed.id === feedId) ?? feeds[0];
}

export function applyUserContentState(items: FeedItem[], state: UserContentState) {
  return items.map((item) => ({ ...item, saved: state.savedItemIds.includes(item.id) }));
}

export function getSavedItems(items: FeedItem[], state: UserContentState) {
  return applyUserContentState(items, state).filter((item) => state.savedItemIds.includes(item.id));
}

export function mapPlacedContributionToFeedItem(contribution: SubmittedContribution): FeedItem {
  const engagementSummary = getContributionEngagementSummary(contribution);

  return {
    id: contribution.id,
    itemType: getContributionItemType(contribution.type),
    feedId: contribution.feedId,
    authorId: "you",
    sourceName: "From You",
    title: `${contribution.type} from you`,
    body: contribution.body,
    publishedAt: contribution.placedAt ? "Placed" : "Today",
    createdAt: contribution.placedAt ?? contribution.createdAt,
    imported: false,
    localStatus: "placed",
    replies: engagementSummary.replyPreview ? 1 : 0,
    reactionLabel: "Placed in this issue",
    engagementSummary
  };
}

function getContributionEngagementSummary(contribution: SubmittedContribution) {
  if (contribution.type === "Recommendation") {
    return {
      saves: 7,
      useful: 12,
      replyPreview: "This is exactly the kind of early-day detail I would have missed."
    };
  }

  if (contribution.type === "Question" || contribution.type === "Discussion") {
    return {
      saves: 3,
      useful: 8,
      replyPreview: "The small ritual that keeps people coming back is clearer than the launch announcement."
    };
  }

  if (contribution.type === "Link" || contribution.type === "Long Read") {
    return {
      saves: 5,
      useful: 9
    };
  }

  return {
    saves: 2,
    useful: 4
  };
}

export function getPlacedContributionFeedItems(contributions: SubmittedContribution[]) {
  return contributions
    .filter((contribution) => contribution.status === "placed")
    .map(mapPlacedContributionToFeedItem);
}

export function getContributionActivityItems(contributions: SubmittedContribution[], feeds: Smartfeed[] = launchFeeds): ContributionActivity[] {
  return contributions
    .filter((contribution) => contribution.status === "placed")
    .map((contribution) => {
      const item = mapPlacedContributionToFeedItem(contribution);
      const feed = getFeedById(contribution.feedId, feeds);
      const engagement = item.engagementSummary;

      if (engagement?.replyPreview) {
        return {
          id: `${contribution.id}-reply`,
          contributionId: contribution.id,
          title: "A thoughtful reply came in",
          body: engagement.replyPreview,
          feedName: feed.name,
          meta: `${engagement.useful} found useful / ${engagement.saves} saved`,
          icon: "chatbubble-ellipses-outline"
        };
      }

      if (engagement && engagement.saves > 0) {
        return {
          id: `${contribution.id}-saved`,
          contributionId: contribution.id,
          title: "Your contribution is being saved",
          body: "People are keeping it for later, even without starting a thread.",
          feedName: feed.name,
          meta: `${engagement.saves} saved / ${engagement.useful} useful`,
          icon: "bookmark-outline"
        };
      }

      return {
        id: `${contribution.id}-placed`,
        contributionId: contribution.id,
        title: "Your contribution was placed",
        body: "It is now part of the issue where it can help the right readers.",
        feedName: feed.name,
        meta: "Waiting for response",
        icon: "checkmark-circle-outline"
      };
    });
}

export function getReturnItems(items: FeedItem[], state: UserContentState) {
  const itemsWithState = applyUserContentState(items, state);
  const savedItems = itemsWithState.filter((item) => state.savedItemIds.includes(item.id));
  const openedItems: typeof savedItems = [];
  state.openedItemIds.forEach((itemId) => {
    const item = itemsWithState.find((entry) => entry.id === itemId);
    if (item) openedItems.push(item);
  });
  const returnItems = savedItems.concat(openedItems);

  return returnItems.filter((item, index) => returnItems.findIndex((entry) => entry.id === item.id) === index).slice(0, 30);
}

export function getLibraryItems(items: FeedItem[], contributions: SubmittedContribution[]) {
  const placedItems = getPlacedContributionFeedItems(contributions);
  return placedItems.concat(items);
}

function getContributionItemType(type: string): FeedItemType {
  if (type === "Question") return "question";
  if (type === "Discussion") return "discussion";
  if (type === "Recommendation") return "recommendation";
  if (type === "Link") return "link";
  if (type === "Long Read") return "long_read";
  return "note";
}

export function getVisibleFeedItems({
  items,
  selectedFeedId,
  activeFilter,
  state
}: {
  items: FeedItem[];
  selectedFeedId: string;
  activeFilter: SmartfeedFilter;
  state: UserContentState;
}) {
  const current = applyUserContentState(items, state).filter((item) => item.feedId === selectedFeedId);
  if (activeFilter === "Conversations") return current.filter((item) => !item.imported);
  if (activeFilter === "Reading") return current.filter((item) => item.imported);
  if (activeFilter === "Saved") return current.filter((item) => state.savedItemIds.includes(item.id));
  return current;
}

export function searchLibraryItems(items: FeedItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return items;

  return items.filter((item) => {
    const haystack = `${item.title ?? ""} ${item.body ?? ""} ${item.excerpt ?? ""} ${item.sourceName ?? ""}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function getShelfItems(title: string, items: FeedItem[] = feedItems) {
  if (title.includes("Atlanta")) {
    return items.filter((item) => item.feedId === "atlanta");
  }
  if (title.includes("slower attention")) {
    return items.filter((item) => item.feedId === "creative-community" || item.title?.includes("attention"));
  }
  return items.filter((item) => item.feedId === "creative-community" || item.feedId === "black-tech");
}

export function buildTodayEdition(joinedFeeds: Smartfeed[], issuePace: IssuePace = "Balanced", items: FeedItem[] = feedItems, feeds: Smartfeed[] = launchFeeds): EditionModule[] {
  const atlanta = joinedFeeds.find((feed) => feed.id === "atlanta") ?? feeds[0];
  const blackTech = joinedFeeds.find((feed) => feed.id === "black-tech") ?? feeds[1];
  const creative = joinedFeeds.find((feed) => feed.id === "creative-community") ?? feeds[2];
  const atlantaItems = items.filter((item) => item.feedId === atlanta.id);
  const readingItems = items.filter((item) => item.imported);
  const communityItems = items.filter((item) => !item.imported);
  const creativeItems = items.filter((item) => item.feedId === creative.id);

  const modules: EditionModule[] = [
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
      reason: "A practical Tech thread is active today."
    },
    {
      id: "worth-your-time",
      type: "reading_list",
      layer: "Reading",
      feed: creative,
      title: "Worth your time",
      body: "Three selected reads from your joined interests.",
      action: "Add to reading list",
      reason: "Selected from Atlanta, Tech, and Creative Community.",
      items: readingItems.slice(0, 3)
    },
    {
      id: "recommendation",
      type: "recommendation",
      layer: "Community",
      feed: feeds.find((feed) => feed.id === "food-culture") ?? atlanta,
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
      body: "Six selected pieces. Today's issue is complete.",
      action: "Open Library",
      reason: "Return later for meaningful updates.",
      items: creativeItems.slice(0, 2)
    }
  ];

  if (issuePace === "Brief") {
    return [
      modules[0],
      modules[1],
      {
        ...modules[5],
        body: "Four selected pieces. Today's issue is complete.",
        reason: "Brief issue selected.",
        items: creativeItems.slice(0, 1)
      }
    ];
  }

  if (issuePace === "Deep") {
    return [
      ...modules.slice(0, 5),
      {
        id: "context-thread",
        type: "reading_list",
        layer: "Reading",
        feed: blackTech,
        title: "Context to keep open",
        body: "A few extra pieces that explain why today's conversations are connected.",
        action: "Save the context",
        reason: "Deep issue selected.",
        items: readingItems.concat(creativeItems).slice(0, 3)
      },
      {
        ...modules[5],
        body: "Nine useful pieces. More context is ready for later.",
        reason: "Deep issue selected.",
        items: creativeItems.slice(0, 3)
      }
    ];
  }

  return modules;
}
