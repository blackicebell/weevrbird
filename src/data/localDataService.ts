import { feedItems, interests, launchFeeds, people } from "./mockData";
import {
  buildTodayEdition,
  getArchiveItems as selectArchiveItems,
  getFeedById,
  getDefaultSavedItemIds,
  getJoinedFeeds,
  getLibraryItems,
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
  getSavedItems(state: UserContentState, contributions: SubmittedContribution[] = []) {
    return selectSavedItems(getLibraryItems(feedItems, contributions), state);
  },
  getArchiveItems(state: UserContentState, contributions: SubmittedContribution[] = []) {
    return selectArchiveItems(getLibraryItems(feedItems, contributions), state);
  },
  searchLibrary(query: string, contributions: SubmittedContribution[] = []) {
    return searchLibraryItems(getLibraryItems(feedItems, contributions), query);
  },
  getShelfItems(title: string) {
    return selectShelfItems(title, feedItems);
  }
};
