import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { profileCollections } from "../app/editorial";
import { EmptyState } from "../components/EmptyState";
import { FeedCard } from "../components/FeedCard";
import { SectionHeader } from "../components/SectionHeader";
import { localDataService } from "../data/localDataService";
import { radii, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem, SubmittedContribution } from "../types/product";

type LibraryTab = "Saved for later" | "Opened" | "Shelves";
type LibraryCollection = (typeof profileCollections)[number];

export function LibraryScreen({
  theme,
  savedItems,
  submittedContributions,
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
  submittedContributions: SubmittedContribution[];
  search: string;
  setSearch: (value: string) => void;
  savedItemIds: string[];
  usefulItemIds: string[];
  toggleSavedItem: (itemId: string) => void;
  toggleUsefulItem: (itemId: string) => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("Saved for later");
  const [activeShelf, setActiveShelf] = useState<LibraryCollection | null>(null);
  const userContentState = { savedItemIds, usefulItemIds };
  const archiveItems = localDataService.getArchiveItems(userContentState, submittedContributions);
  const results = localDataService.searchLibrary(search, submittedContributions);
  const allLibraryItems = localDataService.searchLibrary("", submittedContributions);
  const savedUserItems = savedItems.filter((item) => item.authorId === "you");
  const regularSavedItems = savedItems.filter((item) => item.authorId !== "you");
  const usefulItems = allLibraryItems.filter((item) => usefulItemIds.includes(item.id) && !savedItemIds.includes(item.id));
  const openedItems = archiveItems.filter((item) => !savedItemIds.includes(item.id));

  if (activeShelf) {
    return (
      <LibraryShelfDetail
        collection={activeShelf}
        theme={theme}
        onBack={() => setActiveShelf(null)}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.kicker, { color: theme.accent }]}>PERSONAL ARCHIVE</Text>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Library</Text>
      <Text style={[styles.body, { color: theme.muted }]}>The useful pieces you saved, opened, or may want to return to after the issue is done.</Text>
      <View style={[styles.archiveSummary, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        {[
          { label: "Saved", value: savedItems.length },
          { label: "Useful", value: usefulItemIds.length },
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
            {(["Saved for later", "Opened", "Shelves"] as LibraryTab[]).map((tab) => (
              <Pressable
                key={tab}
                accessibilityRole="tab"
                accessibilityLabel={tab}
                accessibilityState={{ selected: activeTab === tab }}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [styles.libraryTab, pressed && styles.libraryTabPressed, activeTab === tab && { borderBottomColor: theme.accent }]}
              >
                <Text style={[styles.libraryTabText, { color: activeTab === tab ? theme.accent : theme.muted }]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
          <LibraryTabContent
            activeTab={activeTab}
            savedUserItems={savedUserItems}
            regularSavedItems={regularSavedItems}
            usefulItems={usefulItems}
            openedItems={openedItems}
            theme={theme}
            onOpenDetail={onOpenDetail}
            onOpenShelf={setActiveShelf}
          />
        </>
      )}
    </ScrollView>
  );
}

function LibraryTabContent({
  activeTab,
  savedUserItems,
  regularSavedItems,
  usefulItems,
  openedItems,
  theme,
  onOpenDetail,
  onOpenShelf
}: {
  activeTab: LibraryTab;
  savedUserItems: FeedItem[];
  regularSavedItems: FeedItem[];
  usefulItems: FeedItem[];
  openedItems: FeedItem[];
  theme: AppTheme;
  onOpenDetail: (item: FeedItem) => void;
  onOpenShelf: (collection: LibraryCollection) => void;
}) {
  if (activeTab === "Shelves") {
    return (
      <>
        <SectionHeader title="Shelves" action="3 collections" theme={theme} />
        {profileCollections.map((collection) => {
          const shelfItems = localDataService.getShelfItems(collection.title);
          return (
            <ShelfRow
              key={`library-shelf-${collection.title}`}
              collection={collection}
              itemCount={shelfItems.length}
              theme={theme}
              onOpen={() => onOpenShelf(collection)}
            />
          );
        })}
      </>
    );
  }

  if (activeTab === "Opened") {
    return openedItems.length > 0 ? (
      <>
        <SectionHeader title="Recently opened" theme={theme} />
        {openedItems.map((item) => <LibraryItem key={`library-opened-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />)}
      </>
    ) : (
      <EmptyState
        icon="time-outline"
        title="Nothing opened yet."
        body="Read a piece from Today or a Smartfeed and it will appear here for quick return."
        theme={theme}
      />
    );
  }

  if (savedUserItems.length === 0 && regularSavedItems.length === 0 && usefulItems.length === 0) {
    return (
      <EmptyState
        icon="bookmark-outline"
        title="Your library is ready when you are."
        body="Save a guide, a question, or a useful recommendation from Today and it will collect here."
        theme={theme}
      />
    );
  }

  return (
    <>
      {savedUserItems.length > 0 && (
        <>
          <SectionHeader title="Your placed signals" theme={theme} />
          {savedUserItems.map((item) => (
            <LibraryItem key={`library-from-you-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />
          ))}
        </>
      )}
      {regularSavedItems.length > 0 && (
        <>
          <SectionHeader title={savedUserItems.length > 0 ? "Saved from Weevrbird" : "Saved for later"} theme={theme} />
          {regularSavedItems.map((item) => <LibraryItem key={`library-saved-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />)}
        </>
      )}
      {usefulItems.length > 0 && (
        <>
          <SectionHeader title="Marked useful" theme={theme} />
          {usefulItems.map((item) => (
            <LibraryItem
              key={`library-useful-${item.id}`}
              item={item}
              theme={theme}
              labelOverride="Useful signal"
              reasonOverride="Marked useful from your issue"
              onOpen={() => onOpenDetail(item)}
            />
          ))}
        </>
      )}
    </>
  );
}

function LibraryShelfDetail({ collection, theme, onBack, onOpenDetail }: {
  collection: LibraryCollection;
  theme: AppTheme;
  onBack: () => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const shelfItems = localDataService.getShelfItems(collection.title);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to Library" theme={theme} onPress={onBack} />
      <View style={[styles.shelfHero, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <View style={[styles.libraryIcon, { backgroundColor: theme.panelAlt }]}>
          <Ionicons name={collection.icon} color={theme.accent} size={19} />
        </View>
        <Text style={[styles.libraryMeta, { color: theme.accent }]}>Shelf</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>{collection.title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{collection.description}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{shelfItems.length} pieces / {collection.meta}</Text>
      </View>
      {shelfItems.map((item) => (
        <LibraryItem key={`library-shelf-item-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />
      ))}
    </ScrollView>
  );
}

function BackButton({ label, theme, onPress }: { label: string; theme: AppTheme; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.backButton}>
      <Ionicons name="chevron-back" color={theme.text} size={20} />
      <Text style={[styles.backButtonText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function ShelfRow({ collection, itemCount, theme, onOpen }: {
  collection: LibraryCollection;
  itemCount: number;
  theme: AppTheme;
  onOpen: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open shelf ${collection.title}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.libraryItem, pressed && styles.libraryItemPressed, { backgroundColor: theme.panel, borderColor: theme.line }]}
    >
      <View style={[styles.libraryIcon, { backgroundColor: theme.panelAlt }]}>
        <Ionicons name={collection.icon} color={theme.accent} size={18} />
      </View>
      <View style={styles.libraryCopy}>
        <Text style={[styles.libraryMeta, { color: theme.accent }]}>Shelf</Text>
        <Text style={[styles.libraryTitle, { color: theme.text }]}>{collection.title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{itemCount} pieces / {collection.meta}</Text>
        <Text style={[styles.libraryReason, { color: theme.muted }]}>{collection.description}</Text>
      </View>
      <Ionicons name="arrow-forward" color={theme.accent} size={18} />
    </Pressable>
  );
}

function LibraryItem({ item, theme, labelOverride, reasonOverride, onOpen }: {
  item: FeedItem;
  theme: AppTheme;
  labelOverride?: string;
  reasonOverride?: string;
  onOpen: () => void;
}) {
  const isUserContribution = item.authorId === "you";
  const icon = isUserContribution ? "checkmark-circle-outline" : item.imported ? "book-outline" : "chatbubble-ellipses-outline";
  const reason = reasonOverride ?? getSaveReason(item);
  const label = labelOverride ?? (isUserContribution ? "From You" : item.imported ? "Reading" : item.itemType.replace("_", " "));
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
        <Text style={[styles.libraryMeta, { color: theme.accent }]}>{label}</Text>
        <Text style={[styles.libraryTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{item.sourceName ?? "Weevrbird"} / {item.publishedAt}</Text>
        <Text style={[styles.libraryReason, { color: theme.muted }]}>{reason}</Text>
      </View>
      <Ionicons name={item.saved ? "bookmark" : "bookmark-outline"} color={theme.accent} size={20} />
    </Pressable>
  );
}

function getSaveReason(item: FeedItem) {
  if (item.authorId === "you") return `You placed this in ${localDataService.getFeed(item.feedId).name}. Saved for later context.`;
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
  libraryTabPressed: {
    opacity: 0.7
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
  backButton: {
    minHeight: 42,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  backButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  shelfHero: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.sm
  },
  shelfTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "PlayfairDisplay_700Bold"
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
