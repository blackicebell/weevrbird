import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { FeedCard } from "../components/FeedCard";
import { localDataService } from "../data/localDataService";
import { feedEditorialMeta, filters } from "../app/editorial";
import { radii, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem, Smartfeed, SmartfeedFilter } from "../types/product";

export function FeedsScreen(props: {
  theme: AppTheme;
  selectedFeed: Smartfeed;
  setSelectedFeed: (feed: Smartfeed) => void;
  activeFilter: SmartfeedFilter;
  setActiveFilter: (filter: SmartfeedFilter) => void;
  visibleFeedItems: FeedItem[];
  savedItemIds: string[];
  usefulItemIds: string[];
  toggleSavedItem: (itemId: string) => void;
  toggleUsefulItem: (itemId: string) => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const { theme, selectedFeed, setSelectedFeed, activeFilter, setActiveFilter, visibleFeedItems, savedItemIds, usefulItemIds, toggleSavedItem, toggleUsefulItem, onOpenDetail } = props;
  const editorial = feedEditorialMeta[selectedFeed.id] ?? feedEditorialMeta.atlanta;
  const pace = getFeedPace(selectedFeed);
  const feedFit = getFeedFitSignal(selectedFeed);
  const feeds = localDataService.getFeeds();
  const fromYouItems = visibleFeedItems.filter((item) => item.authorId === "you");
  const sectionItems = visibleFeedItems.filter((item) => item.authorId !== "you");

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.kicker, { color: theme.accent }]}>MAGAZINE SECTIONS</Text>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Smartfeeds</Text>
      <Text style={[styles.body, { color: theme.muted }]}>Each Smartfeed behaves like a section of your personal magazine, not another endless timeline.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.feedRail}>
        {feeds.map((feed) => <FeedJournalTab key={feed.id} feed={feed} selected={selectedFeed.id === feed.id} theme={theme} onPress={() => setSelectedFeed(feed)} />)}
      </ScrollView>

      <View style={[styles.feedHero, { backgroundColor: editorial.paper, borderColor: editorial.secondary }]}>
        <View style={styles.feedHeroTop}>
          <View>
            <Text style={[styles.kicker, { color: editorial.accent }]}>{editorial.masthead.toUpperCase()}</Text>
            <Text style={[styles.feedHeroTitle, { color: theme.text }]}>{editorial.edition}</Text>
          </View>
          <View style={[styles.feedMotif, { backgroundColor: editorial.secondary }]}>
            <Ionicons name={editorial.motif} color={editorial.accent} size={24} />
          </View>
        </View>
        <Text style={[styles.feedHeroSection, { color: editorial.accent }]}>{editorial.section}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{selectedFeed.description}</Text>
        <View style={styles.feedRhythmRow}>
          {[
            { label: "Pace", value: pace.pace },
            { label: "Best for", value: pace.bestFor },
            { label: "Stops at", value: `${selectedFeed.newItems} new` }
          ].map((item) => (
            <View key={item.label} style={[styles.feedRhythmPill, { borderColor: editorial.secondary, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.05)" : "rgba(255, 255, 252, 0.58)" }]}>
              <Text style={[styles.feedRhythmLabel, { color: editorial.accent }]}>{item.label}</Text>
              <Text style={[styles.feedRhythmValue, { color: theme.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.feedHeroRule, { backgroundColor: editorial.accent }]} />
        <Text style={[styles.meta, { color: theme.muted }]}>{editorial.issue} / {selectedFeed.members} / {selectedFeed.newItems} new pieces</Text>
        <View style={[styles.feedFitSignal, { borderColor: editorial.secondary, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.05)" : "rgba(255, 255, 252, 0.6)" }]}>
          <Ionicons name={selectedFeed.joined ? "checkmark-circle-outline" : "add-circle-outline"} color={editorial.accent} size={18} />
          <View style={styles.feedFitCopy}>
            <Text style={[styles.feedFitLabel, { color: editorial.accent }]}>Why this is here</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{feedFit}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.filterGlassBar, { borderColor: theme.line }]}>
        {filters.map((filter) => <Chip key={filter.key} label={filter.label} selected={activeFilter === filter.key} onPress={() => setActiveFilter(filter.key)} theme={theme} />)}
      </View>

      {visibleFeedItems.length > 0 ? (
        <>
          {fromYouItems.length > 0 && (
            <>
              <FromYouFeedMarker theme={theme} editorial={editorial} feed={selectedFeed} count={fromYouItems.length} />
              {fromYouItems.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  theme={theme}
                  saved={savedItemIds.includes(item.id)}
                  markedUseful={usefulItemIds.includes(item.id)}
                  onToggleSaved={() => toggleSavedItem(item.id)}
                  onToggleUseful={() => toggleUsefulItem(item.id)}
                  onOpen={() => onOpenDetail(item)}
                />
              ))}
            </>
          )}
          {sectionItems.slice(0, 1).map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              theme={theme}
              saved={savedItemIds.includes(item.id)}
              markedUseful={usefulItemIds.includes(item.id)}
              onToggleSaved={() => toggleSavedItem(item.id)}
              onToggleUseful={() => toggleUsefulItem(item.id)}
              onOpen={() => onOpenDetail(item)}
            />
          ))}
          <EditorNote theme={theme} editorial={editorial} feed={selectedFeed} />
          {sectionItems.slice(1).map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              theme={theme}
              saved={savedItemIds.includes(item.id)}
              markedUseful={usefulItemIds.includes(item.id)}
              onToggleSaved={() => toggleSavedItem(item.id)}
              onToggleUseful={() => toggleUsefulItem(item.id)}
              onOpen={() => onOpenDetail(item)}
            />
          ))}
          <FeedCaughtUp theme={theme} editorial={editorial} feed={selectedFeed} count={visibleFeedItems.length} />
        </>
      ) : (
        <EmptyState
          icon="leaf-outline"
          title="This section is quiet right now."
          body="Nothing new matches this view. Switch back to the latest section pieces, or add a useful signal yourself."
          actionLabel="Show latest"
          onAction={() => setActiveFilter("Latest")}
          theme={theme}
        />
      )}
    </ScrollView>
  );
}

