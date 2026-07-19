import { FeedItemType } from "../types/product";

export function formatFeedItemType(itemType: FeedItemType) {
  switch (itemType) {
    case "note":
      return "Note";
    case "question":
      return "Question";
    case "discussion":
      return "Discussion";
    case "recommendation":
      return "Recommendation";
    case "link":
      return "Link";
    case "long_read":
      return "Long read";
    case "external_article":
      return "Article";
    case "external_video":
      return "Video";
    case "external_podcast":
      return "Podcast";
    case "external_event":
      return "Event";
    case "official_update":
      return "Official update";
    default:
      return titleCaseFeedItemType(itemType);
  }
}

function titleCaseFeedItemType(itemType: string) {
  return itemType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
