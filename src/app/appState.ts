import { AppTab } from "./editorial";
import { IssuePace, SmartfeedFilter, SubmittedContribution, UserContentState } from "../types/product";

export type UserAppState = {
  onboarded: boolean;
  selectedCity: string;
  selectedInterests: string[];
  selectedAvatar: number;
  activeTab: AppTab;
  selectedFeedId: string;
  activeFilter: SmartfeedFilter;
  issuePace: IssuePace;
  draftType: string;
  draft: string;
  savedItemIds: string[];
  usefulItemIds: string[];
  seenContributionActivityIds: string[];
  submittedContributions: SubmittedContribution[];
};

export type PartialUserAppState = Partial<UserAppState>;

export const DEFAULT_USER_APP_STATE: UserAppState = {
  onboarded: false,
  selectedCity: "Atlanta",
  selectedInterests: ["Atlanta", "Black Tech", "UX Design"],
  selectedAvatar: 0,
  activeTab: "Today",
  selectedFeedId: "atlanta",
  activeFilter: "Latest",
  issuePace: "Balanced",
  draftType: "Note",
  draft: "",
  savedItemIds: [],
  usefulItemIds: [],
  seenContributionActivityIds: [],
  submittedContributions: []
};

export function createDefaultUserAppState(defaultSavedItemIds: string[] = []): UserAppState {
  return {
    ...DEFAULT_USER_APP_STATE,
    savedItemIds: defaultSavedItemIds
  };
}

export function hydrateUserAppState(
  persistedState: PartialUserAppState,
  defaultSavedItemIds: string[] = []
): UserAppState {
  return {
    ...createDefaultUserAppState(defaultSavedItemIds),
    ...persistedState,
    selectedInterests: persistedState.selectedInterests ?? DEFAULT_USER_APP_STATE.selectedInterests,
    issuePace: persistedState.issuePace ?? DEFAULT_USER_APP_STATE.issuePace,
    savedItemIds: persistedState.savedItemIds ?? defaultSavedItemIds,
    usefulItemIds: persistedState.usefulItemIds ?? [],
    seenContributionActivityIds: persistedState.seenContributionActivityIds ?? [],
    submittedContributions: persistedState.submittedContributions ?? []
  };
}

export function getUserContentState(state: UserAppState): UserContentState {
  return {
    savedItemIds: state.savedItemIds,
    usefulItemIds: state.usefulItemIds
  };
}

export function toggleItemId(itemIds: string[], itemId: string) {
  return itemIds.includes(itemId) ? itemIds.filter((id) => id !== itemId) : [...itemIds, itemId];
}

export function setActiveTab(state: UserAppState, activeTab: AppTab): UserAppState {
  return { ...state, activeTab };
}

export function selectFeed(state: UserAppState, selectedFeedId: string): UserAppState {
  return { ...state, selectedFeedId };
}

export function setActiveFilter(state: UserAppState, activeFilter: SmartfeedFilter): UserAppState {
  return { ...state, activeFilter };
}

export function setIssuePace(state: UserAppState, issuePace: IssuePace): UserAppState {
  return { ...state, issuePace };
}

export function toggleSavedItem(state: UserAppState, itemId: string): UserAppState {
  return { ...state, savedItemIds: toggleItemId(state.savedItemIds, itemId) };
}

export function toggleUsefulItem(state: UserAppState, itemId: string): UserAppState {
  return { ...state, usefulItemIds: toggleItemId(state.usefulItemIds, itemId) };
}

export function markContributionActivitySeen(state: UserAppState, activityIds: string[]): UserAppState {
  return {
    ...state,
    seenContributionActivityIds: Array.from(new Set(state.seenContributionActivityIds.concat(activityIds)))
  };
}

export function updateDraft(state: UserAppState, draft: string): UserAppState {
  return { ...state, draft };
}

export function updateDraftType(state: UserAppState, draftType: string): UserAppState {
  return { ...state, draftType };
}

export function submitContribution(state: UserAppState, contribution: SubmittedContribution): UserAppState {
  return {
    ...state,
    draft: "",
    submittedContributions: [contribution, ...state.submittedContributions].slice(0, 8)
  };
}

export function placeContribution(state: UserAppState, contributionId: string, feedId: string): UserAppState {
  return {
    ...state,
    submittedContributions: state.submittedContributions.map((contribution) => (
      contribution.id === contributionId
        ? { ...contribution, feedId, status: "placed", placedAt: new Date().toISOString() }
        : contribution
    ))
  };
}

export function completeOnboarding(state: UserAppState): UserAppState {
  return { ...state, onboarded: true, activeTab: "Today" };
}
