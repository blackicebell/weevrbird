import { Ionicons } from "@expo/vector-icons";
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
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { adminMetrics, feedItems, interests, launchFeeds, people } from "./src/data/mockData";
import { palette, radii, shadows, spacing } from "./src/theme/tokens";
import { FeedItem, Smartfeed, SmartfeedFilter } from "./src/types/product";

const logo = require("./Weevrbird Logos/PNG-01.png");

type AppTab = "Today" | "Feeds" | "Contribute" | "Library" | "You";
type OnboardingStep = "welcome" | "city" | "interests" | "avatar" | "ready";

const tabs: Array<{ key: AppTab; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: "Today", icon: "newspaper-outline" },
  { key: "Feeds", icon: "albums-outline" },
  { key: "Contribute", icon: "create-outline" },
  { key: "Library", icon: "bookmark-outline" },
  { key: "You", icon: "person-circle-outline" }
];

const filters: SmartfeedFilter[] = ["Latest", "Conversations", "Reading", "Saved"];
const contributionTypes = ["Note", "Question", "Discussion", "Recommendation", "Link", "Long Read"];
const contributionMeta: Record<string, { icon: keyof typeof Ionicons.glyphMap; helper: string }> = {
  Note: { icon: "create-outline", helper: "Share a quick thought" },
  Question: { icon: "bulb-outline", helper: "Ask the community" },
  Discussion: { icon: "chatbubbles-outline", helper: "Start a conversation" },
  Recommendation: { icon: "ribbon-outline", helper: "Share something you love" },
  Link: { icon: "link-outline", helper: "Share an article, video, or resource" },
  "Long Read": { icon: "newspaper-outline", helper: "Write a deeper piece" }
};
const avatars = ["W", "A", "C", "M", "S", "L", "T", "N"];
const feedIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  atlanta: "business-outline",
  "black-tech": "code-slash-outline",
  "creative-community": "pencil-outline",
  "food-culture": "restaurant-outline",
  "faith-community": "leaf-outline",
  travel: "airplane-outline"
};

function useTheme() {
  const dark = false;
  return {
    dark,
    bg: dark ? palette.dark : palette.paper,
    panel: dark ? palette.darkPanel : palette.glassLight,
    panelAlt: dark ? "rgba(24, 42, 37, 0.78)" : "rgba(214, 241, 229, 0.38)",
    text: dark ? palette.darkText : palette.ink,
    muted: dark ? palette.darkMuted : palette.muted,
    line: dark ? palette.darkLine : palette.glassLine,
    accent: dark ? palette.seafoam : palette.deepForest,
    success: dark ? "#9DB98F" : palette.sage,
    forest: dark ? palette.seafoam : palette.deepForest,
    serif: "PlayfairDisplay_700Bold",
    serifSoft: "PlayfairDisplay_600SemiBold",
    sans: "Inter_400Regular",
    sansMedium: "Inter_500Medium",
    sansSemi: "Inter_600SemiBold",
    sansBold: "Inter_700Bold"
  };
}

