import { PartialUserAppState, UserAppState } from "./appState";

const STORAGE_KEY = "weevrbird:first-run-state:v1";

export function loadPersistedAppState(): PartialUserAppState {
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as PartialUserAppState;
  } catch {
    return {};
  }
}

export function savePersistedAppState(state: UserAppState) {
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
