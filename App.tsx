import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts
} from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold
} from "@expo-google-fonts/playfair-display";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  completeOnboarding,
  createDefaultUserAppState,
  getUserContentState,
  hydrateUserAppState,
  placeContribution,
  selectFeed,
  setActiveFilter as setUserActiveFilter,
  setActiveTab as setUserActiveTab,
  submitContribution,
  toggleSavedItem as toggleUserSavedItem,
  toggleUsefulItem as toggleUserUsefulItem,
  updateDraft,
  updateDraftType,
  UserAppState
} from "./src/app/appState";
import { AppTab, OnboardingStep } from "./src/app/editorial";
import { clearPersistedAppState, loadPersistedAppState, savePersistedAppState } from "./src/app/persistence";
import { TabBar } from "./src/components/TabBar";
import { localDataService } from "./src/data/localDataService";
import { ContributeScreen } from "./src/screens/ContributeScreen";
import { DetailScreen } from "./src/screens/DetailScreen";
import { FeedsScreen } from "./src/screens/FeedsScreen";
import { LibraryScreen } from "./src/screens/LibraryScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { TodayScreen } from "./src/screens/TodayScreen";
import { useTheme } from "./src/theme/useTheme";
import { FeedItem } from "./src/types/product";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dockClearance = Math.max(96, insets.bottom + 86);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold
  });
  const qaMode = isContributionQaMode();
  const persistedState = useMemo(() => loadInitialAppState(), []);
  const defaultSavedItemIds = useMemo(() => localDataService.getDefaultSavedItemIds(), []);
  const [userAppState, setUserAppState] = useState(() => hydrateUserAppState(persistedState, defaultSavedItemIds));
  const [buildingIssue, setBuildingIssue] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("welcome");
  const [detailItem, setDetailItem] = useState<FeedItem | null>(null);
  const [search, setSearch] = useState("");

  const selectedFeed = useMemo(() => localDataService.getFeed(userAppState.selectedFeedId), [userAppState.selectedFeedId]);
  const userContentState = useMemo(() => getUserContentState(userAppState), [userAppState.savedItemIds, userAppState.usefulItemIds]);
  const joinedFeeds = useMemo(() => localDataService.getJoinedFeeds(), []);
  const savedItems = useMemo(() => localDataService.getSavedItems(userContentState), [userContentState]);
  const visibleFeedItems = useMemo(
    () => localDataService.getFeedItems(selectedFeed.id, userAppState.activeFilter, userContentState, userAppState.submittedContributions),
    [selectedFeed.id, userAppState.activeFilter, userContentState, userAppState.submittedContributions]
  );
  const reviewContributionCount = userAppState.submittedContributions.filter((contribution) => contribution.status === "review").length;

  const updateUserAppState = (updates: Partial<UserAppState>) => {
    setUserAppState((current) => ({ ...current, ...updates }));
  };

  const setActiveTab = (activeTab: AppTab) => {
    setUserAppState((current) => setUserActiveTab(current, activeTab));
  };

  const toggleSavedItem = (itemId: string) => {
    setUserAppState((current) => toggleUserSavedItem(current, itemId));
  };

  const toggleUsefulItem = (itemId: string) => {
    setUserAppState((current) => toggleUserUsefulItem(current, itemId));
  };

  const openDetail = (item: FeedItem) => {
    setDetailItem(item);
  };

  const closeDetail = () => {
    setDetailItem(null);
  };

  const resetApp = () => {
    clearPersistedAppState();
    setUserAppState(createDefaultUserAppState(defaultSavedItemIds));
    setBuildingIssue(false);
    setOnboardingStep("welcome");
    setDetailItem(null);
    setSearch("");
  };

  useEffect(() => {
    if (!buildingIssue) return;

    const timer = window.setTimeout(() => {
      setBuildingIssue(false);
      setUserAppState((current) => completeOnboarding(current));
    }, 900);

    return () => window.clearTimeout(timer);
  }, [buildingIssue]);

  useEffect(() => {
    if (qaMode) return;
    if (!userAppState.onboarded) {
      clearPersistedAppState();
      return;
    }

    savePersistedAppState(userAppState);
  }, [userAppState]);

  if (!fontsLoaded) {
    return null;
  }

  if (buildingIssue) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
          <AppBackground theme={theme} />
          <IssueBuildScreen theme={theme} selectedCity={userAppState.selectedCity} selectedInterests={userAppState.selectedInterests} />
        </SafeAreaView>
      </>
    );
  }

  if (!userAppState.onboarded) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
          <AppBackground theme={theme} />
          <OnboardingScreen
            step={onboardingStep}
            setStep={setOnboardingStep}
            selectedCity={userAppState.selectedCity}
            setSelectedCity={(selectedCity) => updateUserAppState({ selectedCity })}
            selectedInterests={userAppState.selectedInterests}
            setSelectedInterests={(selectedInterests) => updateUserAppState({ selectedInterests })}
            selectedAvatar={userAppState.selectedAvatar}
            setSelectedAvatar={(selectedAvatar) => updateUserAppState({ selectedAvatar })}
            finish={() => setBuildingIssue(true)}
            theme={theme}
          />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
        <AppBackground theme={theme} />
        <View style={[styles.appShell, { marginBottom: dockClearance }]}>
          {userAppState.activeTab === "Today" && (
            <TodayScreen
              theme={theme}
              joinedFeeds={joinedFeeds}
              submittedContributionCount={reviewContributionCount}
              setSelectedFeed={(feed) => setUserAppState((current) => selectFeed(current, feed.id))}
              setActiveTab={setActiveTab}
              onOpenDetail={openDetail}
            />
          )}
          {userAppState.activeTab === "Feeds" && (
            <FeedsScreen
              theme={theme}
              selectedFeed={selectedFeed}
              setSelectedFeed={(feed) => setUserAppState((current) => selectFeed(current, feed.id))}
              activeFilter={userAppState.activeFilter}
              setActiveFilter={(activeFilter) => setUserAppState((current) => setUserActiveFilter(current, activeFilter))}
              visibleFeedItems={visibleFeedItems}
              savedItemIds={userAppState.savedItemIds}
              usefulItemIds={userAppState.usefulItemIds}
              toggleSavedItem={toggleSavedItem}
              toggleUsefulItem={toggleUsefulItem}
              onOpenDetail={openDetail}
            />
          )}
          {userAppState.activeTab === "Contribute" && (
            <ContributeScreen
              theme={theme}
              draftType={userAppState.draftType}
              setDraftType={(draftType) => setUserAppState((current) => updateDraftType(current, draftType))}
              draft={userAppState.draft}
              setDraft={(draft) => setUserAppState((current) => updateDraft(current, draft))}
              submittedContributions={userAppState.submittedContributions}
              onSubmitContribution={(contribution) => setUserAppState((current) => submitContribution(current, contribution))}
              onPlaceContribution={(contributionId, feedId) => setUserAppState((current) => placeContribution(current, contributionId, feedId))}
            />
          )}
          {userAppState.activeTab === "Library" && (
            <LibraryScreen
              theme={theme}
              savedItems={savedItems}
              search={search}
              setSearch={setSearch}
              savedItemIds={userAppState.savedItemIds}
              usefulItemIds={userAppState.usefulItemIds}
              toggleSavedItem={toggleSavedItem}
              toggleUsefulItem={toggleUsefulItem}
              onOpenDetail={openDetail}
            />
          )}
          {userAppState.activeTab === "You" && (
            <ProfileScreen
              theme={theme}
              selectedAvatar={userAppState.selectedAvatar}
              selectedInterests={userAppState.selectedInterests}
              submittedContributions={userAppState.submittedContributions}
              onPlaceContribution={(contributionId, feedId) => setUserAppState((current) => placeContribution(current, contributionId, feedId))}
              onOpenContribute={() => setActiveTab("Contribute")}
              onOpenDetail={openDetail}
              onResetApp={resetApp}
            />
          )}
          {detailItem && (
            <View style={[styles.detailOverlay, { backgroundColor: theme.bg }]}>
              <AppBackground theme={theme} />
              <DetailScreen
                item={detailItem}
                theme={theme}
                saved={userAppState.savedItemIds.includes(detailItem.id)}
                markedUseful={userAppState.usefulItemIds.includes(detailItem.id)}
                onBack={closeDetail}
                onToggleSaved={() => toggleSavedItem(detailItem.id)}
                onToggleUseful={() => toggleUsefulItem(detailItem.id)}
              />
            </View>
          )}
        </View>
        {!detailItem && <TabBar activeTab={userAppState.activeTab} setActiveTab={setActiveTab} theme={theme} bottomInset={insets.bottom} />}
      </SafeAreaView>
    </>
  );
}