export default function App() {
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold
  });
  const [onboarded, setOnboarded] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("welcome");
  const [selectedCity, setSelectedCity] = useState("Atlanta");
  const [selectedInterests, setSelectedInterests] = useState(["Atlanta", "Black Tech", "UX Design"]);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [activeTab, setActiveTab] = useState<AppTab>("Today");
  const [selectedFeed, setSelectedFeed] = useState(launchFeeds[0]);
  const [activeFilter, setActiveFilter] = useState<SmartfeedFilter>("Latest");
  const [draftType, setDraftType] = useState("Note");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const joinedFeeds = useMemo(() => launchFeeds.filter((feed) => feed.joined), []);
  const savedItems = useMemo(() => feedItems.filter((item) => item.saved), []);
  const visibleFeedItems = useMemo(() => {
    const current = feedItems.filter((item) => item.feedId === selectedFeed.id);
    if (activeFilter === "Conversations") return current.filter((item) => !item.imported);
    if (activeFilter === "Reading") return current.filter((item) => item.imported);
    if (activeFilter === "Saved") return current.filter((item) => item.saved);
    return current;
  }, [activeFilter, selectedFeed.id]);

  if (!fontsLoaded) {
    return null;
  }

  if (!onboarded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
          <AppBackground theme={theme} />
          <Onboarding
            step={onboardingStep}
            setStep={setOnboardingStep}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
            finish={() => setOnboarded(true)}
            theme={theme}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
        <AppBackground theme={theme} />
        <View style={styles.appShell}>
          {activeTab === "Today" && (
            <TodayScreen theme={theme} joinedFeeds={joinedFeeds} setSelectedFeed={setSelectedFeed} setActiveTab={setActiveTab} />
          )}
          {activeTab === "Feeds" && (
            <FeedsScreen
              theme={theme}
              selectedFeed={selectedFeed}
              setSelectedFeed={setSelectedFeed}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              visibleFeedItems={visibleFeedItems}
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
          {activeTab === "Library" && <LibraryScreen theme={theme} savedItems={savedItems} search={search} setSearch={setSearch} />}
          {activeTab === "You" && <ProfileScreen theme={theme} selectedAvatar={selectedAvatar} selectedInterests={selectedInterests} />}
        </View>
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function AppBackground({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <View pointerEvents="none" style={styles.backgroundLayer}>
      <LinearGradient
        colors={theme.dark ? ["#0E1715", "#11231D", "#0E1715"] : ["#F8FFFB", "#EFF7F4", "#E4F4ED"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.paperVeil, styles.paperVeilOne, { backgroundColor: theme.dark ? "rgba(214, 241, 229, 0.08)" : "rgba(214, 241, 229, 0.72)" }]} />
      <View style={[styles.paperVeil, styles.paperVeilTwo, { backgroundColor: theme.dark ? "rgba(45, 99, 181, 0.08)" : "rgba(227, 241, 255, 0.64)" }]} />
      <View style={[styles.softLeaf, styles.softLeafOne, { backgroundColor: theme.dark ? "rgba(214, 241, 229, 0.10)" : "rgba(86, 171, 130, 0.16)" }]} />
      <View style={[styles.softLeaf, styles.softLeafTwo, { backgroundColor: theme.dark ? "rgba(214, 241, 229, 0.08)" : "rgba(86, 171, 130, 0.12)" }]} />
    </View>
  );
}

function Onboarding(props: {
  step: OnboardingStep;
  setStep: (step: OnboardingStep) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedInterests: string[];
  setSelectedInterests: (next: string[]) => void;
  selectedAvatar: number;
  setSelectedAvatar: (next: number) => void;
  finish: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  const { step, setStep, selectedCity, setSelectedCity, selectedInterests, setSelectedInterests, selectedAvatar, setSelectedAvatar, finish, theme } = props;
  const cityOptions = ["Atlanta", "Decatur", "Brooklyn", "Houston", "Chicago", "Washington DC"];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length <= 3) return;
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <View style={styles.onboarding}>
      <View style={styles.brandRow}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.wordmark, { color: theme.text }]}>Weevrbird</Text>
      </View>

      {step === "welcome" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Built for curiosity, not clout.</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>A calmer social platform built around your interests, city, and communities.</Text>
          <Text style={[styles.body, { color: theme.muted }]}>
            Start with a few focused Smartfeeds. Read what matters, save useful finds, and join conversations without follower counts or performance pressure.
          </Text>
          <PrimaryButton label="Begin" icon="arrow-forward" onPress={() => setStep("city")} theme={theme} />
        </View>
      )}

      {step === "city" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Choose your city</Text>
          <Text style={[styles.body, { color: theme.muted }]}>No precise location needed. Your city helps shape the first issue of your Weevrbird.</Text>
          <View style={styles.chipWrap}>
            {cityOptions.map((city) => (
              <Chip key={city} label={city} selected={selectedCity === city} onPress={() => setSelectedCity(city)} theme={theme} />
            ))}
          </View>
          <PrimaryButton label="Continue" icon="arrow-forward" onPress={() => setStep("interests")} theme={theme} />
        </View>
      )}

      {step === "interests" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Pick at least three interests</Text>
          <Text style={[styles.body, { color: theme.muted }]}>These become your first Smartfeeds. You can change them later.</Text>
          <View style={styles.cardGrid}>
            {interests.slice(0, 10).map((interest) => (
              <Pressable
                accessibilityRole="button"
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.interestCard,
                  { backgroundColor: theme.panel, borderColor: selectedInterests.includes(interest) ? theme.accent : theme.line }
                ]}
              >
                <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
                {selectedInterests.includes(interest) && <Ionicons name="checkmark-circle" color={theme.accent} size={20} />}
              </Pressable>
            ))}
          </View>
          <PrimaryButton label="Continue" icon="arrow-forward" onPress={() => setStep("avatar")} theme={theme} />
        </View>
      )}

      {step === "avatar" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Choose a curated avatar</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Weevrbird keeps the MVP lightweight by using built-in avatars instead of profile uploads.</Text>
          <View style={styles.avatarGrid}>
            {avatars.map((letter, index) => (
              <AvatarButton key={letter} label={letter} index={index} selected={selectedAvatar === index} onPress={() => setSelectedAvatar(index)} theme={theme} />
            ))}
          </View>
          <PrimaryButton label="Build my first issue" icon="sparkles-outline" onPress={() => setStep("ready")} theme={theme} />
        </View>
      )}

      {step === "ready" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Your Weevrbird is ready.</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Your first issue is built around {selectedCity}, curiosity, and calm conversation.</Text>
          <View style={[styles.issuePreview, { backgroundColor: theme.panel, borderColor: theme.line }]}>
            {selectedInterests.slice(0, 3).map((interest) => (
              <View key={interest} style={styles.issueRow}>
                <Ionicons name="albums-outline" color={theme.accent} size={18} />
                <Text style={[styles.issueText, { color: theme.text }]}>{interest}</Text>
              </View>
            ))}
          </View>
          <PrimaryButton label="Open Today" icon="newspaper-outline" onPress={finish} theme={theme} />
        </View>
      )}
    </View>
  );
}

