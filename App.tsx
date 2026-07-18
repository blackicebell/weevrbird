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
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  completeOnboarding,
  createDefaultUserAppState,
  getUserContentState,
  hydrateUserAppState,
  placeContribution,
  markContributionActivitySeen,
  selectFeed,
  setActiveFilter as setUserActiveFilter,
  setActiveTab as setUserActiveTab,
  setIssuePace as setUserIssuePace,
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
import { palette, radii, shadows, spacing } from "./src/theme/tokens";
import { useTheme } from "./src/theme/useTheme";
import { ContributionActivity, FeedItem, IssuePace } from "./src/types/product";

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
  const [activityOpen, setActivityOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tuneOpen, setTuneOpen] = useState(false);
  const [todaySearch, setTodaySearch] = useState("");
  const [search, setSearch] = useState("");

  const selectedFeed = useMemo(() => localDataService.getFeed(userAppState.selectedFeedId), [userAppState.selectedFeedId]);
  const userContentState = useMemo(() => getUserContentState(userAppState), [userAppState.savedItemIds, userAppState.usefulItemIds]);
  const joinedFeeds = useMemo(() => localDataService.getJoinedFeeds(), []);
  const savedItems = useMemo(
    () => localDataService.getSavedItems(userContentState, userAppState.submittedContributions),
    [userContentState, userAppState.submittedContributions]
  );
  const visibleFeedItems = useMemo(
    () => localDataService.getFeedItems(selectedFeed.id, userAppState.activeFilter, userContentState, userAppState.submittedContributions),
    [selectedFeed.id, userAppState.activeFilter, userContentState, userAppState.submittedContributions]
  );
  const contributionActivity = useMemo(
    () => localDataService.getContributionActivity(userAppState.submittedContributions),
    [userAppState.submittedContributions]
  );
  const unseenContributionActivity = useMemo(
    () => contributionActivity.filter((item) => !userAppState.seenContributionActivityIds.includes(item.id)),
    [contributionActivity, userAppState.seenContributionActivityIds]
  );
  const placedContributionItems = useMemo(
    () => localDataService.getPlacedContributionItems(userAppState.submittedContributions),
    [userAppState.submittedContributions]
  );
  const todaySearchResults = useMemo(
    () => localDataService.searchLibrary(todaySearch, userAppState.submittedContributions).slice(0, 6),
    [todaySearch, userAppState.submittedContributions]
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
    setActivityOpen(false);
    setSearchOpen(false);
    setTuneOpen(false);
    setDetailItem(item);
  };

  const openSearch = () => {
    setActivityOpen(false);
    setTuneOpen(false);
    setSearchOpen(true);
    setTodaySearch("");
  };

  const openActivity = () => {
    setSearchOpen(false);
    setTuneOpen(false);
    setActivityOpen(true);
    if (unseenContributionActivity.length > 0) {
      setUserAppState((current) => markContributionActivitySeen(current, unseenContributionActivity.map((item) => item.id)));
    }
  };

  const openTune = () => {
    setSearchOpen(false);
    setActivityOpen(false);
    setTuneOpen(true);
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
              selectedCity={userAppState.selectedCity}
              joinedFeeds={joinedFeeds}
              submittedContributionCount={reviewContributionCount}
              contributionActivityCount={unseenContributionActivity.length}
              issuePace={userAppState.issuePace}
              savedItemIds={userAppState.savedItemIds}
              usefulItemIds={userAppState.usefulItemIds}
              setSelectedFeed={(feed) => setUserAppState((current) => selectFeed(current, feed.id))}
              setActiveTab={setActiveTab}
              toggleSavedItem={toggleSavedItem}
              toggleUsefulItem={toggleUsefulItem}
              onOpenSearch={openSearch}
              onOpenActivity={openActivity}
              onOpenTune={openTune}
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
              submittedContributions={userAppState.submittedContributions}
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
          {activityOpen && (
            <View style={[styles.detailOverlay, { backgroundColor: theme.bg }]}>
              <AppBackground theme={theme} />
              <ActivityPanel
                theme={theme}
                activity={contributionActivity}
                seenActivityIds={userAppState.seenContributionActivityIds}
                onBack={() => setActivityOpen(false)}
                onOpenContribution={(contributionId) => {
                  const item = placedContributionItems.find((entry) => entry.id === contributionId);
                  if (item) openDetail(item);
                }}
                onOpenContribute={() => {
                  setActivityOpen(false);
                  setActiveTab("Contribute");
                }}
              />
            </View>
          )}
          {searchOpen && (
            <View style={[styles.detailOverlay, { backgroundColor: theme.bg }]}>
              <AppBackground theme={theme} />
              <SearchPanel
                theme={theme}
                selectedCity={userAppState.selectedCity}
                query={todaySearch}
                setQuery={setTodaySearch}
                results={todaySearchResults}
                onBack={() => setSearchOpen(false)}
                onOpenDetail={openDetail}
                onOpenLibrary={() => {
                  setSearchOpen(false);
                  setSearch(todaySearch);
                  setActiveTab("Library");
                }}
              />
            </View>
          )}
          {tuneOpen && (
            <View style={[styles.detailOverlay, { backgroundColor: theme.bg }]}>
              <AppBackground theme={theme} />
              <TunePanel
                theme={theme}
                selectedPace={userAppState.issuePace}
                onBack={() => setTuneOpen(false)}
                onSelectPace={(issuePace) => setUserAppState((current) => setUserIssuePace(current, issuePace))}
              />
            </View>
          )}
        </View>
        {!detailItem && !activityOpen && !searchOpen && !tuneOpen && <TabBar activeTab={userAppState.activeTab} setActiveTab={setActiveTab} theme={theme} bottomInset={insets.bottom} />}
      </SafeAreaView>
    </>
  );
}

