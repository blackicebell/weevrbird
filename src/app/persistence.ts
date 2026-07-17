import { AppTab } from "./editorial";
import { SmartfeedFilter } from "../types/product";

const STORAGE_KEY = "weevrbird:first-run-state:v1";

export type PersistedAppState = {
  onboarded?: boolean;
  selectedCity?: string;
  selectedInterests?: string[];
  selectedAvatar?: number;
  activeTab?: AppTab;
  selectedFeedId?: string;
  activeFilter?: SmartfeedFilter;
  draftType?: string;
  draft?: string;
  savedItemIds?: string[];
  usefulItemIds?: string[];
};

export function loadPersistedAppState(): PersistedAppState {
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return {};
  }
}

export function savePersistedAppState(state: PersistedAppState) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence should never block the app shell.
  }
}

export function clearPersistedAppState() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Reset should still update in-memory state even if storage is unavailable.
  }
}