function TodayScreen({ theme, joinedFeeds, setSelectedFeed, setActiveTab }: {
  theme: ReturnType<typeof useTheme>;
  joinedFeeds: Smartfeed[];
  setSelectedFeed: (feed: Smartfeed) => void;
  setActiveTab: (tab: AppTab) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <LinearGradient colors={theme.dark ? ["rgba(18, 32, 28, 0.96)", "rgba(18, 32, 28, 0.76)"] : ["rgba(255, 255, 252, 0.88)", "rgba(214, 241, 229, 0.46)"]} style={[styles.cover, { borderColor: theme.line }]}>
        <View style={styles.coverTop}>
          <Text style={[styles.dateText, { color: theme.accent }]}>Friday, July 10</Text>
          <View style={styles.coverActions}>
            <HeaderIcon name="search-outline" theme={theme} />
            <HeaderIcon name="notifications-outline" theme={theme} dot />
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: theme.text }]}>Good morning,{"\n"}Chris.</Text>
        <Text style={[styles.coverSubtitle, { color: theme.muted }]}>Here is what is happening in your world today.</Text>
      </LinearGradient>

      <SectionHeader title="Your Smartfeeds" action="Manage" theme={theme} />
      {joinedFeeds.slice(0, 3).map((feed) => {
        const primary = feedItems.find((item) => item.feedId === feed.id) ?? feedItems[0];
        return (
          <SmartfeedFeatureCard
            key={feed.id}
            feed={feed}
            item={primary}
            theme={theme}
            onPress={() => {
              setSelectedFeed(feed);
              setActiveTab("Feeds");
            }}
          />
        );
      })}

    </ScrollView>
  );
}

