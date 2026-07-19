import { AppTab, avatarMarks, contributionTypes, filters, OnboardingStep, tabs } from "./editorial";
import { IssuePace, SmartfeedFilter, SubmittedContribution, UserContentState } from "../types/product";

export type AuthStatus = "anonymous" | "link_sent" | "signed_in";

const ONBOARDING_STEPS: OnboardingStep[] = ["welcome", "city", "interests", "avatar", "profile", "ready"];
const ISSUE_PACES: IssuePace[] = ["Brief", "Balanced", "Deep"];
const AUTH_STATUSES: AuthStatus[] = ["anonymous", "link_sent", "signed_in"];

export type UserAppState = {
  onboarded: boolean;
  onboardingStep: OnboardingStep;
  selectedCity: string;
  selectedInterests: string[];
  selectedAvatar: number;
  profileName: string;
  profileHandle: string;
  profileBio: string;
  accountEmail: string;
  authStatus: AuthStatus;
  authLinkSentAt?: string;
  smartfeedExplainerDismissed: boolean;
  activeTab: AppTab;
  selectedFeedId: string;
  activeFilter: SmartfeedFilter;
  issuePace: IssuePace;
  draftType: string;
  draft: string;
  savedItemIds: string[];
  usefulItemIds: string[];
  openedItemIds: string[];
  connectionIds: string[];
  seenContributionActivityIds: string[];
  submittedContributions: SubmittedContribution[];
};

export type PartialUserAppState = Partial<UserAppState>;

export const DEFAULT_USER_APP_STATE: UserAppState = {
  onboarded: false,
  onboardingStep: "welcome",
  selectedCity: "Atlanta",
  selectedInterests: ["Atlanta", "Tech", "UX Design"],
  selectedAvatar: 0,
  profileName: "Field Architect",
  profileHandle: "fieldarchitect",
  profileBio: "Neighborhood design, independent bookstores, practical tech, and the places where people naturally gather.",
  accountEmail: "",
  authStatus: "anonymous",
  authLinkSentAt: undefined,
  smartfeedExplainerDismissed: false,
  activeTab: "Today",
  selectedFeedId: "atlanta",
  activeFilter: "Latest",
  issuePace: "Balanced",
  draftType: "Note",
  draft: "",
  savedItemIds: [],
  usefulItemIds: [],
  openedItemIds: [],
  connectionIds: ["maya"],
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
    onboarded: Boolean(persistedState.onboarded),
    onboardingStep: normalizeOnboardingStep(persistedState.onboardingStep),
    selectedCity: normalizeOptionalText(persistedState.selectedCity, DEFAULT_USER_APP_STATE.selectedCity),
    selectedInterests: normalizeStringList(persistedState.selectedInterests, DEFAULT_USER_APP_STATE.selectedInterests),
    selectedAvatar: normalizeSelectedAvatar(persistedState.selectedAvatar),
    profileName: persistedState.profileName ?? DEFAULT_USER_APP_STATE.profileName,
    profileHandle: normalizeProfileHandle(persistedState.profileHandle ?? DEFAULT_USER_APP_STATE.profileHandle),
    profileBio: persistedState.profileBio ?? DEFAULT_USER_APP_STATE.profileBio,
    accountEmail: normalizeEmail(persistedState.accountEmail ?? DEFAULT_USER_APP_STATE.accountEmail),
    authStatus: normalizeAuthStatus(persistedState.authStatus),
    authLinkSentAt: persistedState.authLinkSentAt,
    smartfeedExplainerDismissed: persistedState.smartfeedExplainerDismissed ?? false,
    activeTab: normalizeActiveTab(persistedState.activeTab),
    activeFilter: normalizeActiveFilter(persistedState.activeFilter),
    issuePace: normalizeIssuePace(persistedState.issuePace),
    draftType: normalizeDraftType(persistedState.draftType),
    draft: normalizeOptionalText(persistedState.draft, ""),
    savedItemIds: normalizeStringList(persistedState.savedItemIds, defaultSavedItemIds),
    usefulItemIds: normalizeStringList(persistedState.usefulItemIds),
    openedItemIds: normalizeStringList(persistedState.openedItemIds).slice(0, 30),
    connectionIds: normalizeStringList(persistedState.connectionIds, DEFAULT_USER_APP_STATE.connectionIds),
    seenContributionActivityIds: normalizeStringList(persistedState.seenContributionActivityIds),
    submittedContributions: normalizeSubmittedContributions(persistedState.submittedContributions)
  };
}