function FromYouFeedMarker({ theme, editorial, feed, count }: {
  theme: AppTheme;
  editorial: (typeof feedEditorialMeta)[string];
  feed: Smartfeed;
  count: number;
}) {
  return (
    <View style={[styles.fromYouMarker, { borderColor: editorial.secondary, backgroundColor: theme.panel }]}>
      <View style={[styles.fromYouMarkerIcon, { backgroundColor: editorial.secondary }]}>
        <Ionicons name="checkmark-circle-outline" color={editorial.accent} size={19} />
      </View>
      <View style={styles.fromYouMarkerCopy}>
        <Text style={[styles.fromYouMarkerTitle, { color: theme.text }]}>Placed from your review</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {count} signal{count === 1 ? "" : "s"} you chose to make visible in {feed.name}.
        </Text>
      </View>
    </View>
  );
}

function FeedJournalTab({ feed, selected, theme, onPress }: {
  feed: Smartfeed;
  selected: boolean;
  theme: AppTheme;
  onPress: () => void;
}) {
  const editorial = feedEditorialMeta[feed.id] ?? feedEditorialMeta.atlanta;
  const pace = getFeedPace(feed);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${selected ? "Selected" : "Open"} ${feed.name} Smartfeed`}
      accessibilityHint={`${pace.pace}. ${feed.newItems} new pieces.`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.feedJournalTab,
        pressed && styles.feedJournalTabPressed,
        {
          backgroundColor: selected ? `${editorial.accent}E8` : "rgba(255, 255, 252, 0.68)",
          borderColor: selected ? `${editorial.accent}88` : theme.line
        }
      ]}
    >
      <View style={styles.feedJournalTop}>
        <Text style={[styles.feedJournalMasthead, { color: selected ? "#FFFDF8" : theme.text }]}>{editorial.masthead}</Text>
        <Ionicons name={editorial.motif} color={selected ? "#FFFDF8" : editorial.accent} size={17} />
      </View>
      <Text style={[styles.feedJournalSection, { color: selected ? "#FFFDF8" : editorial.accent }]}>{editorial.section}</Text>
      <View style={[styles.feedJournalRule, { backgroundColor: selected ? "rgba(255, 255, 255, 0.74)" : editorial.accent }]} />
      <Text style={[styles.feedJournalIssue, { color: selected ? "#F5EEE4" : theme.muted }]}>{pace.pace} / {feed.newItems} new</Text>
    </Pressable>
  );
}

function EditorNote({ theme, editorial, feed }: { theme: AppTheme; editorial: (typeof feedEditorialMeta)[string]; feed: Smartfeed }) {
  return (
    <View style={[styles.editorNote, { borderColor: editorial.secondary }]}>
      <View style={[styles.editorNoteRule, { backgroundColor: editorial.accent }]} />
      <Text style={[styles.kicker, { color: editorial.accent }]}>EDITOR'S NOTE</Text>
      <Text style={[styles.editorNoteTitle, { color: theme.text }]}>{feed.name} is curated for a slower skim.</Text>
      <Text style={[styles.body, { color: theme.muted }]}>This section is intentionally finite: start with the strongest piece, keep the useful bits, then leave when the edition closes.</Text>
    </View>
  );
}

function FeedCaughtUp({ theme, editorial, feed, count }: {
  theme: AppTheme;
  editorial: (typeof feedEditorialMeta)[string];
  feed: Smartfeed;
  count: number;
}) {
  return (
    <View style={[styles.feedCaughtUp, { borderColor: editorial.secondary }]}>
      <View style={[styles.feedCaughtUpIcon, { backgroundColor: editorial.secondary }]}>
        <Ionicons name="checkmark" color={editorial.accent} size={20} />
      </View>
      <Text style={[styles.feedCaughtUpKicker, { color: editorial.accent }]}>SECTION COMPLETE</Text>
      <Text style={[styles.feedCaughtUpTitle, { color: theme.text }]}>You finished {feed.name}.</Text>
      <Text style={[styles.body, { color: theme.muted, textAlign: "center" }]}>No infinite scroll here. This section will feel new again when something meaningful changes.</Text>
      <View style={styles.feedCaughtUpStats}>
        <Text style={[styles.feedCaughtUpStat, { color: editorial.accent }]}>{count} stories read</Text>
        <Text style={[styles.feedCaughtUpStat, { color: editorial.accent }]}>1 discussion saved</Text>
      </View>
    </View>
  );
}

function getFeedPace(feed: Smartfeed) {
  if (feed.type === "city") return { pace: "Morning + evening", bestFor: "Local signal" };
  if (feed.id === "black-tech") return { pace: "Daily brief", bestFor: "Career signal" };
  if (feed.id === "creative-community") return { pace: "Slow reads", bestFor: "Studio notes" };
  if (feed.id === "food-culture") return { pace: "Weekend rhythm", bestFor: "Places to try" };
  return { pace: "Quiet updates", bestFor: "Useful finds" };
}

function getFeedFitSignal(feed: Smartfeed) {
  const role = feed.type === "city" ? "local changes" : feed.type === "community" ? "shared questions" : "focused reading";
  const joinedCopy = feed.joined ? "Joined because" : "Suggested because";

  return `${joinedCopy} ${feed.members} keep ${role} moving here, with ${feed.newItems} new pieces waiting before this section closes.`;
}

function Chip({ label, selected, onPress, theme }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${selected ? "Selected filter" : "Filter by"} ${label}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.chipPressed,
        { backgroundColor: selected ? theme.text : theme.panel, borderColor: selected ? theme.text : theme.line }
      ]}
    >
      <Text style={[styles.chipText, { color: selected ? theme.bg : theme.text }]}>{label}</Text>
    </Pressable>
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
  screenTitle: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0
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
  chipPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }]
  },
  feedRail: {
    gap: spacing.md,
    paddingRight: spacing.lg
  },
  feedJournalTab: {
    width: 166,
    minHeight: 108,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    justifyContent: "space-between",
    overflow: "hidden",
    ...shadows.card
  },
  feedJournalTabPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  feedJournalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  feedJournalMasthead: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  feedJournalSection: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  feedJournalRule: {
    width: 58,
    height: 2,
    opacity: 0.74
  },
  feedJournalIssue: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "Inter_600SemiBold"
  },
  feedHero: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadows.soft
  },
  feedHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md
  },
  feedMotif: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  feedHeroTitle: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0
  },
  feedHeroSection: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Inter_700Bold"
  },
  feedHeroRule: {
    width: "42%",
    height: 2,
    opacity: 0.75,
    marginTop: spacing.xs
  },
  feedRhythmRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  feedRhythmPill: {
    flex: 1,
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    gap: 2
  },
  feedRhythmLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  feedRhythmValue: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  feedFitSignal: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  feedFitCopy: {
    flex: 1,
    gap: 2
  },
  feedFitLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  filterGlassBar: {
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    backgroundColor: "rgba(255, 255, 252, 0.48)",
    ...shadows.card
  },
  editorNote: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: spacing.xl,
    gap: spacing.sm
  },
  fromYouMarker: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card
  },
  fromYouMarkerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  fromYouMarkerCopy: {
    flex: 1,
    gap: 2
  },
  fromYouMarkerTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  editorNoteRule: {
    width: 86,
    height: 2,
    opacity: 0.78
  },
  editorNoteTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  feedCaughtUp: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 36,
    gap: spacing.md,
    alignItems: "center"
  },
  feedCaughtUpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  feedCaughtUpKicker: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold"
  },
  feedCaughtUpTitle: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
    fontFamily: "PlayfairDisplay_700Bold"
  },
  feedCaughtUpStats: {
    gap: spacing.xs,
    alignItems: "center"
  },
  feedCaughtUpStat: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
});