function FeedsScreen(props: {
  theme: ReturnType<typeof useTheme>;
  selectedFeed: Smartfeed;
  setSelectedFeed: (feed: Smartfeed) => void;
  activeFilter: SmartfeedFilter;
  setActiveFilter: (filter: SmartfeedFilter) => void;
  visibleFeedItems: FeedItem[];
}) {
  const { theme, selectedFeed, setSelectedFeed, activeFilter, setActiveFilter, visibleFeedItems } = props;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Smartfeeds</Text>
      <Text style={[styles.body, { color: theme.muted }]}>Focused streams around your city, interests, and communities. Feeds are chronological and transparent.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.feedRail}>
        {launchFeeds.map((feed) => (
          <Pressable
            key={feed.id}
            accessibilityRole="button"
            onPress={() => setSelectedFeed(feed)}
            style={[
              styles.feedPill,
              { backgroundColor: selectedFeed.id === feed.id ? feed.palette : theme.panel, borderColor: selectedFeed.id === feed.id ? feed.palette : theme.line }
            ]}
          >
            <Text style={[styles.feedPillText, { color: selectedFeed.id === feed.id ? "#FFFDF8" : theme.text }]}>{feed.name}</Text>
            <Text style={[styles.feedPillMeta, { color: selectedFeed.id === feed.id ? "#F5EEE4" : theme.muted }]}>{feed.joined ? "Joined" : "Join"}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.feedHero, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <Text style={[styles.kicker, { color: selectedFeed.palette }]}>{selectedFeed.type.toUpperCase()} SMARTFEED</Text>
        <Text style={[styles.feedHeroTitle, { color: theme.text }]}>{selectedFeed.name}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{selectedFeed.description}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{selectedFeed.members}</Text>
      </View>

      <View style={styles.segmented}>
        {filters.map((filter) => <Chip key={filter} label={filter} selected={activeFilter === filter} onPress={() => setActiveFilter(filter)} theme={theme} />)}
      </View>

      {visibleFeedItems.length > 0 ? (
        visibleFeedItems.map((item) => <FeedCard key={item.id} item={item} theme={theme} />)
      ) : (
        <EmptyState
          icon="leaf-outline"
          title="This section is quiet right now."
          body="Explore today's reading or start the first discussion in this Smartfeed."
          theme={theme}
        />
      )}
    </ScrollView>
  );
}

function ContributeScreen({ theme, draftType, setDraftType, draft, setDraft }: {
  theme: ReturnType<typeof useTheme>;
  draftType: string;
  setDraftType: (type: string) => void;
  draft: string;
  setDraft: (text: string) => void;
}) {
  const charLimit = draftType === "Long Read" ? 5000 : draftType === "Note" ? 280 : 900;

  const submit = () => {
    if (!draft.trim()) {
      Alert.alert("Add a little context", "Your contribution needs text before it can be shared.");
      return;
    }
    Alert.alert("Contribution saved", "In the production app this will create a moderated contribution with optimistic UI and draft recovery.");
    setDraft("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Contribute</Text>
        <Text style={[styles.body, { color: theme.muted }]}>What do you want to share?</Text>
        <View style={styles.contributionList}>
          {contributionTypes.map((type) => (
            <ContributionTypeRow
              key={type}
              type={type}
              selected={draftType === type}
              onPress={() => setDraftType(type)}
              theme={theme}
            />
          ))}
        </View>
        <View style={[styles.editor, { backgroundColor: theme.panel, borderColor: theme.line }]}>
          <Text style={[styles.editorLabel, { color: theme.accent }]}>{draftType}</Text>
          <TextInput
            accessibilityLabel={`${draftType} contribution editor`}
            multiline
            value={draft}
            onChangeText={(text) => text.length <= charLimit && setDraft(text)}
            placeholder={draftType === "Question" ? "What do you want to ask this community?" : "Write something useful, specific, or worth discussing..."}
            placeholderTextColor={theme.muted}
            style={[styles.textInput, { color: theme.text }]}
          />
          <View style={styles.editorFooter}>
            <Text style={[styles.meta, { color: theme.muted }]}>{draft.length}/{charLimit}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>Draft preserved locally</Text>
          </View>
        </View>
        <View style={[styles.safetyPanel, { backgroundColor: theme.panelAlt, borderColor: theme.line }]}>
          <Ionicons name="shield-checkmark-outline" color={theme.success} size={22} />
          <Text style={[styles.body, { color: theme.muted }]}>Links are checked, user text is sanitized, and reports can be reviewed before harmful content spreads.</Text>
        </View>
        <PrimaryButton label="Contribute" icon="send-outline" onPress={submit} theme={theme} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LibraryScreen({ theme, savedItems, search, setSearch }: {
  theme: ReturnType<typeof useTheme>;
  savedItems: FeedItem[];
  search: string;
  setSearch: (value: string) => void;
}) {
  const results = feedItems.filter((item) => {
    const haystack = `${item.title ?? ""} ${item.body ?? ""} ${item.excerpt ?? ""} ${item.sourceName ?? ""}`.toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Library</Text>
      <Text style={[styles.body, { color: theme.muted }]}>Saved items, reading history, and conversations you may want to return to.</Text>
      <View style={[styles.searchBox, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <Ionicons name="search-outline" color={theme.muted} size={20} />
        <TextInput
          accessibilityLabel="Search Weevrbird"
          value={search}
          onChangeText={setSearch}
          placeholder="Search feeds, people, contributions, links"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>
      {search ? (
        <>
          <SectionHeader title="Grouped search results" theme={theme} />
          {results.map((item) => <FeedCard key={item.id} item={item} theme={theme} />)}
        </>
      ) : (
        <>
          <View style={styles.libraryTabs}>
            {["Saved", "History", "Collections"].map((tab, index) => (
              <View key={tab} style={[styles.libraryTab, index === 0 && { borderBottomColor: theme.accent }]}>
                <Text style={[styles.libraryTabText, { color: index === 0 ? theme.accent : theme.muted }]}>{tab}</Text>
              </View>
            ))}
          </View>
          {savedItems.concat(feedItems.slice(3, 5)).slice(0, 4).map((item) => <LibraryItem key={`library-${item.id}`} item={item} theme={theme} />)}
        </>
      )}
    </ScrollView>
  );
}

function ProfileScreen({ theme, selectedAvatar, selectedInterests }: {
  theme: ReturnType<typeof useTheme>;
  selectedAvatar: number;
  selectedInterests: string[];
}) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.profileHero, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <AvatarButton label={avatars[selectedAvatar]} index={selectedAvatar} selected onPress={() => undefined} theme={theme} />
        <Text style={[styles.feedHeroTitle, { color: theme.text }]}>Chris Morgan</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>@chrism - Atlanta</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Reads about UX Design, Atlanta, Black Tech, and better ways to make the internet feel human.</Text>
        <View style={styles.chipWrap}>
          {selectedInterests.slice(0, 5).map((interest) => <Chip key={interest} label={interest} selected={false} onPress={() => undefined} theme={theme} />)}
        </View>
      </View>

      <SectionHeader title="Links" action="Requests" theme={theme} />
      {people.map((person) => (
        <View key={person.id} style={[styles.personRow, { backgroundColor: theme.panel, borderColor: theme.line }]}>
          <AvatarButton label={person.displayName[0]} index={person.avatar} selected={person.linked} onPress={() => undefined} theme={theme} />
          <View style={styles.personCopy}>
            <Text style={[styles.personName, { color: theme.text }]}>{person.displayName}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{person.linked ? "Linked" : "3 shared interests"}</Text>
          </View>
          <Pressable accessibilityRole="button" style={[styles.smallButton, { borderColor: theme.line }]} onPress={() => undefined}>
            <Text style={[styles.smallButtonText, { color: theme.text }]}>{person.linked ? "Linked" : "Connect"}</Text>
          </Pressable>
        </View>
      ))}

      <SectionHeader title="Settings and safety" theme={theme} />
      <SettingsRow icon="albums-outline" title="Manage joined feeds" theme={theme} />
      <SettingsRow icon="options-outline" title="Manage interests" theme={theme} />
      <SettingsRow icon="notifications-outline" title="Calm notifications" theme={theme} />
      <SettingsRow icon="ban-outline" title="Blocked and muted accounts" theme={theme} />
      <SettingsRow icon="trash-outline" title="Clear reading history" theme={theme} destructive />
      <SettingsRow icon="exit-outline" title="Deactivate account" theme={theme} destructive />

      <SectionHeader title="Admin preview" theme={theme} />
      <View style={styles.metricGrid}>
        {adminMetrics.map((metric) => (
          <View key={metric.label} style={[styles.metricCard, { backgroundColor: theme.panel, borderColor: theme.line }]}>
            <Text style={[styles.metricValue, { color: metric.tone === "attention" ? palette.red : theme.text }]}>{metric.value}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{metric.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function FeedCard({ item, theme }: { item: FeedItem; theme: ReturnType<typeof useTheme> }) {
  const isExternal = item.imported;
  return (
    <View style={[styles.card, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      {isExternal && <EditorialImage item={item} theme={theme} />}
      <View style={styles.cardMetaRow}>
        <View style={[styles.typeBadge, { backgroundColor: isExternal ? theme.panelAlt : `${theme.accent}22`, borderColor: theme.line }]}>
          <Ionicons name={isExternal ? "open-outline" : "chatbubble-ellipses-outline"} color={isExternal ? theme.muted : theme.accent} size={14} />
          <Text style={[styles.typeText, { color: isExternal ? theme.muted : theme.accent }]}>
            {isExternal ? `From ${item.sourceName}` : item.itemType.replace("_", " ")}
          </Text>
        </View>
        <Text style={[styles.meta, { color: theme.muted }]}>{item.publishedAt}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
      {!!(item.body ?? item.excerpt) && <Text style={[styles.body, { color: theme.muted }]}>{item.body ?? item.excerpt}</Text>}
      {isExternal && <Text style={[styles.externalNotice, { color: theme.muted }]}>External reading - Open source - Discuss on Weevrbird</Text>}
      <View style={styles.actionRow}>
        <IconLabel icon="sparkles-outline" label={item.reactionLabel} theme={theme} />
        <IconLabel icon="chatbubble-outline" label={`${item.replies} replies`} theme={theme} />
        <IconLabel icon={item.saved ? "bookmark" : "bookmark-outline"} label={item.saved ? "Saved" : "Save"} theme={theme} />
      </View>
    </View>
  );
}

function LibraryItem({ item, theme }: { item: FeedItem; theme: ReturnType<typeof useTheme> }) {
  const icon = item.imported ? "play-circle" : "bookmark";
  return (
    <View style={[styles.libraryItem, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <View style={styles.libraryCopy}>
        <Text style={[styles.libraryMeta, { color: theme.accent }]}>{item.imported ? "Reading" : item.itemType.replace("_", " ")}</Text>
        <Text style={[styles.libraryTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{item.sourceName ?? "Weevrbird"} - {item.publishedAt}</Text>
      </View>
      <LinearGradient colors={theme.dark ? ["#1B352C", "#10211B"] : ["#D6F1E5", "#F7F5EF"]} style={styles.libraryThumb}>
        <Ionicons name={icon} color={theme.accent} size={24} />
      </LinearGradient>
      <Ionicons name={item.saved ? "bookmark" : "bookmark-outline"} color={theme.accent} size={20} />
    </View>
  );
}

function HeaderIcon({ name, theme, dot }: {
  name: keyof typeof Ionicons.glyphMap;
  theme: ReturnType<typeof useTheme>;
  dot?: boolean;
}) {
  return (
    <View style={[styles.headerIcon, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <Ionicons name={name} color={theme.text} size={21} />
      {dot && <View style={[styles.notificationDot, { backgroundColor: palette.clay }]} />}
    </View>
  );
}

function SmartfeedFeatureCard({ feed, item, theme, onPress }: {
  feed: Smartfeed;
  item: FeedItem;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}) {
  const showImage = feed.id === "atlanta";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.feedSection, { backgroundColor: theme.panel, borderColor: theme.line }]}
    >
      <View style={styles.feedSectionTop}>
        <View style={styles.feedHeaderCluster}>
          <View style={[styles.feedIconBadge, { backgroundColor: feed.palette }]}>
            <Ionicons name={feedIcons[feed.id] ?? "albums-outline"} color="#FFFDF8" size={22} />
          </View>
          <View>
            <Text style={[styles.feedName, { color: theme.text }]}>{feed.name}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{feed.newItems} new items</Text>
          </View>
        </View>
        <View style={[styles.feedDot, { backgroundColor: feed.palette }]} />
      </View>
      {showImage && <EditorialScene theme={theme} />}
      {item.imported && item.sourceName && (
        <Text style={[styles.sourceLine, { color: theme.accent }]}>From {item.sourceName}</Text>
      )}
      <Text style={[styles.feedHeadline, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.body, { color: theme.muted }]} numberOfLines={showImage ? 3 : 3}>{item.body ?? item.excerpt}</Text>
      <View style={styles.feedFooter}>
        <ParticipantStack theme={theme} count={feed.id === "atlanta" ? 8 : feed.id === "black-tech" ? 5 : 3} />
        <View style={styles.openActionRow}>
          <Text style={[styles.openAction, { color: theme.accent }]}>Open feed</Text>
          <Ionicons name="arrow-forward" color={theme.accent} size={15} />
        </View>
      </View>
    </Pressable>
  );
}

function EditorialScene({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <LinearGradient
      colors={theme.dark ? ["#1B352C", "#10211B"] : ["#F8FFFB", "#D6F1E5"]}
      style={styles.editorialScene}
    >
      <View style={[styles.sceneGlow, { backgroundColor: "rgba(255, 255, 252, 0.62)" }]} />
      <View style={[styles.sceneLeaf, styles.sceneLeafOne, { backgroundColor: "rgba(86, 171, 130, 0.28)" }]} />
      <View style={[styles.sceneLeaf, styles.sceneLeafTwo, { backgroundColor: "rgba(15, 61, 46, 0.18)" }]} />
      <View style={[styles.sceneLeaf, styles.sceneLeafThree, { backgroundColor: "rgba(219, 168, 91, 0.28)" }]} />
    </LinearGradient>
  );
}

function ParticipantStack({ theme, count }: { theme: ReturnType<typeof useTheme>; count: number }) {
  return (
    <View style={styles.participantRow}>
      {people.slice(0, 3).map((person, index) => (
        <View
          key={person.id}
          style={[
            styles.miniAvatar,
            {
              backgroundColor: [palette.sage, palette.clay, palette.indigo][index],
              borderColor: theme.panel
            }
          ]}
        >
          <Text style={styles.miniAvatarText}>{person.displayName[0]}</Text>
        </View>
      ))}
      <Text style={[styles.participantCount, { color: theme.muted }]}>+{count}</Text>
    </View>
  );
}

function EditorialImage({ item, theme }: { item: FeedItem; theme: ReturnType<typeof useTheme> }) {
  return (
    <LinearGradient
      colors={theme.dark ? ["#1B352C", "#101A16"] : ["#E9F7F1", "#F8FFFB"]}
      style={styles.editorialImage}
    >
      <View style={[styles.editorialImageMark, { borderColor: theme.dark ? "rgba(245, 238, 228, 0.18)" : "rgba(15, 27, 23, 0.16)" }]}>
        <Ionicons name={item.itemType === "external_podcast" ? "mic-outline" : "leaf-outline"} color={theme.dark ? palette.sunlight : palette.sage} size={36} />
      </View>
    </LinearGradient>
  );
}

function ContributionTypeRow({ type, selected, onPress, theme }: {
  type: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  const meta = contributionMeta[type];
  const rowColors = {
    Note: palette.seafoam,
    Question: palette.sky,
    Discussion: "#FFE1D3",
    Recommendation: "#F5DFAE",
    Link: "#E7DAFF",
    "Long Read": palette.mint
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.contributionRow,
        { backgroundColor: selected ? theme.panelAlt : theme.panel, borderColor: selected ? theme.accent : theme.line }
      ]}
    >
      <View style={[styles.contributionIcon, { backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.08)" : rowColors[type as keyof typeof rowColors], borderColor: theme.line }]}>
        <Ionicons name={meta.icon} color={selected ? theme.accent : theme.text} size={18} />
      </View>
      <View style={styles.contributionCopy}>
        <Text style={[styles.contributionTitle, { color: theme.text }]}>{type}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{meta.helper}</Text>
      </View>
      <Ionicons name={selected ? "checkmark-circle" : "chevron-forward"} color={selected ? theme.accent : theme.muted} size={20} />
    </Pressable>
  );
}

function TabBar({ activeTab, setActiveTab, theme }: {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.tabBar, { backgroundColor: theme.panel, borderTopColor: theme.line }]}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const primary = tab.key === "Contribute";
        return (
          <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setActiveTab(tab.key)} style={styles.tabButton}>
            {primary ? (
              <LinearGradient colors={[palette.deepForest, "#1C9A75"]} style={styles.primaryTabIcon}>
                <Ionicons name="add" color="#FFFFFF" size={30} />
              </LinearGradient>
            ) : (
              <Ionicons name={tab.icon} color={active ? theme.forest : theme.muted} size={23} />
            )}
            <Text style={[styles.tabLabel, { color: active ? theme.accent : theme.muted }]}>{tab.key}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PrimaryButton({ label, icon, onPress, theme }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.primaryButton, { backgroundColor: theme.text }]}>
      <Text style={[styles.primaryButtonText, { color: theme.bg }]}>{label}</Text>
      <Ionicons name={icon} color={theme.bg} size={18} />
    </Pressable>
  );
}

function Chip({ label, selected, onPress, theme }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? theme.text : theme.panel, borderColor: selected ? theme.text : theme.line }]}
    >
      <Text style={[styles.chipText, { color: selected ? theme.bg : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function AvatarButton({ label, index, selected, onPress, theme }: {
  label: string;
  index: number;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  const colors = [palette.sage, palette.indigo, palette.clay, palette.plum, palette.gold, "#3E6D75", "#866653", "#4E6251"];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Avatar ${label}`}
      onPress={onPress}
      style={[styles.avatar, { backgroundColor: colors[index % colors.length], borderColor: selected ? theme.text : "transparent" }]}
    >
      <Text style={styles.avatarText}>{label}</Text>
    </Pressable>
  );
}

function SectionHeader({ title, action, theme }: { title: string; action?: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {action && <Text style={[styles.openAction, { color: theme.accent }]}>{action}</Text>}
    </View>
  );
}

function EmptyState({ icon, title, body, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.emptyState, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <Ionicons name={icon} color={theme.accent} size={32} />
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.muted, textAlign: "center" }]}>{body}</Text>
    </View>
  );
}

function IconLabel({ icon, label, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.iconLabel}>
      <Ionicons name={icon} color={theme.muted} size={16} />
      <Text style={[styles.meta, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

function SettingsRow({ icon, title, theme, destructive }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  theme: ReturnType<typeof useTheme>;
  destructive?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" style={[styles.settingsRow, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <Ionicons name={icon} color={destructive ? palette.red : theme.accent} size={20} />
      <Text style={[styles.settingsText, { color: destructive ? palette.red : theme.text }]}>{title}</Text>
      <Ionicons name="chevron-forward" color={theme.muted} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: "hidden"
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject
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
  paperVeilTwo: {
    bottom: -110,
    left: -164,
    transform: [{ rotate: "32deg" }]
  },
  softLeaf: {
    position: "absolute",
    width: 150,
    height: 70,
    borderRadius: 80,
    opacity: 0.42,
    transform: [{ rotate: "-38deg" }]
  },
  softLeafOne: {
    right: -28,
    top: 138
  },
  softLeafTwo: {
    left: 28,
    bottom: 88,
    transform: [{ rotate: "-48deg" }]
  },
  flex: {
    flex: 1
  },
  appShell: {
    flex: 1,
    zIndex: 1
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 126,
    gap: 18
  },
  onboarding: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
    zIndex: 1
  },
  onboardingPanel: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radii.sm
  },
  coverLogo: {
    width: 34,
    height: 34
  },
  wordmark: {
    fontSize: 30,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0
  },
  kicker: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0
  },
  screenTitle: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0
  },
  coverSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: "Inter_400Regular"
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter_400Regular"
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_500Medium"
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    minHeight: 40,
    borderRadius: radii.round,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  chipText: {
    fontSize: 14,
    fontWeight: "800"
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  interestCard: {
    width: "48%",
    minHeight: 86,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  interestText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800"
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#FFFDF8",
    fontSize: 24,
    fontWeight: "900"
  },
  issuePreview: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md
  },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  issueText: {
    fontSize: 17,
    fontWeight: "700"
  },
  cover: {
    borderWidth: 1,
    borderRadius: 0,
    padding: 28,
    marginHorizontal: -20,
    marginTop: -20,
    paddingTop: 34,
    gap: 18,
    ...shadows.soft
  },
  coverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  coverActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card
  },
  notificationDot: {
    position: "absolute",
    right: 10,
    top: 9,
    width: 7,
    height: 7,
    borderRadius: 4
  },
  dateText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold"
  },
  sectionHeader: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold"
  },
  feedSection: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 13,
    ...shadows.card
  },
  feedSectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  feedHeaderCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  feedIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center"
  },
  feedName: {
    fontSize: 17,
    fontFamily: "Inter_700Bold"
  },
  feedDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  editorialScene: {
    height: 116,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  sceneGlow: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "58%",
    height: "100%",
    borderTopLeftRadius: 80,
    borderBottomLeftRadius: 80
  },
  sceneLeaf: {
    position: "absolute",
    width: 128,
    height: 48,
    borderRadius: 80
  },
  sceneLeafOne: {
    right: 22,
    top: 22,
    transform: [{ rotate: "-28deg" }]
  },
  sceneLeafTwo: {
    right: 82,
    bottom: 18,
    transform: [{ rotate: "22deg" }]
  },
  sceneLeafThree: {
    left: 28,
    bottom: 28,
    width: 90,
    height: 34,
    transform: [{ rotate: "-12deg" }]
  },
  feedHeadline: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold"
  },
  sourceLine: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold"
  },
  openAction: {
    fontSize: 14,
    fontFamily: "Inter_700Bold"
  },
  openActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  feedFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -7
  },
  miniAvatarText: {
    color: "#FFFDF8",
    fontSize: 9,
    fontWeight: "900"
  },
  participantCount: {
    marginLeft: spacing.md,
    fontSize: 12,
    fontFamily: "Inter_700Bold"
  },
  feedRail: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  feedPill: {
    width: 152,
    minHeight: 76,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  feedPillText: {
    fontSize: 16,
    fontWeight: "900"
  },
  feedPillMeta: {
    fontSize: 12,
    fontWeight: "800"
  },
  feedHero: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadows.soft
  },
  feedHeroTitle: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0
  },
  segmented: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    gap: 12,
    ...shadows.card
  },
  editorialImage: {
    height: 142,
    borderRadius: 14,
    marginBottom: spacing.sm,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    overflow: "hidden",
    padding: spacing.lg
  },
  editorialImageMark: {
    width: 74,
    height: 74,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 253, 248, 0.18)"
  },
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    alignItems: "center"
  },
  typeBadge: {
    maxWidth: "72%",
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  typeText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold"
  },
  externalNotice: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_600SemiBold"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingTop: spacing.sm
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  emptyState: {
    minHeight: 200,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md
  },
  editor: {
    minHeight: 290,
    borderWidth: 1,
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card
  },
  editorLabel: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  textInput: {
    minHeight: 230,
    textAlignVertical: "top",
    fontSize: 18,
    lineHeight: 27
  },
  editorFooter: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  safetyPanel: {
    borderWidth: 1,
    borderRadius: 22,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  contributionList: {
    gap: spacing.sm
  },
  contributionRow: {
    minHeight: 70,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card
  },
  contributionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  contributionCopy: {
    flex: 1
  },
  contributionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold"
  },
  searchBox: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  searchInput: {
    flex: 1,
    fontSize: 15
  },
  libraryTabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    paddingTop: spacing.sm
  },
  libraryTab: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  libraryTabText: {
    fontSize: 13,
    fontWeight: "900"
  },
  libraryItem: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card
  },
  libraryCopy: {
    flex: 1
  },
  libraryMeta: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  libraryTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontFamily: "Inter_700Bold"
  },
  libraryThumb: {
    width: 72,
    height: 66,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  profileHero: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md
  },
  personRow: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  personCopy: {
    flex: 1
  },
  personName: {
    fontSize: 16,
    fontWeight: "900"
  },
  smallButton: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: "900"
  },
  settingsRow: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  settingsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800"
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  metricCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "900"
  },
  tabBar: {
    minHeight: 76,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingBottom: Platform.select({ ios: spacing.sm, default: spacing.xs }),
    paddingTop: spacing.xs,
    zIndex: 2
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  primaryTabIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
    ...shadows.card
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold"
  }
});