function loadInitialAppState(): Partial<UserAppState> {
  const persistedState = loadPersistedAppState();
  if (!isContributionQaMode()) return persistedState;

  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab") as AppTab | null;
  const feedId = params.get("feed") ?? "atlanta";

  return {
    onboarded: true,
    selectedCity: "Atlanta",
    selectedInterests: ["Atlanta", "Black Tech", "UX Design"],
    selectedAvatar: 0,
    activeTab: tab ?? "Contribute",
    selectedFeedId: feedId,
    activeFilter: "Latest",
    draftType: "Recommendation",
    draft: "",
    savedItemIds: ["item-1", "item-3"],
    usefulItemIds: [],
    submittedContributions: [
      {
        id: "local-qa-placed",
        type: "Recommendation",
        body: "Try the small Saturday print fair near the BeltLine before lunch. The vendors are easier to talk to early, and the zine table has the strongest local work.",
        feedId: "atlanta",
        status: "placed",
        createdAt: "2026-07-17T14:00:00.000Z",
        placedAt: "2026-07-17T14:03:00.000Z"
      },
      {
        id: "local-qa-review",
        type: "Question",
        body: "What makes a neighborhood event feel genuinely welcoming instead of just well promoted?",
        feedId: "black-tech",
        status: "review",
        createdAt: "2026-07-17T13:48:00.000Z"
      }
    ]
  };
}

