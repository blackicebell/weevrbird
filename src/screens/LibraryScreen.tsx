import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { FeedCard } from "../components/FeedCard";
import { SectionHeader } from "../components/SectionHeader";
import { feedItems } from "../data/mockData";
import { radii, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem } from "../types/product";

export function LibraryScreen({
  theme,
  savedItems,
  search,
  setSearch,
  savedItemIds,
  usefulItemIds,
  toggleSavedItem,
  toggleUsefulItem,
  onOpenDetail
}: {
  theme: AppTheme;
  savedItems: FeedItem[];
  search: string;
  setSearch: (value: string) => void;
  savedItemIds: string[];
  usefulItemIds: string[];
  toggleSavedItem: (itemId: string) => void;
  toggleUsefulItem: (itemId: string) => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const archiveItems = savedItems.concat(feedItems.slice(3, 5)).slice(0, 4);
  const results = feedItems.filter((item) => {
    const haystack = `${item.title ?? ""} ${item.body ?? ""} ${item.excerpt ?? ""} ${item.sourceName ?? ""}`.toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.kicker, { color: theme.accent }]}>PERSONAL ARCHIVE</Text>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Library</Text>
      <Text style={[styles.body, { color: theme.muted }]}>The useful pieces you saved, opened, or may want to return to after the issue is done.</Text>
      <View style={[styles.archiveSummary, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        {[
          { label: "Saved", value: savedItems.length },
          { label: "Opened", value: archiveItems.length },
          { label: "Shelves", value: 3 }
        ].map((item) => (
          <View key={item.label} style={styles.archiveSummaryItem}>
            <Text style={[styles.archiveSummaryValue, { color: theme.text }]}>{item.value}</Text>
            <Text style={[styles.archiveSummaryLabel, { color: theme.muted }]}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.searchBox, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <Ionicons name="search-outline" color={theme.muted} size={20} />
        <TextInput
          accessibilityLabel="Search Weevrbird"
          accessibilityHint="Search saved pieces, opened items, sources, and conversations."
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
          {results.length > 0 ? (
            results.map((item) => (
              <FeedCard
                key={item.id}
                item={{ ...item, saved: savedItemIds.includes(item.id) }}
                theme={theme}
                saved={savedItemIds.includes(item.id)}
                markedUseful={usefulItemIds.includes(item.id)}
                onToggleSaved={() => toggleSavedItem(item.id)}
                onToggleUseful={() => toggleUsefulItem(item.id)}
                onOpen={() => onOpenDetail(item)}
              />
            ))
          ) : (
            <EmptyState
              icon="search-outline"
              title="Nothing saved with that phrase."
              body="Try a feed name, source, place, or topic. Library searches across saved pieces, history, and conversations."
              actionLabel="Clear search"
              onAction={() => setSearch("")}
              theme={theme}
            />
          )}
        </>
      ) : (
        <>
          <View style={styles.libraryTabs}>
            {["Saved for later", "Opened", "Shelves"].map((tab, index) => (
              <View key={tab} style={[styles.libraryTab, index === 0 && { borderBottomColor: theme.accent }]}>
                <Text style={[styles.libraryTabText, { color: index === 0 ? theme.accent : theme.muted }]}>{tab}</Text>
              </View>
            ))}
          </View>
          {archiveItems.length > 0 ? (
            archiveItems.map((item) => <LibraryItem key={`library-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />)
          ) : (
            <EmptyState
              icon="bookmark-outline"
              title="Your library is ready when you are."
              body="Save a guide, a question, or a useful recommendation from Today and it will collect here."
              theme={theme}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

function LibraryItem({ item, theme, onOpen }: { item: FeedItem; theme: AppTheme; onOpen: () => void }) {
  const icon = item.imported ? "book-outline" : "chatbubble-ellipses-outline";
  const reason = getSaveReason(item);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.libraryItem, pressed && styles.libraryItemPressed, { backgroundColor: theme.panel, borderColor: theme.line }]}
    >
      <View style={[styles.libraryIcon, { backgroundColor: theme.panelAlt }]}>
        <Ionicons name={icon} color={theme.accent} size={18} />
      </View>
      <View style={styles.libraryCopy}>
        <Text style={[styles.libraryMeta, { color: theme.accent }]}>{item.imported ? "Reading" : item.itemType.replace("_", " ")}</Text>
        <Text style={[styles.libraryTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{item.sourceName ?? "Weevrbird"} / {item.publishedAt}</Text>
        <Text style={[styles.libraryReason, { color: theme.muted }]}>{reason}</Text>
      </View>
      <Ionicons name={item.saved ? "bookmark" : "bookmark-outline"} color={theme.accent} size={20} />
    </Pressable>
  );
}

function getSaveReason(item: FeedItem) {
  if (item.saved) return "Saved from your issue";
  if (item.imported) return "Opened from a Smartfeed";
  if (item.itemType === "recommendation") return "Kept for a future plan";
  return "Conversation worth revisiting";
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
  archiveSummary: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm
  },
  archiveSummaryItem: {
    flex: 1,
    gap: 2
  },
  archiveSummaryValue: {
    fontSize: 24,
    lineHeight: 29,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  archiveSummaryLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
  },
  searchBox: {
    minHeight: 52,
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
  libraryTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(18, 31, 27, 0.1)"
  },
  libraryTab: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  libraryTabText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold"
  },
  libraryItem: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  libraryItemPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  libraryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center"
  },
  libraryCopy: {
    flex: 1,
    gap: 4
  },
  libraryMeta: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  libraryTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Inter_700Bold"
  },
  libraryReason: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_600SemiBold"
  }
});
