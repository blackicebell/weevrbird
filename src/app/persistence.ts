import { PartialUserAppState, UserAppState } from "./appState";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "weevrbird:first-run-state:v1";

export async function loadPersistedAppState(): Promise<PartialUserAppState> {
  try {
    if (Platform.OS !== "web") {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as PartialUserAppState : {};
    }

    if (typeof window === "undefined" || !window.localStorage) return {};

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as PartialUserAppState;
  } catch {
    return {};
  }
}

export async function savePersistedAppState(state: UserAppState) {
  try {
    if (Platform.OS !== "web") {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return;
    }

    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence should never block the app shell.
  }
}

export async function clearPersistedAppState() {
  try {
    if (Platform.OS !== "web") {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }

    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Reset should still update in-memory state even if storage is unavailable.
  }
}
