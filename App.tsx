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

import { AppTab, OnboardingStep } from "./src/app/editorial";
import { clearPersistedAppState, loadPersistedAppState, savePersistedAppState } from "./src/app/persistence";
import { TabBar } from "./src/components/TabBar";
import { feedItems, launchFeeds } from "./src/data/mockData";
import { ContributeScreen } from "./src/screens/ContributeScreen";
import { DetailScreen } from "./src/screens/DetailScreen";
import { FeedsScreen } from "./src/screens/FeedsScreen";
import { LibraryScreen } from "./src/screens/LibraryScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { TodayScreen } from "./src/screens/TodayScreen";
import { useTheme } from "./src/theme/useTheme";
import { FeedItem, SmartfeedFilter } from "./src/types/product";

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
  const persistedState = useMemo(() => loadPersistedAppState(), []);
  const defaultSavedItemIds = useMemo(() => feedItems.filter((item) => item.saved).map((item) => item.id), []);
  const [onboarded, setOnboarded] = useState(persistedState.onboarded ?? false);
  const [buildingIssue, setBuildingIssue] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("welcome");
  const [selectedCity, setSelectedCity] = useState(persistedState.selectedCity ?? "Atlanta");
  const [selectedInterests, setSelectedInterests] = useState(persistedState.selectedInterests ?? ["Atlanta", "Black Tech", "UX Design"]);
  const [selectedAvatar, setSelectedAvatar] = useState(persistedState.selectedAvatar ?? 0);
  const [activeTab, setActiveTab] = useState<AppTab>(persistedState.activeTab ?? "Today");
  const [selectedFeed, setSelectedFeed] = useState(launchFeeds.find((feed) => feed.id === persistedState.selectedFeedId) ?? launchFeeds[0]);
  const [activeFilter, setActiveFilter] = useState<SmartfeedFilter>(persistedState.activeFilter ?? "Latest");
  const [draftType, setDraftType] = useState(persistedState.draftType ?? "Note");
  const [draft, setDraft] = useState(persistedState.draft ?? "");
  const [savedItemIds, setSavedItemIds] = useState(persistedState.savedItemIds ?? defaultSavedItemIds);
  const [usefulItemIds, setUsefulItemIds] = useState(persistedState.usefulItemIds ?? []);
  const [detailItem, setDetailItem] = useState<FeedItem | null>(null);
  const [search, setSearch] = useState("");

  const joinedFeeds = useMemo(() => launchFeeds.filter((feed) => feed.joined), []);
  const feedItemsWithState = useMemo(() => (
    feedItems.map((item) => ({ ...item, saved: savedItemIds.includes(item.id) }))
  ), [savedItemIds]);
  const savedItems = useMemo(() => feedItemsWithState.filter((item) => savedItemIds.includes(item.id)), [feedItemsWithState, savedItemIds]);
  const visibleFeedItems = useMemo(() => {
    const current = feedItemsWithState.filter((item) => item.feedId === selectedFeed.id);
    if (activeFilter === "Conversations") return current.filter((item) => !item.imported);
    if (activeFilter === "Reading") return current.filter((item) => item.imported);
    if (activeFilter === "Saved") return current.filter((item) => savedItemIds.includes(item.id));
    return current;
  }, [activeFilter, feedItemsWithState, savedItemIds, selectedFeed.id]);

  const toggleSavedItem = (itemId: string) => {
    setSavedItemIds((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
  };

  const toggleUsefulItem = (itemId: string) => {
    setUsefulItemIds((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
  };

  const openDetail = (item: FeedItem) => {
    setDetailItem(item);
  };

  const closeDetail = () => {
    setDetailItem(null);
  };

  const resetApp = () => {
    clearPersistedAppState();
    setOnboarded(false);
    setBuildingIssue(false);
    setOnboardingStep("welcome");
    setSelectedCity("Atlanta");
    setSelectedInterests(["Atlanta", "Black Tech", "UX Design"]);
    setSelectedAvatar(0);
    setActiveTab("Today");
    setSelectedFeed(launchFeeds[0]);
    setActiveFilter("Latest");
    setDraftType("Note");
    setDraft("");
    setSavedItemIds(defaultSavedItemIds);
    setUsefulItemIds([]);
    setDetailItem(null);
    setSearch("");
  };

  useEffect(() => {
    if (!buildingIssue) return;

    const timer = window.setTimeout(() => {
      setBuildingIssue(false);
      setOnboarded(true);
      setActiveTab("Today");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [buildingIssue]);

  useEffect(() => {
    if (!onboarded) {
      clearPersistedAppState();
      return;
    }

    savePersistedAppState({
      onboarded,
      selectedCity,
      selectedInterests,
      selectedAvatar,
      activeTab,
      selectedFeedId: selectedFeed.id,
      activeFilter,
      draftType,
      draft,
      savedItemIds,
      usefulItemIds
    });
  }, [activeFilter, activeTab, draft, draftType, onboarded, savedItemIds, selectedAvatar, selectedCity, selectedFeed.id, selectedInterests, usefulItemIds]);

  if (!fontsLoaded) {
    return null;
  }

  if (buildingIssue) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
          <AppBackground theme={theme} />
          <IssueBuildScreen theme={theme} selectedCity={selectedCity} selectedInterests={selectedInterests} />
        </SafeAreaView>
      </>
    );
  }

  if (!onboarded) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
          <AppBackground theme={theme} />
          <OnboardingScreen
            step={onboardingStep}
            setStep={setOnboardingStep}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
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
          {activeTab === "Today" && (
            <TodayScreen theme={theme} joinedFeeds={joinedFeeds} setSelectedFeed={setSelectedFeed} setActiveTab={setActiveTab} onOpenDetail={openDetail} />
          )}
          {activeTab === "Feeds" && (
            <FeedsScreen
              theme={theme}
              selectedFeed={selectedFeed}
              setSelectedFeed={setSelectedFeed}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              visibleFeedItems={visibleFeedItems}
              savedItemIds={savedItemIds}
              usefulItemIds={usefulItemIds}
              toggleSavedItem={toggleSavedItem}
              toggleUsefulItem={toggleUsefulItem}
              onOpenDetail={openDetail}
            />
          )}
          {activeTab === "Contribute" && (
            <ContributeScreen
              theme={theme}
              draftType={draftType}
              setDraftType={setDraftType}
              draft={draft}
              setDraft={setDraft}
            />
          )}
          {activeTab === "Library" && (
            <LibraryScreen
              theme={theme}
              savedItems={savedItems}
              search={search}
              setSearch={setSearch}
              savedItemIds={savedItemIds}
              usefulItemIds={usefulItemIds}
              toggleSavedItem={toggleSavedItem}
              toggleUsefulItem={toggleUsefulItem}
              onOpenDetail={openDetail}
            />
          )}
          {activeTab === "You" && <ProfileScreen theme={theme} selectedAvatar={selectedAvatar} selectedInterests={selectedInterests} onOpenDetail={openDetail} onResetApp={resetApp} />}
          {detailItem && (
            <View style={[styles.detailOverlay, { backgroundColor: theme.bg }]}>
              <AppBackground theme={theme} />
              <DetailScreen
                item={detailItem}
                theme={theme}
                saved={savedItemIds.includes(detailItem.id)}
                markedUseful={usefulItemIds.includes(detailItem.id)}
                onBack={closeDetail}
                onToggleSaved={() => toggleSavedItem(detailItem.id)}
                onToggleUseful={() => toggleUsefulItem(detailItem.id)}
              />
            </View>
          )}
        </View>
        {!detailItem && <TabBar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} bottomInset={insets.bottom} />}
      </SafeAreaView>
    </>
  );
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
