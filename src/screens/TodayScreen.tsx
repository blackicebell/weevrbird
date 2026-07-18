import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { SectionHeader } from "../components/SectionHeader";
import {
  AppTab,
  feedEditorialMeta,
  getLayerTone
} from "../app/editorial";
import { localDataService } from "../data/localDataService";
import { palette, radii, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { EditionModule, FeedItem, IssuePace, Smartfeed } from "../types/product";

export function TodayScreen({ theme, joinedFeeds, submittedContributionCount, contributionActivityCount, issuePace, setSelectedFeed, setActiveTab, onOpenSearch, onOpenActivity, onOpenTune, onOpenDetail }: {
  theme: AppTheme;
  joinedFeeds: Smartfeed[];
  submittedContributionCount: number;
  contributionActivityCount: number;
  issuePace: IssuePace;
  setSelectedFeed: (feed: Smartfeed) => void;
  setActiveTab: (tab: AppTab) => void;
  onOpenSearch: () => void;
  onOpenActivity: () => void;
  onOpenTune: () => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const editionModules = useMemo(() => localDataService.getTodayIssue(issuePace), [joinedFeeds, issuePace]);
  const issuePromise = getIssuePromise(issuePace);
  const leadModule = editionModules[0];
  const remainingModules = editionModules.slice(1);

  if (editionModules.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <EmptyState
          icon="newspaper-outline"
          title="Your issue is still taking shape."
          body="Join a few Smartfeeds and Weevrbird will build a finite Today issue around what changed, what is worth reading, and what is worth joining."
          actionLabel="Browse Smartfeeds"
          onAction={() => setActiveTab("Feeds")}
          theme={theme}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <LinearGradient colors={theme.dark ? ["rgba(18, 32, 28, 0.96)", "rgba(18, 32, 28, 0.76)"] : ["rgba(255, 255, 252, 0.76)", "rgba(214, 241, 229, 0.34)"]} style={[styles.cover, { borderColor: theme.line }]}>
        <View style={styles.coverTop}>
          <View>
            <Text style={[styles.dateText, { color: theme.accent }]}>TODAY'S EDITION</Text>
            <Text style={[styles.coverIssue, { color: theme.muted }]}>Friday, July 17 / Atlanta</Text>
          </View>
          <View style={styles.coverActions}>
            <HeaderIcon name="search-outline" label="Search Today" theme={theme} onPress={onOpenSearch} />
            <HeaderIcon name="notifications-outline" label="Open contribution activity" theme={theme} onPress={onOpenActivity} dot={contributionActivityCount > 0} />
          </View>
        </View>
        <Text style={[styles.mastheadTitle, { color: theme.text }]}>Good{"\n"}morning.</Text>
        <View style={[styles.coverRule, { backgroundColor: theme.text }]} />
        <Text style={[styles.coverSubtitle, { color: theme.muted }]}>{issuePromise.subtitle}</Text>
        <View style={styles.issuePromiseRow}>
          {issuePromise.chips.map((item) => (
            <View key={item} style={[styles.issuePromisePill, { borderColor: theme.line, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.06)" : "rgba(255, 255, 252, 0.56)" }]}>
              <Text style={[styles.issuePromiseText, { color: theme.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <EditionBrief theme={theme} modules={editionModules} />

      {submittedContributionCount > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open private contributions"
          onPress={() => setActiveTab("Contribute")}
          style={({ pressed }) => [styles.reviewNudge, pressed && styles.reviewNudgePressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
        >
          <View style={[styles.reviewNudgeIcon, { backgroundColor: theme.panelAlt }]}>
            <Ionicons name="time-outline" color={theme.accent} size={19} />
          </View>
          <View style={styles.reviewNudgeCopy}>
            <Text style={[styles.reviewNudgeTitle, { color: theme.text }]}>
              {submittedContributionCount} private contribution{submittedContributionCount === 1 ? "" : "s"} ready to place
            </Text>
            <Text style={[styles.meta, { color: theme.muted }]}>Choose the Smartfeed where each signal will help most.</Text>
          </View>
          <Ionicons name="chevron-forward" color={theme.muted} size={18} />
        </Pressable>
      )}

      <SectionHeader title="Today, In Order" action="Tune" onAction={onOpenTune} theme={theme} />
      {leadModule && (
        <EditionModuleCard
          module={leadModule}
          theme={theme}
          featured
          onOpenFeed={(feed) => {
            setSelectedFeed(feed);
            setActiveTab("Feeds");
          }}
          onOpenLibrary={() => setActiveTab("Library")}
          onOpenDetail={onOpenDetail}
        />
      )}
      {remainingModules.map((module) => (
        module.type === "caught_up" ? (
          <CaughtUpEnding
            key={module.id}
            module={module}
            theme={theme}
            submittedContributionCount={submittedContributionCount}
            onOpenLibrary={() => setActiveTab("Library")}
            onOpenContribute={() => setActiveTab("Contribute")}
          />
        ) : (
          <EditionModuleCard
            key={module.id}
            module={module}
            theme={theme}
            onOpenFeed={(feed) => {
              setSelectedFeed(feed);
              setActiveTab("Feeds");
            }}
            onOpenLibrary={() => setActiveTab("Library")}
            onOpenDetail={onOpenDetail}
          />
        )
      ))}
    </ScrollView>
  );
}

function EditionBrief({ theme, modules }: { theme: AppTheme; modules: EditionModule[] }) {
  const counts = {
    Community: modules.filter((module) => module.layer === "Community").length,
    Reading: modules.filter((module) => module.layer === "Reading").length,
    Editorial: modules.filter((module) => module.layer === "Editorial").length
  };
  const path = [
    { label: "Read", body: `${counts.Editorial + counts.Reading} finite item${counts.Editorial + counts.Reading === 1 ? "" : "s"}`, tone: getLayerTone("Editorial") },
    { label: "Save", body: "Keep what may matter later", tone: getLayerTone("Reading") },
    { label: "Contribute", body: counts.Community > 0 ? `${counts.Community} useful prompt${counts.Community === 1 ? "" : "s"}` : "Place signal privately", tone: getLayerTone("Community") }
  ];

  return (
    <View style={[styles.editionBrief, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <View style={styles.editionBriefTop}>
        <Text style={[styles.kicker, { color: theme.accent }]}>MORNING FLIGHT</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>Built to finish</Text>
      </View>
      <Text style={[styles.editionBriefTitle, { color: theme.text }]}>Read, save, contribute.</Text>
      <Text style={[styles.body, { color: theme.muted }]}>Catch up quickly, keep the useful parts, and add signal only when you know where it belongs.</Text>
      <View style={styles.issuePath}>
        {path.map((step, index) => (
          <View key={step.label} style={[styles.issuePathItem, { borderColor: `${step.tone}36`, backgroundColor: `${step.tone}10` }]}>
            <Text style={[styles.issuePathNumber, { color: step.tone }]}>{index + 1}</Text>
            <View style={styles.issuePathCopy}>
              <Text style={[styles.issuePathLabel, { color: theme.text }]}>{step.label}</Text>
              <Text style={[styles.meta, { color: theme.muted }]}>{step.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function getIssuePromise(issuePace: IssuePace) {
  if (issuePace === "Brief") {
    return {
      subtitle: "A tighter personal issue. See what changed, keep the useful parts, and leave with less open.",
      chips: ["4 pieces", "7 min", "Quiet finish"]
    };
  }

  if (issuePace === "Deep") {
    return {
      subtitle: "A slower personal issue. Read with context, follow one conversation, and save what deserves a return.",
      chips: ["9 pieces", "20 min", "More context"]
    };
  }

  return {
    subtitle: "One personal issue. See what changed, save what matters, join one useful conversation, then leave caught up.",
    chips: ["6 pieces", "12 min", "Clear ending"]
  };
}

function EditionModuleCard({ module, theme, featured, onOpenFeed, onOpenLibrary, onOpenDetail }: {
  module: EditionModule;
  theme: AppTheme;
  featured?: boolean;
  onOpenFeed: (feed: Smartfeed) => void;
  onOpenLibrary: () => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const editorial = feedEditorialMeta[module.feed.id] ?? feedEditorialMeta.atlanta;
  const moduleTone = getModuleTone(module);
  const open = () => {
    if (module.item) {
      onOpenDetail(module.item);
      return;
    }
    module.type === "caught_up" ? onOpenLibrary() : onOpenFeed(module.feed);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${module.action}: ${module.title}`}
      accessibilityHint={module.reason || getModuleSignal(module)}
      onPress={open}
      style={({ pressed }) => [
        styles.editionModule,
        featured && styles.editionModuleFeatured,
        pressed && styles.editionModulePressed,
        { borderBottomColor: editorial.secondary }
      ]}
    >
      <View style={styles.feedSectionTop}>
        <View style={styles.feedHeaderCluster}>
          <View style={[styles.feedIconBadge, { backgroundColor: editorial.secondary }]}>
            <Ionicons name={editorial.motif} color={editorial.accent} size={20} />
          </View>
          <View>
            <Text style={[styles.feedName, { color: editorial.accent }]}>{module.feed.name.toUpperCase()}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{editorial.section}</Text>
          </View>
        </View>
        <View style={[styles.moduleBadge, { backgroundColor: `${moduleTone}12`, borderColor: `${moduleTone}34` }]}>
          <Text style={[styles.moduleBadgeText, { color: moduleTone }]}>{getModuleLabel(module)}</Text>
        </View>
      </View>

      {module.type === "lead_story" && <MapFragment theme={theme} editorial={editorial} />}
      {module.type === "what_changed" && <WhatChangedSummary module={module} theme={theme} editorial={editorial} />}
      {module.type === "reading_list" && <ReadingListModule module={module} theme={theme} editorial={editorial} />}
      {module.type === "community_question" && <Text style={[styles.promptLabel, { color: editorial.accent }]}>The Open Question</Text>}

      {module.type !== "reading_list" && (
        <>
          <Text style={[styles.feedHeadline, module.type === "community_question" && styles.feedHeadlineTextOnly, { color: theme.text }]}>{module.title}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>{module.body}</Text>
        </>
      )}

      <View style={styles.feedFooter}>
        <EngagementLine label={module.reason || getModuleSignal(module)} theme={theme} />
        <View style={[styles.openActionRow, { borderColor: editorial.secondary, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.05)" : "rgba(255, 255, 252, 0.52)" }]}>
          <Text style={[styles.openAction, { color: editorial.accent }]}>{module.action}</Text>
          <Ionicons name="arrow-forward" color={editorial.accent} size={15} />
        </View>
      </View>
      <QuietActionRow module={module} theme={theme} editorial={editorial} />
    </Pressable>
  );
}

function getModuleSignal(module: EditionModule) {
  if (module.type === "what_changed") return "New since this morning";
  if (module.type === "reading_list") return "3 selected reads";
  if (module.type === "recommendation") return "Worth revisiting this weekend";
  if (module.type === "community_question") return `${module.item?.replies ?? 18} replies from builders`;
  return `${module.item?.replies ?? 0} locals discussing`;
}

function getModuleLabel(module: EditionModule) {
  if (module.type === "lead_story") return "Start here";
  if (module.type === "what_changed") return "Changed";
  if (module.type === "reading_list") return "Keep";
  if (module.type === "recommendation") return "Save";
  if (module.type === "community_question") return "Join";
  return "Done";
}

function getModuleTone(module: EditionModule) {
  if (module.type === "lead_story") return palette.deepForest;
  if (module.type === "what_changed") return palette.sunlight;
  return getLayerTone(module.layer);
}

function WhatChangedSummary({ module, theme, editorial }: { module: EditionModule; theme: AppTheme; editorial: (typeof feedEditorialMeta)[string] }) {
  return (
    <View style={[styles.changedSummary, { borderColor: editorial.secondary }]}>
      <Text style={[styles.moduleEyebrow, { color: editorial.accent }]}>Since your last visit</Text>
      {(module.items ?? []).slice(0, 3).map((item) => (
        <View key={`changed-${item.id}`} style={styles.changedRow}>
          <View style={[styles.changedDot, { backgroundColor: editorial.accent }]} />
          <Text style={[styles.changedText, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        </View>
      ))}
    </View>
  );
}

function ReadingListModule({ module, theme, editorial }: { module: EditionModule; theme: AppTheme; editorial: (typeof feedEditorialMeta)[string] }) {
  return (
    <View style={styles.readingListModule}>
      <Text style={[styles.feedHeadline, { color: theme.text }]}>{module.title}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{module.body}</Text>
      <CompactHeadlineList items={module.items ?? []} theme={theme} editorial={editorial} />
    </View>
  );
}

function QuietActionRow({ module, theme, editorial }: { module: EditionModule; theme: AppTheme; editorial: (typeof feedEditorialMeta)[string] }) {
  const actions = module.type === "recommendation"
    ? ["Want to try", "Save"]
    : module.type === "community_question"
      ? ["Follow", "Save"]
      : ["Useful", "Save"];

  return (
    <View style={styles.quietActionRow}>
      {actions.map((action) => (
        <Pressable
          key={`${module.id}-${action}`}
          accessibilityRole="button"
          accessibilityLabel={`${action} ${module.title}`}
          onPress={() => undefined}
          style={({ pressed }) => [
            styles.quietActionPill,
            pressed && styles.quietActionPillPressed,
            { borderColor: editorial.secondary, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.06)" : "rgba(255, 255, 252, 0.56)" }
          ]}
        >
          <Text style={[styles.quietActionText, { color: theme.muted }]}>{action}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function CaughtUpEnding({ module, theme, submittedContributionCount, onOpenLibrary, onOpenContribute }: {
  module: EditionModule;
  theme: AppTheme;
  submittedContributionCount: number;
  onOpenLibrary: () => void;
  onOpenContribute: () => void;
}) {
  const editorial = feedEditorialMeta[module.feed.id] ?? feedEditorialMeta.atlanta;
  return (
    <View style={[styles.caughtUpEnding, { borderColor: editorial.secondary }]}>
      <View style={[styles.caughtUpMark, { backgroundColor: editorial.secondary }]}>
        <Ionicons name="checkmark" color={editorial.accent} size={22} />
      </View>
      <Text style={[styles.moduleEyebrow, { color: editorial.accent }]}>END OF ISSUE</Text>
      <Text style={[styles.caughtUpTitle, { color: theme.text }]}>You can leave now.</Text>
      <Text style={[styles.caughtUpBody, { color: theme.muted }]}>{module.body}</Text>
      <View style={styles.afterIssueStack}>
        <AfterIssueRow icon="bookmark-outline" title="Saved pieces live in Library" body="Return later without rebuilding the whole issue." theme={theme} editorial={editorial} />
        <AfterIssueRow
          icon="create-outline"
          title={submittedContributionCount > 0 ? `${submittedContributionCount} private signal${submittedContributionCount === 1 ? "" : "s"} waiting` : "Contribution stays private first"}
          body={submittedContributionCount > 0 ? "Place them when you know where they belong." : "Write when it is useful, then choose the right Smartfeed."}
          theme={theme}
          editorial={editorial}
        />
      </View>
      {submittedContributionCount > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open private contributions"
          onPress={onOpenContribute}
          style={({ pressed }) => [styles.secondaryCaughtUpButton, pressed && styles.caughtUpButtonPressed, { borderColor: editorial.secondary }]}
        >
          <Text style={[styles.secondaryCaughtUpButtonText, { color: editorial.accent }]}>Place private signals</Text>
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Library"
        onPress={onOpenLibrary}
        style={({ pressed }) => [styles.caughtUpButton, pressed && styles.caughtUpButtonPressed, { backgroundColor: editorial.accent }]}
      >
        <Text style={styles.caughtUpButtonText}>Open Library</Text>
        <Ionicons name="arrow-forward" color="#FFFDF8" size={15} />
      </Pressable>
    </View>
  );
}

function AfterIssueRow({ icon, title, body, theme, editorial }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  theme: AppTheme;
  editorial: (typeof feedEditorialMeta)[string];
}) {
  return (
    <View style={styles.afterIssueRow}>
      <Ionicons name={icon} color={editorial.accent} size={18} />
      <View style={styles.afterIssueCopy}>
        <Text style={[styles.afterIssueTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{body}</Text>
      </View>
    </View>
  );
}

function HeaderIcon({ name, label, theme, onPress, dot }: {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: AppTheme;
  onPress?: () => void;
  dot?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.headerIcon, pressed && styles.headerIconPressed, { backgroundColor: theme.panel, borderColor: theme.line }]}
    >
      <Ionicons name={name} color={theme.text} size={21} />
      {dot && <View style={[styles.notificationDot, { backgroundColor: palette.clay }]} />}
    </Pressable>
  );
}

function MapFragment({ theme, editorial }: { theme: AppTheme; editorial: (typeof feedEditorialMeta)[string] }) {
  return (
    <View style={[styles.mapFragment, { backgroundColor: editorial.paper, borderColor: editorial.secondary }]}>
      <View style={[styles.mapRoad, styles.mapRoadOne, { backgroundColor: editorial.secondary }]} />
      <View style={[styles.mapRoad, styles.mapRoadTwo, { backgroundColor: editorial.secondary }]} />
      <View style={[styles.mapRoad, styles.mapRoadThree, { backgroundColor: `${editorial.accent}22` }]} />
      <View style={[styles.mapBlock, styles.mapBlockOne, { borderColor: `${editorial.accent}55` }]} />
      <View style={[styles.mapBlock, styles.mapBlockTwo, { borderColor: `${editorial.accent}44` }]} />
      <View style={[styles.mapPin, { backgroundColor: editorial.accent }]}>
        <Ionicons name="location" color="#FFFDF8" size={16} />
      </View>
      <Text style={[styles.mapLabel, { color: theme.muted }]}>Grant Park / Old Fourth Ward / West End</Text>
    </View>
  );
}

function CompactHeadlineList({ items, theme, editorial }: { items: FeedItem[]; theme: AppTheme; editorial: (typeof feedEditorialMeta)[string] }) {
  return (
    <View style={styles.compactList}>
      {items.slice(0, 3).map((entry) => (
        <View key={`compact-${entry.id}`} style={[styles.compactListRow, { borderTopColor: editorial.secondary }]}>
          <Text style={[styles.compactListTitle, { color: theme.text }]} numberOfLines={2}>{entry.title}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>{entry.replies} replies</Text>
        </View>
      ))}
    </View>
  );
}

function EngagementLine({ label, theme }: { label: string; theme: AppTheme }) {
  return (
    <View style={styles.engagementLine}>
      <Ionicons name="chatbubbles-outline" color={theme.muted} size={16} />
      <Text style={[styles.engagementText, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 190,
    gap: 18
  },
  kicker: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  cover: {
    borderWidth: 1,
    borderRadius: 0,
    padding: 26,
    marginHorizontal: -20,
    marginTop: -20,
    paddingTop: 30,
    gap: 17,
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
  headerIconPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.96 }]
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
  coverIssue: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: "Inter_500Medium"
  },
  mastheadTitle: {
    fontSize: 50,
    lineHeight: 51,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0
  },
  coverRule: {
    width: 96,
    height: 2,
    opacity: 0.86
  },
  coverSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: "Inter_400Regular"
  },
  issuePromiseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  issuePromisePill: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  issuePromiseText: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
  },
  editionBrief: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card
  },
  editionBriefTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  editionBriefTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "PlayfairDisplay_700Bold"
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
  issuePath: {
    gap: spacing.sm,
    paddingTop: spacing.xs
  },
  issuePathItem: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  issuePathNumber: {
    width: 26,
    fontSize: 20,
    lineHeight: 25,
    fontFamily: "Inter_700Bold"
  },
  issuePathCopy: {
    flex: 1
  },
  issuePathLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  reviewNudge: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card
  },
  reviewNudgePressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  reviewNudgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  reviewNudgeCopy: {
    flex: 1,
    gap: 2
  },
  reviewNudgeTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  editionModule: {
    borderBottomWidth: 1,
    paddingVertical: 22,
    gap: 11
  },
  editionModulePressed: {
    opacity: 0.84,
    transform: [{ translateY: 1 }]
  },
  editionModuleFeatured: {
    paddingTop: 4
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  feedName: {
    fontSize: 12,
    fontFamily: "Inter_700Bold"
  },
  moduleBadge: {
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  moduleBadgeText: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
  },
  mapFragment: {
    height: 126,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  mapRoad: {
    position: "absolute",
    height: 18,
    borderRadius: 20,
    opacity: 0.86
  },
  mapRoadOne: {
    width: 230,
    left: -34,
    top: 34,
    transform: [{ rotate: "-18deg" }]
  },
  mapRoadTwo: {
    width: 250,
    right: -52,
    bottom: 30,
    transform: [{ rotate: "-28deg" }]
  },
  mapRoadThree: {
    width: 190,
    left: 98,
    top: 68,
    transform: [{ rotate: "19deg" }]
  },
  mapBlock: {
    position: "absolute",
    width: 86,
    height: 54,
    borderWidth: 1,
    borderRadius: 8,
    opacity: 0.7
  },
  mapBlockOne: {
    left: 36,
    bottom: 18,
    transform: [{ rotate: "-6deg" }]
  },
  mapBlockTwo: {
    right: 42,
    top: 18,
    transform: [{ rotate: "8deg" }]
  },
  mapPin: {
    position: "absolute",
    right: 80,
    top: 44,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  mapLabel: {
    position: "absolute",
    left: 18,
    bottom: 14,
    fontSize: 11,
    fontFamily: "Inter_700Bold"
  },
  promptLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  feedHeadline: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold"
  },
  feedHeadlineTextOnly: {
    fontSize: 31,
    lineHeight: 38
  },
  changedSummary: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: "rgba(255, 255, 252, 0.52)"
  },
  moduleEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  changedRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  changedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7
  },
  changedText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "Inter_600SemiBold"
  },
  readingListModule: {
    gap: spacing.sm
  },
  compactList: {
    gap: spacing.xs
  },
  compactListRow: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: 3
  },
  compactListTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: "Inter_700Bold"
  },
  feedFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10
  },
  engagementLine: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  engagementText: {
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
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  quietActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quietActionPill: {
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    paddingVertical: 7
  },
  quietActionPillPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }]
  },
  quietActionText: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
  },
  caughtUpEnding: {
    minHeight: 340,
    borderTopWidth: 1,
    paddingTop: 38,
    paddingBottom: 190,
    gap: spacing.md,
    alignItems: "center"
  },
  caughtUpMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs
  },
  caughtUpTitle: {
    fontSize: 34,
    lineHeight: 39,
    textAlign: "center",
    fontFamily: "PlayfairDisplay_700Bold"
  },
  caughtUpBody: {
    maxWidth: 300,
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
    fontFamily: "Inter_400Regular"
  },
  afterIssueStack: {
    width: "100%",
    gap: spacing.sm,
    maxWidth: 330,
    paddingVertical: spacing.xs
  },
  afterIssueRow: {
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  afterIssueCopy: {
    flex: 1,
    gap: 2
  },
  afterIssueTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  secondaryCaughtUpButton: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  secondaryCaughtUpButtonText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  caughtUpButton: {
    minHeight: 44,
    borderRadius: radii.round,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  caughtUpButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  caughtUpButtonText: {
    color: "#FFFDF8",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  }
});
