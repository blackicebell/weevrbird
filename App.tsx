import { Ionicons } from "@expo/vector-icons";
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
  useColorScheme,
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
const avatars = ["W", "A", "C", "M", "S", "L", "T", "N"];

function useTheme() {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  return {
    dark,
    bg: dark ? palette.dark : palette.paper,
    panel: dark ? palette.darkPanel : palette.cream,
    panelAlt: dark ? "#211D19" : palette.paperDeep,
    text: dark ? palette.darkText : palette.ink,
    muted: dark ? palette.darkMuted : palette.muted,
    line: dark ? palette.darkLine : palette.line,
    accent: dark ? "#C69A57" : palette.clay,
    success: dark ? "#9DB98F" : palette.sage
  };
}

export default function App() {
  const theme = useTheme();
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

  if (!onboarded) {
    return (
      <SafeAreaProvider>
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
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
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
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
      <LinearGradient colors={theme.dark ? ["#24201B", "#33281E"] : ["#FFFDF8", "#EFE5D8"]} style={[styles.cover, { borderColor: theme.line }]}>
        <View style={styles.coverTop}>
          <Image source={logo} style={styles.coverLogo} resizeMode="contain" />
          <Text style={[styles.dateText, { color: theme.muted }]}>Friday, July 10</Text>
        </View>
        <Text style={[styles.heroTitle, { color: theme.text }]}>Good morning, Chris.</Text>
        <Text style={[styles.coverSubtitle, { color: theme.muted }]}>Here is what is happening in your world today.</Text>
      </LinearGradient>

      <SectionHeader title="Your Smartfeeds" action="Manage" theme={theme} />
      {joinedFeeds.map((feed) => {
        const primary = feedItems.find((item) => item.feedId === feed.id) ?? feedItems[0];
        return (
          <Pressable
            key={feed.id}
            accessibilityRole="button"
            onPress={() => {
              setSelectedFeed(feed);
              setActiveTab("Feeds");
            }}
            style={[styles.feedSection, { backgroundColor: theme.panel, borderColor: theme.line }]}
          >
            <View style={styles.feedSectionTop}>
              <View>
                <Text style={[styles.feedName, { color: theme.text }]}>{feed.name}</Text>
                <Text style={[styles.meta, { color: theme.muted }]}>{feed.newItems} new items</Text>
              </View>
              <View style={[styles.feedDot, { backgroundColor: feed.palette }]} />
            </View>
            <Text style={[styles.feedHeadline, { color: theme.text }]}>{primary.title}</Text>
            <Text style={[styles.body, { color: theme.muted }]} numberOfLines={2}>{primary.body ?? primary.excerpt}</Text>
            <Text style={[styles.openAction, { color: theme.accent }]}>Open feed</Text>
          </Pressable>
        );
      })}

      <SectionHeader title="Conversations worth joining" theme={theme} />
      {feedItems.filter((item) => !item.imported).slice(0, 2).map((item) => <FeedCard key={item.id} item={item} theme={theme} />)}
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
        <Text style={[styles.body, { color: theme.muted }]}>Choose the shape of your contribution. Weevrbird rewards useful context, not performance.</Text>
        <View style={styles.chipWrap}>
          {contributionTypes.map((type) => <Chip key={type} label={type} selected={draftType === type} onPress={() => setDraftType(type)} theme={theme} />)}
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
          <SectionHeader title="Saved" theme={theme} />
          {savedItems.map((item) => <FeedCard key={item.id} item={item} theme={theme} />)}
          <SectionHeader title="Recently viewed" theme={theme} />
          {feedItems.slice(0, 2).map((item) => <FeedCard key={`recent-${item.id}`} item={item} theme={theme} />)}
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
        <Text style={[styles.meta, { color: theme.muted }]}>@chrism · Atlanta</Text>
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
      {isExternal && <Text style={[styles.externalNotice, { color: theme.muted }]}>External reading · Open source · Discuss on Weevrbird</Text>}
      <View style={styles.actionRow}>
        <IconLabel icon="sparkles-outline" label={item.reactionLabel} theme={theme} />
        <IconLabel icon="chatbubble-outline" label={`${item.replies} replies`} theme={theme} />
        <IconLabel icon={item.saved ? "bookmark" : "bookmark-outline"} label={item.saved ? "Saved" : "Save"} theme={theme} />
      </View>
    </View>
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
        return (
          <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setActiveTab(tab.key)} style={styles.tabButton}>
            <Ionicons name={tab.icon} color={active ? theme.accent : theme.muted} size={23} />
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
    flex: 1
  },
  flex: {
    flex: 1
  },
  appShell: {
    flex: 1
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
    gap: spacing.md
  },
  onboarding: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "space-between"
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
    width: 42,
    height: 42,
    borderRadius: radii.sm
  },
  coverLogo: {
    width: 34,
    height: 34
  },
  wordmark: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: 0
  },
  screenTitle: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: 0
  },
  coverSubtitle: {
    fontSize: 18,
    lineHeight: 26
  },
  body: {
    fontSize: 16,
    lineHeight: 23
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
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
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card
  },
  coverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700"
  },
  sectionHeader: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900"
  },
  feedSection: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm
  },
  feedSectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  feedName: {
    fontSize: 19,
    fontWeight: "900"
  },
  feedDot: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  feedHeadline: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900"
  },
  openAction: {
    fontSize: 14,
    fontWeight: "900"
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
    gap: spacing.sm
  },
  feedHeroTitle: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: 0
  },
  segmented: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm
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
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900"
  },
  externalNotice: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
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
    minHeight: 330,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm
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
    borderRadius: radii.md,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  searchBox: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  searchInput: {
    flex: 1,
    fontSize: 15
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
    minHeight: 72,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingBottom: Platform.select({ ios: spacing.sm, default: spacing.xs }),
    paddingTop: spacing.xs
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "800"
  }
});