function TunePanel({ theme, selectedPace, onBack, onSelectPace }: {
  theme: ReturnType<typeof useTheme>;
  selectedPace: IssuePace;
  onBack: () => void;
  onSelectPace: (pace: IssuePace) => void;
}) {
  const options: Array<{ pace: IssuePace; title: string; body: string; meta: string; includes: string[]; icon: keyof typeof Ionicons.glyphMap }> = [
    {
      pace: "Brief",
      title: "Brief",
      body: "A short issue for checking what changed and getting out quickly.",
      meta: "4 pieces / about 7 min",
      includes: ["Lead", "Changed", "Ending"],
      icon: "flash-outline"
    },
    {
      pace: "Balanced",
      title: "Balanced",
      body: "A normal issue with reading, saving, and one useful conversation.",
      meta: "6 pieces / about 12 min",
      includes: ["Lead", "Question", "Reads", "Save"],
      icon: "newspaper-outline"
    },
    {
      pace: "Deep",
      title: "Deep",
      body: "More context when you actually want to settle in and follow a thread.",
      meta: "9 pieces / about 20 min",
      includes: ["Lead", "Question", "Reads", "Context"],
      icon: "library-outline"
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.tuneContent}>
      <View style={styles.panelHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close issue tuning"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
        >
          <Ionicons name="chevron-back" color={theme.text} size={22} />
        </Pressable>
        <Text style={[styles.panelKicker, { color: theme.accent }]}>TUNE TODAY</Text>
      </View>

      <Text style={[styles.panelTitle, { color: theme.text }]}>Choose the pace of your issue.</Text>
      <Text style={[styles.panelBody, { color: theme.muted }]}>This changes how Weevrbird frames the day: quick check-in, balanced catch-up, or a slower read with more context.</Text>

      <View style={styles.activityStack}>
        {options.map((option) => {
          const selected = option.pace === selectedPace;
          return (
            <Pressable
              key={option.pace}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`Set Today pace to ${option.title}`}
              onPress={() => onSelectPace(option.pace)}
              style={({ pressed }) => [styles.tuneOption, pressed && styles.activityCardPressed, { backgroundColor: theme.panel, borderColor: selected ? theme.accent : theme.line }]}
            >
              <View style={[styles.activityIcon, { backgroundColor: selected ? `${theme.accent}18` : theme.panelAlt }]}>
                <Ionicons name={option.icon} color={theme.accent} size={19} />
              </View>
              <View style={styles.activityCopy}>
                <View style={styles.activityRowTop}>
                  <Text style={[styles.activityTitle, { color: theme.text }]}>{option.title}</Text>
                  <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} color={selected ? theme.accent : theme.muted} size={19} />
                </View>
                <Text style={[styles.activityBody, { color: theme.muted }]}>{option.body}</Text>
                <Text style={[styles.activityMeta, { color: theme.muted }]}>{option.meta}</Text>
                <View style={styles.tuneIncludes}>
                  {option.includes.map((item) => (
                    <View key={`${option.pace}-${item}`} style={[styles.tuneIncludePill, { borderColor: theme.line, backgroundColor: theme.panelAlt }]}>
                      <Text style={[styles.tuneIncludeText, { color: theme.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function SearchPanel({ theme, selectedCity, query, setQuery, results, onBack, onOpenDetail, onOpenLibrary }: {
  theme: ReturnType<typeof useTheme>;
  selectedCity: string;
  query: string;
  setQuery: (query: string) => void;
  results: FeedItem[];
  onBack: () => void;
  onOpenDetail: (item: FeedItem) => void;
  onOpenLibrary: () => void;
}) {
  const suggestions = getSearchSuggestions(selectedCity);
  const normalizedQuery = query.trim();

  return (
    <ScrollView contentContainerStyle={styles.searchContent}>
      <View style={styles.panelHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close search"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
        >
          <Ionicons name="chevron-back" color={theme.text} size={22} />
        </Pressable>
        <Text style={[styles.panelKicker, { color: theme.accent }]}>SEARCH TODAY</Text>
      </View>

      <Text style={[styles.panelTitle, { color: theme.text }]}>Search today's {selectedCity} issue.</Text>
      <View style={[styles.searchField, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <Ionicons name="search-outline" color={theme.muted} size={20} />
        <TextInput
          autoFocus
          accessibilityLabel={`Search today's ${selectedCity} issue`}
          accessibilityHint="Search issue items, feeds, saved context, sources, and contribution text."
          value={query}
          onChangeText={setQuery}
          placeholder="Search issue items, feeds, saved context"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {query.length > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery("")}>
            <Ionicons name="close-circle" color={theme.muted} size={19} />
          </Pressable>
        )}
      </View>

      {!normalizedQuery ? (
        <View style={styles.searchSuggestions}>
          <Text style={[styles.activityMeta, { color: theme.muted }]}>Try issue context</Text>
          <View style={styles.suggestionRow}>
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                accessibilityRole="button"
                accessibilityLabel={`Search ${suggestion}`}
                onPress={() => setQuery(suggestion)}
                style={({ pressed }) => [styles.suggestionPill, pressed && styles.activityCardPressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
              >
                <Text style={[styles.suggestionText, { color: theme.text }]}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.activityStack}>
          {results.length > 0 ? (
            results.map((item) => (
              <SearchResultRow key={item.id} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />
            ))
          ) : (
            <View style={[styles.activityEmpty, { backgroundColor: theme.panel, borderColor: theme.line }]}>
              <Ionicons name="search-outline" color={theme.accent} size={24} />
              <Text style={[styles.activityTitle, { color: theme.text }]}>Nothing found yet.</Text>
              <Text style={[styles.activityBody, { color: theme.muted }]}>Try a feed, saved piece, source, contribution, or place from your issue.</Text>
            </View>
          )}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Library search"
        onPress={onOpenLibrary}
        style={({ pressed }) => [styles.searchLibraryButton, pressed && styles.activityCardPressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
      >
        <Ionicons name="albums-outline" color={theme.accent} size={18} />
        <Text style={[styles.searchLibraryText, { color: theme.text }]}>Search the full Library with this query</Text>
        <Ionicons name="arrow-forward" color={theme.muted} size={16} />
      </Pressable>
    </ScrollView>
  );
}

function getSearchSuggestions(selectedCity: string) {
  return Array.from(new Map([selectedCity, "Black Tech", "weekend", "design"].map((suggestion) => [suggestion.toLowerCase(), suggestion])).values());
}

function SearchResultRow({ item, theme, onOpen }: {
  item: FeedItem;
  theme: ReturnType<typeof useTheme>;
  onOpen: () => void;
}) {
  const label = item.authorId === "you" ? "From You" : item.sourceName ?? localDataService.getFeed(item.feedId).name;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.searchResult, pressed && styles.activityCardPressed, { backgroundColor: theme.panel, borderColor: theme.line }]}
    >
      <View style={[styles.activityIcon, { backgroundColor: theme.panelAlt }]}>
        <Ionicons name={item.imported ? "book-outline" : "chatbubble-ellipses-outline"} color={theme.accent} size={19} />
      </View>
      <View style={styles.activityCopy}>
        <Text style={[styles.activityFeed, { color: theme.accent }]}>{label}</Text>
        <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.activityBody, { color: theme.muted }]} numberOfLines={2}>{item.excerpt ?? item.body}</Text>
      </View>
      <Ionicons name="chevron-forward" color={theme.muted} size={18} />
    </Pressable>
  );
}

function ActivityPanel({ theme, activity, seenActivityIds, onBack, onOpenContribution, onOpenContribute }: {
  theme: ReturnType<typeof useTheme>;
  activity: ContributionActivity[];
  seenActivityIds: string[];
  onBack: () => void;
  onOpenContribution: (contributionId: string) => void;
  onOpenContribute: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.activityContent}>
      <View style={styles.panelHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close contribution activity"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
        >
          <Ionicons name="chevron-back" color={theme.text} size={22} />
        </Pressable>
        <Text style={[styles.panelKicker, { color: theme.accent }]}>CONTRIBUTION ACTIVITY</Text>
      </View>

      <Text style={[styles.panelTitle, { color: theme.text }]}>Where your signal is landing.</Text>
      <Text style={[styles.panelBody, { color: theme.muted }]}>Responses stay small on purpose: saved, useful, and thoughtful replies that help you understand whether a contribution is worth returning to.</Text>

      {activity.length > 0 ? (
        <View style={styles.activityStack}>
          {activity.map((item) => (
            <ActivityRow
              key={item.id}
              item={item}
              seen={seenActivityIds.includes(item.id)}
              theme={theme}
              onOpen={() => onOpenContribution(item.contributionId)}
            />
          ))}
        </View>
      ) : (
        <View style={[styles.activityEmpty, { backgroundColor: theme.panel, borderColor: theme.line }]}>
          <Ionicons name="notifications-outline" color={theme.accent} size={24} />
          <Text style={[styles.activityTitle, { color: theme.text }]}>No contribution activity yet.</Text>
          <Text style={[styles.activityBody, { color: theme.muted }]}>Place a private signal into a Smartfeed and Weevrbird will show the useful response here.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open contribution composer"
            onPress={onOpenContribute}
            style={({ pressed }) => [styles.activityButton, pressed && styles.activityCardPressed, { backgroundColor: theme.accent }]}
          >
            <Text style={styles.activityButtonText}>Write a contribution</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function ActivityRow({ item, seen, theme, onOpen }: {
  item: ContributionActivity;
  seen: boolean;
  theme: ReturnType<typeof useTheme>;
  onOpen: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open activity for ${item.feedName}`}
      accessibilityHint={seen ? "Already seen" : "New activity"}
      onPress={onOpen}
      style={({ pressed }) => [styles.activityCard, pressed && styles.activityCardPressed, { backgroundColor: theme.panel, borderColor: seen ? theme.line : theme.accent }]}
    >
      <View style={[styles.activityIcon, { backgroundColor: seen ? theme.panelAlt : `${theme.accent}18` }]}>
        <Ionicons name={item.icon} color={theme.accent} size={19} />
      </View>
      <View style={styles.activityCopy}>
        <View style={styles.activityRowTop}>
          <Text style={[styles.activityFeed, { color: theme.accent }]}>{item.feedName}</Text>
          <Text style={[styles.activityState, { color: seen ? theme.muted : theme.accent }]}>{seen ? "Seen" : "New"}</Text>
        </View>
        <Text style={[styles.activityTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.activityBody, { color: theme.muted }]}>{item.body}</Text>
        <Text style={[styles.activityMeta, { color: theme.muted }]}>{item.meta}</Text>
      </View>
      <Ionicons name="chevron-forward" color={theme.muted} size={18} />
    </Pressable>
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
    issuePace: "Balanced",
    draftType: "Recommendation",
    draft: "",
    savedItemIds: ["item-1", "item-3", "local-qa-placed"],
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
    "Archive: saved signal you can return to",
    "Contribution: private first, placed with intent"
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
  activityContent: {
    padding: 20,
    paddingBottom: 110,
    gap: 16
  },
  searchContent: {
    padding: 20,
    paddingBottom: 110,
    gap: 16
  },
  tuneContent: {
    padding: 20,
    paddingBottom: 110,
    gap: 16
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card
  },
  backButtonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.96 }]
  },
  panelKicker: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  panelTitle: {
    fontSize: 34,
    lineHeight: 39,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  panelBody: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter_400Regular"
  },
  searchField: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.card
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_500Medium"
  },
  searchSuggestions: {
    gap: spacing.sm,
    paddingTop: spacing.xs
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  suggestionPill: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  suggestionText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  searchResult: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    ...shadows.card
  },
  searchLibraryButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  searchLibraryText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  tuneOption: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    ...shadows.card
  },
  tuneIncludes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingTop: spacing.xs
  },
  tuneIncludePill: {
    minHeight: 28,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    justifyContent: "center"
  },
  tuneIncludeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold"
  },
  activityStack: {
    gap: spacing.md,
    paddingTop: spacing.xs
  },
  activityCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    ...shadows.card
  },
  activityCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  activityCopy: {
    flex: 1,
    gap: 5
  },
  activityRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  activityFeed: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  activityState: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  activityTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Inter_700Bold"
  },
  activityBody: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Inter_400Regular"
  },
  activityMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_600SemiBold"
  },
  activityEmpty: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  activityButton: {
    minHeight: 42,
    borderRadius: radii.round,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    marginTop: spacing.xs
  },
  activityButtonText: {
    color: palette.cream,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
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
