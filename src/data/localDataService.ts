import { feedItems, interests, launchFeeds, people } from "./mockData";
import {
  buildTodayEdition,
  getArchiveItems as selectArchiveItems,
  getFeedById,
  getDefaultSavedItemIds,
  getJoinedFeeds,
  getPlacedContributionFeedItems,
  getSavedItems as selectSavedItems,
  getShelfItems as selectShelfItems,
  getVisibleFeedItems,
  searchLibraryItems
} from "./selectors";
import { SmartfeedFilter, SubmittedContribution, UserContentState } from "../types/product";

export const localDataService = {
  getFeeds() {
    return launchFeeds;
  },
  getFeed(feedId: string) {
    return getFeedById(feedId, launchFeeds);
  },
  getJoinedFeeds() {
    return getJoinedFeeds(launchFeeds);
  },
  getDefaultSavedItemIds() {
    return getDefaultSavedItemIds(feedItems);
  },
  getPeople() {
    return people;
  },
  getInterests() {
    return interests;
  },
  getFeaturedContribution() {
    return feedItems.find((item) => item.itemType === "recommendation") ?? feedItems[0];
  },
  getQuestionContribution() {
    return feedItems.find((item) => item.itemType === "discussion") ?? feedItems[2];
  },
  getTodayIssue() {
    return buildTodayEdition(getJoinedFeeds(launchFeeds), feedItems, launchFeeds);
  },
  getFeedItems(feedId: string, activeFilter: SmartfeedFilter, state: UserContentState, contributions: SubmittedContribution[] = []) {
    const placedItems = getPlacedContributionFeedItems(contributions);
    return getVisibleFeedItems({ items: placedItems.concat(feedItems), selectedFeedId: feedId, activeFilter, state });
  },
  getSavedItems(state: UserContentState) {
    return selectSavedItems(feedItems, state);
  },
  getArchiveItems(state: UserContentState) {
    return selectArchiveItems(feedItems, state);
  },
  searchLibrary(query: string) {
    return searchLibraryItems(feedItems, query);
  },
  getShelfItems(title: string) {
    return selectShelfItems(title, feedItems);
  }
};