function isContributionQaMode() {
  if (typeof window === "undefined") return false;
  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") return false;

  const params = new URLSearchParams(window.location.search);
  return params.get("__qa") === "contribution";
}

function IssueBuildScreen({ theme, selectedCity, selectedInterests }: {
  theme: ReturnType<typeof useTheme>;
  selectedCity: string;
  selectedInterests: string[];
}) {
  const previewInterests = selectedInterests.filter((interest) => interest !== selectedCity).slice(0, 2);
  const buildRows = [
    `Local lens: ${selectedCity}`,
    `Sections: ${previewInterests.join(", ") || "Useful signal"}`,
    "Shape: finite issue with a clear ending"
  ];

  return (
    <View style={styles.issueBuildScreen}>
      <View style={[styles.issueBuildCard, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <Text style={[styles.issueBuildKicker, { color: theme.accent }]}>BUILDING YOUR ISSUE</Text>
        <Text style={[styles.issueBuildTitle, { color: theme.text }]}>Gathering the pieces worth your attention.</Text>
        <View style={styles.issueBuildRows}>
          {buildRows.map((row, index) => (
            <View key={row} style={styles.issueBuildRow}>
              <View style={[styles.issueBuildDot, { backgroundColor: index === 2 ? theme.text : theme.accent }]} />
              <Text style={[styles.issueBuildText, { color: theme.muted }]}>{row}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function AppBackground({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <View pointerEvents="none" style={styles.backgroundLayer}>
      <LinearGradient
        colors={theme.dark ? ["#0E1715", "#11231D", "#0E1715"] : ["#FBFFFD", "#F1FAF7", "#E4F4ED", "#E3F1FF"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.windRibbon, styles.windRibbonTwo, { backgroundColor: theme.dark ? "rgba(45, 99, 181, 0.09)" : "rgba(227, 241, 255, 0.48)", borderColor: theme.line }]} />
      <View style={[styles.paperVeil, styles.paperVeilOne, { backgroundColor: theme.dark ? "rgba(214, 241, 229, 0.08)" : "rgba(214, 241, 229, 0.72)" }]} />
      <View style={[styles.backgroundRule, styles.backgroundRuleOne, { backgroundColor: theme.dark ? "rgba(214, 241, 229, 0.08)" : "rgba(15, 61, 46, 0.05)" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: "hidden"
  },
  appShell: {
    flex: 1,
    zIndex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center"
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3
  },
  issueBuildScreen: {
    flex: 1,
    zIndex: 1,
    padding: 20,
    justifyContent: "center",
    width: "100%",
    maxWidth: 560,
    alignSelf: "center"
  },
  issueBuildCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    gap: 18
  },
  issueBuildKicker: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold"
  },
  issueBuildTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  issueBuildRows: {
    gap: 12
  },
  issueBuildRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  issueBuildDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  issueBuildText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold"
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject
  },
  windRibbon: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 999,
    opacity: 0.72
  },
  windRibbonTwo: {
    width: 390,
    height: 68,
    top: 284,
    right: -170,
    transform: [{ rotate: "-31deg" }]
  },
  paperVeil: {
    position: "absolute",
    width: 260,
    height: 520,
    borderRadius: 16,
    opacity: 0.46,
    transform: [{ rotate: "-28deg" }]
  },
  paperVeilOne: {
    top: -64,
    right: -154
  },
  backgroundRule: {
    position: "absolute",
    height: 1,
    width: 220,
    opacity: 0.7
  },
  backgroundRuleOne: {
    top: 214,
    left: 22,
    transform: [{ rotate: "-18deg" }]
  }
});