export function normalizeProfileHandle(handle: string) {
  return handle.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeOnboardingStep(step?: string): OnboardingStep {
  return ONBOARDING_STEPS.includes(step as OnboardingStep) ? step as OnboardingStep : DEFAULT_USER_APP_STATE.onboardingStep;
}

export function normalizeActiveTab(activeTab?: string): AppTab {
  return tabs.some((tab) => tab.key === activeTab) ? activeTab as AppTab : DEFAULT_USER_APP_STATE.activeTab;
}

export function normalizeActiveFilter(activeFilter?: string): SmartfeedFilter {
  return filters.some((filter) => filter.key === activeFilter) ? activeFilter as SmartfeedFilter : DEFAULT_USER_APP_STATE.activeFilter;
}

export function normalizeIssuePace(issuePace?: string): IssuePace {
  return ISSUE_PACES.includes(issuePace as IssuePace) ? issuePace as IssuePace : DEFAULT_USER_APP_STATE.issuePace;
}

export function normalizeAuthStatus(authStatus?: string): AuthStatus {
  return AUTH_STATUSES.includes(authStatus as AuthStatus) ? authStatus as AuthStatus : DEFAULT_USER_APP_STATE.authStatus;
}

export function normalizeDraftType(draftType?: string) {
  return contributionTypes.includes(draftType ?? "") ? draftType as string : DEFAULT_USER_APP_STATE.draftType;
}

export function normalizeSelectedAvatar(selectedAvatar?: number) {
  if (typeof selectedAvatar !== "number" || !Number.isInteger(selectedAvatar)) return DEFAULT_USER_APP_STATE.selectedAvatar;
  if (selectedAvatar < 0 || selectedAvatar >= avatarMarks.length) return DEFAULT_USER_APP_STATE.selectedAvatar;
  return selectedAvatar;
}

function normalizeOptionalText(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function normalizeStringList(value?: string[], fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)));
}

function normalizeSubmittedContributions(contributions?: SubmittedContribution[]) {
  if (!Array.isArray(contributions)) return [];

  return contributions.filter((contribution) => (
    contribution &&
    typeof contribution.id === "string" &&
    typeof contribution.body === "string" &&
    typeof contribution.feedId === "string" &&
    typeof contribution.type === "string" &&
    (contribution.status === "draft" || contribution.status === "review" || contribution.status === "placed")
  )).slice(0, 8);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function getUserContentState(state: UserAppState): UserContentState {
  return {
    savedItemIds: state.savedItemIds,
    usefulItemIds: state.usefulItemIds,
    openedItemIds: state.openedItemIds
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

export function markItemOpened(state: UserAppState, itemId: string): UserAppState {
  return {
    ...state,
    openedItemIds: [itemId, ...state.openedItemIds.filter((id) => id !== itemId)].slice(0, 30)
  };
}

export function clearOpenedHistory(state: UserAppState): UserAppState {
  return {
    ...state,
    openedItemIds: []
  };
}

export function removeOpenedItem(state: UserAppState, itemId: string): UserAppState {
  return {
    ...state,
    openedItemIds: state.openedItemIds.filter((id) => id !== itemId)
  };
}

export function restoreOpenedItem(state: UserAppState, itemId: string): UserAppState {
  return {
    ...state,
    openedItemIds: [itemId, ...state.openedItemIds.filter((id) => id !== itemId)].slice(0, 30)
  };
}

export function restoreOpenedHistory(state: UserAppState, itemIds: string[]): UserAppState {
  return {
    ...state,
    openedItemIds: Array.from(new Set(itemIds.concat(state.openedItemIds))).slice(0, 30)
  };
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

export function requestEmailLink(state: UserAppState, email: string, penName?: string): UserAppState {
  return {
    ...state,
    accountEmail: normalizeEmail(email),
    profileName: penName?.trim() ? penName.trim().slice(0, 36) : state.profileName,
    authStatus: "link_sent",
    authLinkSentAt: new Date().toISOString()
  };
}

export function completeEmailSignIn(state: UserAppState): UserAppState {
  if (!state.accountEmail) return state;

  return {
    ...state,
    authStatus: "signed_in",
    authLinkSentAt: undefined
  };
}

export function signOut(state: UserAppState): UserAppState {
  return {
    ...state,
    accountEmail: "",
    authStatus: "anonymous",
    authLinkSentAt: undefined
  };
}

export function dismissSmartfeedExplainer(state: UserAppState): UserAppState {
  return { ...state, smartfeedExplainerDismissed: true };
}

export function completeOnboarding(state: UserAppState): UserAppState {
  return { ...state, onboarded: true, onboardingStep: "ready", activeTab: "Today" };
}
