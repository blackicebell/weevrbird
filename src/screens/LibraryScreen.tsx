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
  const searchQuery = search.trim();
  const savedUserItems = savedItems.filter((item) => item.authorId === "you");
  const regularSavedItems = savedItems.filter((item) => item.authorId !== "you");
  const usefulItems = allLibraryItems.filter((item) => usefulItemIds.includes(item.id) && !savedItemIds.includes(item.id));
  const openedItems = archiveItems.filter((item) => !savedItemIds.includes(item.id));
  const tabContext = getLibraryTabContext(activeTab);

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
          { label: "Marked useful", value: usefulItemIds.length },
          { label: "Private history", value: archiveItems.length },
          { label: "Shelves", value: 3 }
        ].map((item) => (
          <View key={item.label} style={styles.archiveSummaryItem}>
            <Text style={[styles.archiveSummaryValue, { color: theme.text }]}>{item.value}</Text>
            <Text style={[styles.archiveSummaryLabel, { color: theme.muted }]}>{item.label}</Text>
          </View>
        ))}
      </View>
      {archiveItems.length > 0 && (
        <View style={styles.archivePrivacyNote}>
          <Ionicons name="lock-closed-outline" color={theme.accent} size={15} />
          <Text style={[styles.archivePrivacyText, { color: theme.muted }]}>Private history is only for you. Saving and opening pieces helps Weevrbird make your archive easier to return to.</Text>
        </View>
      )}
      <View style={[styles.searchBox, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <Ionicons name="search-outline" color={theme.muted} size={20} />
        <TextInput
          accessibilityLabel="Search Weevrbird"
          accessibilityHint="Search saved pieces, opened items, sources, private signals, and placed contributions."
          value={search}
          onChangeText={setSearch}
          placeholder="Search feeds, saved pieces, private signals"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>
      {search ? (
        <>
          <SectionHeader title={`Results for "${searchQuery || search}"`} action={`${results.length} found`} theme={theme} />
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
              title={`No results for "${searchQuery || search}".`}
              body="Try a feed name, source name, place, private signal, or placed contribution. Library searches saved pieces, opened history, and conversations."
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
          <View style={styles.libraryTabContext}>
            <Ionicons name={tabContext.icon} color={theme.accent} size={16} />
            <Text style={[styles.libraryTabContextText, { color: theme.muted }]}>{tabContext.body}</Text>
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
        <SectionHeader title="Private reading history" theme={theme} />
        {openedItems.map((item) => <LibraryItem key={`library-opened-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />)}
      </>
    ) : (
      <EmptyState
        icon="lock-closed-outline"
        title="No private reading history yet."
        body="Open a piece from Today or a Smartfeed and it will appear here for you only. You can return to it without making it public or saving it."
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

function getLibraryTabContext(tab: LibraryTab): {
  icon: keyof typeof Ionicons.glyphMap;
  body: string;
} {
  if (tab === "Opened") {
    return {
      icon: "time-outline",
      body: "Opened keeps your reading trail, including pieces you did not save but may want to find again."
    };
  }

  if (tab === "Shelves") {
    return {
      icon: "albums-outline",
      body: "Shelves group saved pieces into personal collections you can return to with less searching."
    };
  }

  return {
    icon: "bookmark-outline",
    body: "Saved for later is your private shelf for pieces, questions, and placed signals worth keeping."
  };
}

function LibraryShelfDetail({ collection, theme, onBack, onOpenDetail }: {
  collection: LibraryCollection;
  theme: AppTheme;
  onBack: () => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const shelfItems = localDataService.getShelfItems(collection.title);
  const shelfPurpose = getShelfPurpose(collection);

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
        <View style={[styles.shelfSummary, { borderColor: theme.line, backgroundColor: theme.panelAlt }]}>
          <View style={styles.shelfSummaryItem}>
            <Text style={[styles.archiveSummaryValue, { color: theme.text }]}>{shelfItems.length}</Text>
            <Text style={[styles.archiveSummaryLabel, { color: theme.muted }]}>Pieces</Text>
          </View>
          <View style={styles.shelfSummaryCopy}>
            <Text style={[styles.libraryReason, { color: theme.accent }]}>{collection.meta}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{shelfPurpose}</Text>
          </View>
        </View>
      </View>
      {shelfItems.map((item) => (
        <LibraryItem key={`library-shelf-item-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />
      ))}
    </ScrollView>
  );
}

function getShelfPurpose(collection: LibraryCollection) {
  if (collection.title.includes("Atlanta")) return "A local memory shelf for places, plans, and city signals you expect to use again.";
  if (collection.title.includes("attention")) return "A slower reading shelf for ideas that shape how you want to think and design.";
  if (collection.title.includes("artists")) return "A practical shelf for tools, resources, and references worth keeping close.";

  return "A focused shelf for saved pieces that belong together.";
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
  const whySaved = getWhySavedNote(item);
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
        {whySaved && (
          <View style={[styles.whySavedRow, { backgroundColor: theme.panelAlt }]}>
            <Ionicons name="sparkles-outline" color={theme.accent} size={14} />
            <Text style={[styles.whySavedText, { color: theme.accent }]}>{whySaved}</Text>
          </View>
        )}
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

function getWhySavedNote(item: FeedItem) {
  if (item.authorId !== "you") return null;

  const feed = localDataService.getFeed(item.feedId);
  return `Kept because it became useful context inside ${feed.name}.`;
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
  archivePrivacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  archivePrivacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_600SemiBold"
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
  libraryTabContext: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  libraryTabContextText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_600SemiBold"
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
  shelfSummary: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  shelfSummaryItem: {
    minWidth: 58,
    gap: 2
  },
  shelfSummaryCopy: {
    flex: 1,
    gap: 3
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
  },
  whySavedRow: {
    alignSelf: "flex-start",
    borderRadius: radii.round,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  whySavedText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
  }
});
