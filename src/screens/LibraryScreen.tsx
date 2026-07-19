import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { profileCollections } from "../app/editorial";
import { EmptyState } from "../components/EmptyState";
import { FeedCard } from "../components/FeedCard";
import { ProfileMark } from "../components/ProfileMark";
import { SectionHeader } from "../components/SectionHeader";
import { localDataService } from "../data/localDataService";
import { radii, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem, Person, SubmittedContribution } from "../types/product";
import { formatFeedItemType } from "../utils/feedItemLabels";

export type LibraryTab = "Saved for later" | "Opened" | "Shelves";
type LibraryCollection = (typeof profileCollections)[number];
type QuickSearch = { label: string; query: string; count?: number };

export function LibraryScreen({
  theme,
  savedItems,
  submittedContributions,
  selectedInterests,
  search,
  setSearch,
  savedItemIds,
  usefulItemIds,
  openedItemIds,
  activeLibraryTab,
  setActiveLibraryTab,
  onClearOpenedHistory,
  onRemoveOpenedItem,
  onRestoreOpenedHistory,
  onRestoreOpenedItem,
  toggleSavedItem,
  toggleUsefulItem,
  onOpenDetail
}: {
  theme: AppTheme;
  savedItems: FeedItem[];
  submittedContributions: SubmittedContribution[];
  selectedInterests: string[];
  search: string;
  setSearch: (value: string) => void;
  savedItemIds: string[];
  usefulItemIds: string[];
  openedItemIds: string[];
  activeLibraryTab: LibraryTab;
  setActiveLibraryTab: (tab: LibraryTab) => void;
  onClearOpenedHistory: () => void;
  onRemoveOpenedItem: (itemId: string) => void;
  onRestoreOpenedHistory: (itemIds: string[]) => void;
  onRestoreOpenedItem: (itemId: string) => void;
  toggleSavedItem: (itemId: string) => void;
  toggleUsefulItem: (itemId: string) => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const [activeShelf, setActiveShelf] = useState<LibraryCollection | null>(null);
  const [clearHistoryArmed, setClearHistoryArmed] = useState(false);
  const [lastRemovedOpenedItem, setLastRemovedOpenedItem] = useState<Pick<FeedItem, "id" | "title"> | null>(null);
  const [lastClearedOpenedHistory, setLastClearedOpenedHistory] = useState<{ itemIds: string[]; count: number } | null>(null);
  const userContentState = { savedItemIds, usefulItemIds, openedItemIds };
  const returnItems = localDataService.getReturnItems(userContentState, submittedContributions);
  const allLibraryItems = localDataService.searchLibrary("", submittedContributions);
  const searchQuery = search.trim();
  const results = rankLibrarySearchResults(
    getLibrarySearchResults(searchQuery, allLibraryItems, submittedContributions, savedItemIds, usefulItemIds, openedItemIds),
    savedItemIds,
    usefulItemIds,
    openedItemIds
  );
  const shelfResults = searchQuery ? getLibraryShelfSearchResults(searchQuery) : [];
  const totalSearchResults = shelfResults.length + results.length;
  const emptySearchCopy = getLibraryEmptySearchCopy(searchQuery || search);
  const savedUserItems = savedItems.filter((item) => item.authorId === "you");
  const regularSavedItems = savedItems.filter((item) => item.authorId !== "you");
  const usefulItems = allLibraryItems.filter((item) => usefulItemIds.includes(item.id) && !savedItemIds.includes(item.id));
  const usefulDisplayCount = allLibraryItems.filter((item) => usefulItemIds.includes(item.id)).length;
  const openedItems = openedItemIds
    .map((itemId) => returnItems.find((item) => item.id === itemId))
    .filter((item): item is (typeof returnItems)[number] => !!item);
  const openedItemIdSet = new Set(openedItems.map((item) => item.id));
  const personalResultCount = results.filter((item) => getLibrarySearchRank(item, savedItemIds, usefulItemIds, openedItemIds) > 0).length;
  const quickSearches = getLibraryQuickSearches(selectedInterests, allLibraryItems, savedItemIds, usefulItemIds, openedItemIds);
  const tabContext = getLibraryTabContext(activeLibraryTab);
  const clearOpenedHistory = () => {
    if (!clearHistoryArmed) {
      setClearHistoryArmed(true);
      return;
    }

    onClearOpenedHistory();
    setClearHistoryArmed(false);
    setLastRemovedOpenedItem(null);
    setLastClearedOpenedHistory({ itemIds: openedItemIds, count: openedItems.length });
  };
  const removeOpenedItem = (item: FeedItem) => {
    setClearHistoryArmed(false);
    setLastRemovedOpenedItem({ id: item.id, title: item.title ?? "this piece" });
    setLastClearedOpenedHistory(null);
    onRemoveOpenedItem(item.id);
  };
  const undoOpenedItemRemoval = () => {
    if (!lastRemovedOpenedItem) return;
    onRestoreOpenedItem(lastRemovedOpenedItem.id);
    setLastRemovedOpenedItem(null);
  };
  const undoOpenedHistoryClear = () => {
    if (!lastClearedOpenedHistory) return;
    onRestoreOpenedHistory(lastClearedOpenedHistory.itemIds);
    setLastClearedOpenedHistory(null);
  };

  if (activeShelf) {
    return (
      <LibraryShelfDetail
        collection={activeShelf}
        theme={theme}
        selectedInterests={selectedInterests}
        onBack={() => setActiveShelf(null)}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.kicker, { color: theme.accent }]}>PRIVATE LIBRARY</Text>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Library</Text>
      <Text style={[styles.body, { color: theme.muted }]}>The useful pieces you saved, opened, or may want to return to after the issue is done.</Text>
      <View style={[styles.archiveSummary, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        {[
          { label: "Saved", value: savedItems.length },
          { label: "Marked useful", value: usefulDisplayCount },
          { label: "Opened", value: openedItems.length },
          { label: "Shelves", value: 3 }
        ].map((item) => (
          <View key={item.label} style={styles.archiveSummaryItem}>
            <Text style={[styles.archiveSummaryValue, { color: theme.text }]}>{item.value}</Text>
            <Text style={[styles.archiveSummaryLabel, { color: theme.muted }]}>{item.label}</Text>
          </View>
        ))}
      </View>
      {(savedItems.length > 0 || openedItems.length > 0) && (
        <View style={styles.archivePrivacyNote}>
          <Ionicons name="lock-closed-outline" color={theme.accent} size={15} />
          <Text style={[styles.archivePrivacyText, { color: theme.muted }]}>Private history is only for you. Saving and opening pieces helps Weevrbird make your Library easier to return to.</Text>
        </View>
      )}
      <View style={[styles.searchBox, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <Ionicons name="search-outline" color={theme.muted} size={20} />
        <TextInput
          accessibilityLabel="Search Weevrbird"
          accessibilityHint="Search saved pieces, opened history, sources, shelves, and your contributions."
          value={search}
          onChangeText={setSearch}
          placeholder="Search saved pieces, history, shelves"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {search.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear Library search"
            onPress={() => setSearch("")}
            style={({ pressed }) => [styles.searchClearButton, pressed && styles.searchClearButtonPressed, { backgroundColor: theme.panelAlt }]}
          >
            <Ionicons name="close" color={theme.muted} size={17} />
          </Pressable>
        )}
      </View>
      <View style={styles.quickSearchRow}>
        {quickSearches.map((quickSearch) => {
          const selected = normalizeLibrarySearchText(search) === normalizeLibrarySearchText(quickSearch.query);
          const countLabel =
            typeof quickSearch.count === "number" ? `, ${quickSearch.count} ${quickSearch.count === 1 ? "piece" : "pieces"}` : "";

          return (
            <Pressable
              key={`library-quick-search-${quickSearch.query}`}
              accessibilityRole="button"
              accessibilityLabel={`Search Library for ${quickSearch.label}${countLabel}`}
              accessibilityState={{ selected }}
              onPress={() => setSearch(selected ? "" : quickSearch.query)}
              style={({ pressed }) => [
                styles.quickSearchChip,
                pressed && styles.quickSearchChipPressed,
                {
                  borderColor: selected ? theme.accent : theme.line,
                  backgroundColor: selected ? theme.panelAlt : theme.panel
                }
              ]}
            >
              <Ionicons name={getLibraryQuickSearchIcon(quickSearch.query)} color={selected ? theme.accent : theme.muted} size={13} />
              <Text style={[styles.quickSearchText, { color: selected ? theme.accent : theme.muted }]}>{quickSearch.label}</Text>
              {typeof quickSearch.count === "number" && (
                <Text style={[styles.quickSearchCount, { color: selected ? theme.accent : theme.muted }]}>{quickSearch.count}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      {search ? (
        <>
          <SectionHeader
            title={`Results for "${searchQuery || search}"`}
            action={personalResultCount > 0 ? `${personalResultCount} personal / ${totalSearchResults} total` : `${totalSearchResults} found`}
            theme={theme}
          />
          {totalSearchResults > 0 ? (
            <>
              {shelfResults.length > 0 && (
                <>
                  <SectionHeader title="Shelves" action={`${shelfResults.length} found`} theme={theme} />
                  {shelfResults.map((collection) => (
                    <ShelfRow
                      key={`search-shelf-${collection.title}`}
                      collection={collection}
                      itemCount={localDataService.getShelfItems(collection.title).length}
                      theme={theme}
                      onOpen={() => setActiveShelf(collection)}
                    />
                  ))}
                </>
              )}
              {results.length > 0 && shelfResults.length > 0 && <SectionHeader title="Pieces" action={`${results.length} found`} theme={theme} />}
              {results.map((item) => {
                const statusCues = getLibrarySearchStatusCues(item, savedItemIds, usefulItemIds, openedItemIds);

                return (
                  <View key={item.id} style={styles.searchResultStack}>
                    {statusCues.length > 0 && (
                      <View style={styles.searchStatusRow}>
                        {statusCues.map((cue) => (
                          <View key={`${item.id}-${cue.label}`} style={[styles.searchStatusPill, { backgroundColor: theme.panelAlt }]}>
                            <Ionicons name={cue.icon} color={theme.accent} size={13} />
                            <Text style={[styles.searchStatusText, { color: theme.accent }]}>{cue.label}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <FeedCard
                      item={{ ...item, saved: savedItemIds.includes(item.id) }}
                      theme={theme}
                      viewerInterests={selectedInterests}
                      saved={savedItemIds.includes(item.id)}
                      markedUseful={usefulItemIds.includes(item.id)}
                      onToggleSaved={() => toggleSavedItem(item.id)}
                      onToggleUseful={() => toggleUsefulItem(item.id)}
                      onOpen={() => onOpenDetail(item)}
                    />
                  </View>
                );
              })}
            </>
          ) : (
            <EmptyState
              icon="search-outline"
              title={emptySearchCopy.title}
              body={emptySearchCopy.body}
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
                accessibilityState={{ selected: activeLibraryTab === tab }}
                onPress={() => {
                  setClearHistoryArmed(false);
                  setLastRemovedOpenedItem(null);
                  setLastClearedOpenedHistory(null);
                  setActiveLibraryTab(tab);
                }}
                style={({ pressed }) => [styles.libraryTab, pressed && styles.libraryTabPressed, activeLibraryTab === tab && { borderBottomColor: theme.accent }]}
              >
                <Text style={[styles.libraryTabText, { color: activeLibraryTab === tab ? theme.accent : theme.muted }]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.libraryTabContext}>
            <Ionicons name={tabContext.icon} color={theme.accent} size={16} />
            <Text style={[styles.libraryTabContextText, { color: theme.muted }]}>{tabContext.body}</Text>
          </View>
          <LibraryTabContent
            activeTab={activeLibraryTab}
            savedUserItems={savedUserItems}
            regularSavedItems={regularSavedItems}
            usefulItems={usefulItems}
            openedItems={openedItems}
            openedItemIds={openedItemIdSet}
            clearHistoryArmed={clearHistoryArmed}
            lastClearedOpenedHistory={lastClearedOpenedHistory}
            lastRemovedOpenedItem={lastRemovedOpenedItem}
            onClearOpenedHistory={clearOpenedHistory}
            onRemoveOpenedItem={removeOpenedItem}
            onUndoOpenedHistoryClear={undoOpenedHistoryClear}
            onUndoOpenedItemRemoval={undoOpenedItemRemoval}
            theme={theme}
            onOpenDetail={onOpenDetail}
            onOpenShelf={setActiveShelf}
          />
        </>
      )}
    </ScrollView>
  );
}

function getLibrarySearchStatusCues(item: FeedItem, savedItemIds: string[], usefulItemIds: string[], openedItemIds: string[]) {
  const cues: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [];

  if (savedItemIds.includes(item.id)) cues.push({ label: "Saved", icon: "bookmark" });
  if (openedItemIds.includes(item.id)) cues.push({ label: "Opened", icon: "time-outline" });
  if (usefulItemIds.includes(item.id)) cues.push({ label: "Marked useful", icon: "checkmark-circle-outline" });
  if (item.authorId === "you") cues.push({ label: "From you", icon: "create-outline" });

  return cues;
}

function getLibraryEmptySearchCopy(query: string) {
  const normalizedQuery = normalizeLibrarySearchText(query);
  if (normalizedQuery === "saved") {
    return {
      title: "No saved pieces yet.",
      body: "Save a guide, question, recommendation, or source when you want Weevrbird to keep it close."
    };
  }
  if (normalizedQuery === "opened") {
    return {
      title: "No opened history yet.",
      body: "Open a piece from Today or a Smartfeed and it will appear here privately."
    };
  }
  if (normalizedQuery === "useful" || normalizedQuery === "marked useful") {
    return {
      title: "Nothing marked useful yet.",
      body: "Mark pieces useful when they helped you decide, understand, or return later."
    };
  }
  if (normalizedQuery === "from you" || normalizedQuery === "contributions") {
    return {
      title: "No contributions from you yet.",
      body: "Write privately first, then choose the Smartfeed where it belongs."
    };
  }

  return {
    title: `No results for "${query}".`,
    body: "Try a feed name, source, place, shelf, or contribution. Library searches saved pieces, opened history, and conversations."
  };
}

function getLibrarySearchResults(
  query: string,
  allItems: FeedItem[],
  contributions: SubmittedContribution[],
  savedItemIds: string[],
  usefulItemIds: string[],
  openedItemIds: string[]
) {
  const normalizedQuery = normalizeLibrarySearchText(query);
  if (normalizedQuery === "saved") return allItems.filter((item) => savedItemIds.includes(item.id));
  if (normalizedQuery === "opened") return openedItemIds.map((itemId) => allItems.find((item) => item.id === itemId)).filter((item): item is FeedItem => !!item);
  if (normalizedQuery === "useful" || normalizedQuery === "marked useful") return allItems.filter((item) => usefulItemIds.includes(item.id));
  if (normalizedQuery === "from you" || normalizedQuery === "contributions") return allItems.filter((item) => item.authorId === "you");

  return localDataService.searchLibrary(query, contributions);
}

function getLibraryShelfSearchResults(query: string) {
  const normalizedQuery = normalizeLibrarySearchText(query);
  if (!normalizedQuery) return [];

  return profileCollections.filter((collection) => {
    const haystack = normalizeLibrarySearchText(`${collection.title} ${collection.description} ${collection.meta}`);
    return haystack.includes(normalizedQuery);
  });
}

function getLibraryQuickSearches(
  selectedInterests: string[],
  allItems: FeedItem[],
  savedItemIds: string[],
  usefulItemIds: string[],
  openedItemIds: string[]
) {
  const availableItemIds = new Set(allItems.map((item) => item.id));
  const savedCount = savedItemIds.filter((itemId) => availableItemIds.has(itemId)).length;
  const openedCount = openedItemIds.filter((itemId) => availableItemIds.has(itemId)).length;
  const usefulCount = usefulItemIds.filter((itemId) => availableItemIds.has(itemId)).length;
  const fromYouCount = allItems.filter((item) => item.authorId === "you").length;
  const statusFilters: QuickSearch[] = [];

  if (savedCount > 0) statusFilters.push({ label: "Saved", query: "Saved", count: savedCount });
  if (openedCount > 0) statusFilters.push({ label: "Opened", query: "Opened", count: openedCount });
  if (usefulCount > 0) statusFilters.push({ label: "Useful", query: "Useful", count: usefulCount });
  if (fromYouCount > 0) statusFilters.push({ label: "From you", query: "From you", count: fromYouCount });

  const defaults: QuickSearch[] = statusFilters.concat(
    ["Atlanta", "attention", "artists"].map((query) => ({ label: query, query }))
  );
  const suggestions: QuickSearch[] = defaults.concat(selectedInterests.slice(0, 3).map((query) => ({ label: query, query })));

  return Array.from(new Map(suggestions.map((item) => [normalizeLibrarySearchText(item.query), item])).values()).slice(0, 9);
}

function getLibraryQuickSearchIcon(query: string): keyof typeof Ionicons.glyphMap {
  const normalizedQuery = normalizeLibrarySearchText(query);
  if (normalizedQuery === "saved") return "bookmark-outline";
  if (normalizedQuery === "opened") return "time-outline";
  if (normalizedQuery === "useful") return "checkmark-circle-outline";
  if (normalizedQuery === "from you") return "create-outline";
  if (normalizedQuery.includes("atlanta")) return "map-outline";
  if (normalizedQuery.includes("artist")) return "construct-outline";
  if (normalizedQuery.includes("attention")) return "book-outline";
  return "search-outline";
}

function normalizeLibrarySearchText(value: string) {
  return value.trim().toLowerCase();
}

function rankLibrarySearchResults(items: FeedItem[], savedItemIds: string[], usefulItemIds: string[], openedItemIds: string[]) {
  return items.slice().sort((a, b) => {
    const scoreDifference = getLibrarySearchRank(b, savedItemIds, usefulItemIds, openedItemIds) - getLibrarySearchRank(a, savedItemIds, usefulItemIds, openedItemIds);
    if (scoreDifference !== 0) return scoreDifference;

    const openedDifference = openedItemIds.indexOf(a.id) - openedItemIds.indexOf(b.id);
    if (openedItemIds.includes(a.id) && openedItemIds.includes(b.id) && openedDifference !== 0) return openedDifference;

    return 0;
  });
}

function getLibrarySearchRank(item: FeedItem, savedItemIds: string[], usefulItemIds: string[], openedItemIds: string[]) {
  let score = 0;
  if (savedItemIds.includes(item.id)) score += 8;
  if (openedItemIds.includes(item.id)) score += 5;
  if (usefulItemIds.includes(item.id)) score += 3;
  if (item.authorId === "you") score += 6;
  return score;
}

function LibraryTabContent({
  activeTab,
  savedUserItems,
  regularSavedItems,
  usefulItems,
  openedItems,
  openedItemIds,
  clearHistoryArmed,
  lastClearedOpenedHistory,
  lastRemovedOpenedItem,
  onClearOpenedHistory,
  onRemoveOpenedItem,
  onUndoOpenedHistoryClear,
  onUndoOpenedItemRemoval,
  theme,
  onOpenDetail,
  onOpenShelf
}: {
  activeTab: LibraryTab;
  savedUserItems: FeedItem[];
  regularSavedItems: FeedItem[];
  usefulItems: FeedItem[];
  openedItems: FeedItem[];
  openedItemIds: Set<string>;
  clearHistoryArmed: boolean;
  lastClearedOpenedHistory: { itemIds: string[]; count: number } | null;
  lastRemovedOpenedItem: Pick<FeedItem, "id" | "title"> | null;
  onClearOpenedHistory: () => void;
  onRemoveOpenedItem: (item: FeedItem) => void;
  onUndoOpenedHistoryClear: () => void;
  onUndoOpenedItemRemoval: () => void;
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
        <SectionHeader
          title="Private reading history"
          action={clearHistoryArmed ? "Tap again to clear" : "Clear history"}
          actionAccessibilityLabel={clearHistoryArmed ? "Confirm clear private reading history" : "Clear private reading history"}
          onAction={onClearOpenedHistory}
          theme={theme}
        />
        {lastRemovedOpenedItem && (
          <UndoNotice
            title="Removed from opened history"
            itemTitle={lastRemovedOpenedItem.title}
            theme={theme}
            onUndo={onUndoOpenedItemRemoval}
          />
        )}
        {lastClearedOpenedHistory && (
          <UndoNotice
            title="Cleared opened history"
            itemTitle={`${lastClearedOpenedHistory.count} ${lastClearedOpenedHistory.count === 1 ? "piece" : "pieces"} removed`}
            theme={theme}
            onUndo={onUndoOpenedHistoryClear}
          />
        )}
        {openedItems.map((item) => (
          <LibraryItem
            key={`library-opened-${item.id}`}
            item={item}
            theme={theme}
            labelOverride="Opened privately"
            reasonOverride="Opened from your issue"
            actionLabel="Remove"
            actionIcon="close-circle-outline"
            showSavedCue={item.saved}
            onAction={() => onRemoveOpenedItem(item)}
            onOpen={() => onOpenDetail(item)}
          />
        ))}
      </>
    ) : (
      <>
        {lastRemovedOpenedItem && (
          <UndoNotice
            title="Removed from opened history"
            itemTitle={lastRemovedOpenedItem.title}
            theme={theme}
            onUndo={onUndoOpenedItemRemoval}
          />
        )}
        {lastClearedOpenedHistory && (
          <UndoNotice
            title="Cleared opened history"
            itemTitle={`${lastClearedOpenedHistory.count} ${lastClearedOpenedHistory.count === 1 ? "piece" : "pieces"} removed`}
            theme={theme}
            onUndo={onUndoOpenedHistoryClear}
          />
        )}
        <EmptyState
          icon="lock-closed-outline"
          title="No private reading history yet."
          body="Open a piece from Today or a Smartfeed and it will appear here for you only. You can return to it without making it public or saving it."
          theme={theme}
        />
      </>
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
          <SectionHeader title="Your contributions" theme={theme} />
          {savedUserItems.map((item) => (
            <LibraryItem key={`library-from-you-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />
          ))}
        </>
      )}
      {regularSavedItems.length > 0 && (
        <>
          <SectionHeader title={savedUserItems.length > 0 ? "Saved from Weevrbird" : "Saved for later"} theme={theme} />
          {regularSavedItems.map((item) => <LibraryItem key={`library-saved-${item.id}`} item={item} theme={theme} opened={openedItemIds.has(item.id)} onOpen={() => onOpenDetail(item)} />)}
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
              labelOverride="Worth returning to"
              reasonOverride="Marked useful from your issue"
              onOpen={() => onOpenDetail(item)}
            />
          ))}
        </>
      )}
    </>
  );
}

function UndoNotice({ title, itemTitle, theme, onUndo }: {
  title: string;
  itemTitle?: string;
  theme: AppTheme;
  onUndo: () => void;
}) {
  return (
    <View style={[styles.undoNotice, { borderColor: theme.line, backgroundColor: theme.panel }]}>
      <View style={styles.undoCopy}>
        <Text style={[styles.undoTitle, { color: theme.text }]}>{title}</Text>
        {itemTitle && <Text style={[styles.meta, { color: theme.muted }]} numberOfLines={1}>{itemTitle}</Text>}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={itemTitle ? `Undo ${title.toLowerCase()}: ${itemTitle}` : `Undo ${title.toLowerCase()}`}
        onPress={onUndo}
        style={({ pressed }) => [styles.undoButton, pressed && styles.libraryItemActionPressed, { backgroundColor: theme.panelAlt }]}
      >
        <Ionicons name="arrow-undo-outline" color={theme.accent} size={15} />
        <Text style={[styles.undoButtonText, { color: theme.accent }]}>Undo</Text>
      </Pressable>
    </View>
  );
}

function getLibraryTabContext(tab: LibraryTab): {
  icon: keyof typeof Ionicons.glyphMap;
  body: string;
} {
  if (tab === "Opened") {
    return {
      icon: "time-outline",
      body: "Opened is your private trail back to pieces you glanced at, even when they were not worth saving yet."
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
    body: "Saved for later is your private shelf for pieces, questions, and recommendations worth keeping."
  };
}

function LibraryShelfDetail({ collection, theme, selectedInterests, onBack, onOpenDetail }: {
  collection: LibraryCollection;
  theme: AppTheme;
  selectedInterests: string[];
  onBack: () => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const shelfItems = localDataService.getShelfItems(collection.title);
  const shelfPurpose = getShelfPurpose(collection);
  const contributors = getShelfContributors(shelfItems);

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
      {contributors.length > 0 && (
        <ShelfContributorsPanel
          contributors={contributors}
          items={shelfItems}
          selectedInterests={selectedInterests}
          theme={theme}
        />
      )}
      {shelfItems.map((item) => (
        <LibraryItem key={`library-shelf-item-${item.id}`} item={item} theme={theme} onOpen={() => onOpenDetail(item)} />
      ))}
    </ScrollView>
  );
}

function getShelfPurpose(collection: LibraryCollection) {
  if (collection.title.includes("Atlanta")) return "A local memory shelf for places, plans, and city notes you expect to use again.";
  if (collection.title.includes("attention")) return "A slower reading shelf for ideas that shape how you want to think and design.";
  if (collection.title.includes("artists")) return "A practical shelf for tools, resources, and references worth keeping close.";

  return "A focused shelf for saved pieces that belong together.";
}

function ShelfContributorsPanel({ contributors, items, selectedInterests, theme }: {
  contributors: Person[];
  items: FeedItem[];
  selectedInterests: string[];
  theme: AppTheme;
}) {
  return (
    <View style={[styles.shelfContributorsPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
      <View style={styles.shelfContributorsTop}>
        <View>
          <Text style={[styles.libraryMeta, { color: theme.accent }]}>Contributors</Text>
          <Text style={[styles.shelfContributorsTitle, { color: theme.text }]}>People behind this shelf.</Text>
        </View>
        <View style={[styles.libraryIcon, { backgroundColor: theme.panelAlt }]}>
          <Ionicons name="people-outline" color={theme.accent} size={18} />
        </View>
      </View>
      <Text style={[styles.meta, { color: theme.muted }]}>Shown because their public contributions are saved here.</Text>
      <View style={styles.shelfContributorList}>
        {contributors.slice(0, 3).map((person) => (
          <ShelfContributorRow
            key={`shelf-contributor-${person.id}`}
            person={person}
            item={items.find((entry) => entry.authorId === person.id)}
            selectedInterests={selectedInterests}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

function ShelfContributorRow({ person, item, selectedInterests, theme }: {
  person: Person;
  item?: FeedItem;
  selectedInterests: string[];
  theme: AppTheme;
}) {
  const sharedInterests = getSharedInterests(person.interests, selectedInterests);
  const feedName = item ? localDataService.getFeed(item.feedId).name : "Weevrbird";
  const reason = sharedInterests.length > 0
    ? `You both pay attention to ${formatList(sharedInterests)}.`
    : `${person.displayName} added useful context through ${feedName}.`;

  return (
    <View style={styles.shelfContributorRow}>
      <ProfileMark index={person.avatar} size={38} />
      <View style={styles.shelfContributorCopy}>
        <View style={styles.shelfContributorTopLine}>
          <Text style={[styles.shelfContributorName, { color: theme.text }]}>{person.displayName}</Text>
          <Text style={[styles.shelfContributorState, { color: person.linked ? theme.accent : theme.muted }]}>{person.linked ? "Linked" : "Not linked"}</Text>
        </View>
        <Text style={[styles.meta, { color: theme.muted }]}>{item ? `${formatContributionType(item.itemType)} / ${feedName}` : "Public contributor"}</Text>
        <Text style={[styles.shelfContributorReason, { color: theme.muted }]} numberOfLines={2}>{reason}</Text>
      </View>
    </View>
  );
}

function getShelfContributors(items: FeedItem[]) {
  const people = localDataService.getPeople();
  const seen = new Set<string>();

  return items.reduce<Person[]>((result, item) => {
    if (!item.authorId || item.authorId === "you" || seen.has(item.authorId)) return result;

    const person = people.find((entry) => entry.id === item.authorId);
    if (!person) return result;

    seen.add(person.id);
    result.push(person);
    return result;
  }, []);
}

function getSharedInterests(personInterests: string[], selectedInterests: string[]) {
  const selected = selectedInterests.map(normalizeInterest);
  return personInterests.filter((interest) => selected.includes(normalizeInterest(interest))).slice(0, 3);
}

function normalizeInterest(interest: string) {
  const value = interest.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (value === "ux" || value === "uxdesign") return "uxdesign";
  if (value === "localfood" || value === "food") return "food";
  return value;
}

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "a shared interest";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function formatContributionType(itemType: FeedItem["itemType"]) {
  return formatFeedItemType(itemType);
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

function LibraryItem({ item, theme, labelOverride, reasonOverride, actionLabel, actionIcon, opened = false, showSavedCue = false, onAction, onOpen }: {
  item: FeedItem;
  theme: AppTheme;
  labelOverride?: string;
  reasonOverride?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  opened?: boolean;
  showSavedCue?: boolean;
  onAction?: () => void;
  onOpen: () => void;
}) {
  const itemTitle = item.title ?? "this piece";
  const publishedLabel = item.publishedAt || "Recent";
  const isUserContribution = item.authorId === "you";
  const icon = isUserContribution ? "checkmark-circle-outline" : item.imported ? "book-outline" : "chatbubble-ellipses-outline";
  const reason = reasonOverride ?? getSaveReason(item);
  const whySaved = getWhySavedNote(item);
  const label = labelOverride ?? (isUserContribution ? "From You" : item.imported ? "Reading" : formatFeedItemType(item.itemType));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${itemTitle}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.libraryItem, pressed && styles.libraryItemPressed, { backgroundColor: theme.panel, borderColor: theme.line }]}
    >
      <View style={[styles.libraryIcon, { backgroundColor: theme.panelAlt }]}>
        <Ionicons name={icon} color={theme.accent} size={18} />
      </View>
      <View style={styles.libraryCopy}>
        <Text style={[styles.libraryMeta, { color: theme.accent }]}>{label}</Text>
        <Text style={[styles.libraryTitle, { color: theme.text }]} numberOfLines={2}>{itemTitle}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{item.sourceName ?? "Weevrbird pick"} / {publishedLabel}</Text>
        <Text style={[styles.libraryReason, { color: theme.muted }]}>{reason}</Text>
        {opened && (
          <View style={[styles.whySavedRow, { backgroundColor: theme.panelAlt }]}>
            <Ionicons name="time-outline" color={theme.accent} size={14} />
            <Text style={[styles.whySavedText, { color: theme.accent }]}>Opened before</Text>
          </View>
        )}
        {showSavedCue && (
          <View style={[styles.whySavedRow, { backgroundColor: theme.panelAlt }]}>
            <Ionicons name="bookmark" color={theme.accent} size={14} />
            <Text style={[styles.whySavedText, { color: theme.accent }]}>Saved in Library</Text>
          </View>
        )}
        {whySaved && (
          <View style={[styles.whySavedRow, { backgroundColor: theme.panelAlt }]}>
            <Ionicons name="checkmark-circle-outline" color={theme.accent} size={14} />
            <Text style={[styles.whySavedText, { color: theme.accent }]}>{whySaved}</Text>
          </View>
        )}
      </View>
      {onAction && actionLabel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} ${itemTitle}`}
          onPress={(event) => {
            event.stopPropagation();
            onAction();
          }}
          style={({ pressed }) => [styles.libraryItemAction, pressed && styles.libraryItemActionPressed]}
        >
          <Ionicons name={actionIcon ?? "ellipsis-horizontal-circle-outline"} color={theme.muted} size={19} />
          <Text style={[styles.libraryItemActionText, { color: theme.muted }]}>{actionLabel}</Text>
        </Pressable>
      ) : (
        <Ionicons name={item.saved ? "bookmark" : "bookmark-outline"} color={theme.accent} size={20} />
      )}
    </Pressable>
  );
}

function getSaveReason(item: FeedItem) {
  if (item.authorId === "you") return `You contributed this to ${localDataService.getFeed(item.feedId).name}. Saved for later.`;
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
  searchClearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  searchClearButtonPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.94 }]
  },
  quickSearchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: -8
  },
  quickSearchChip: {
    minHeight: 32,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  quickSearchChipPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }]
  },
  quickSearchText: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
  },
  quickSearchCount: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold"
  },
  searchResultStack: {
    gap: spacing.xs
  },
  searchStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs
  },
  searchStatusPill: {
    minHeight: 28,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  searchStatusText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold"
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
  undoNotice: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  undoCopy: {
    flex: 1,
    gap: 2
  },
  undoTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  undoButton: {
    minHeight: 34,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  undoButtonText: {
    fontSize: 12,
    lineHeight: 15,
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
  shelfContributorsPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm
  },
  shelfContributorsTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md
  },
  shelfContributorsTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  shelfContributorList: {
    gap: spacing.sm,
    paddingTop: spacing.xs
  },
  shelfContributorRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(18, 31, 27, 0.08)"
  },
  shelfContributorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  shelfContributorAvatarText: {
    fontSize: 15,
    lineHeight: 19,
    fontFamily: "Inter_700Bold"
  },
  shelfContributorCopy: {
    flex: 1,
    gap: 2
  },
  shelfContributorTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  shelfContributorName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  shelfContributorState: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
  },
  shelfContributorReason: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_600SemiBold"
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
  libraryItemAction: {
    minWidth: 62,
    minHeight: 34,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  libraryItemActionPressed: {
    opacity: 0.64,
    transform: [{ scale: 0.96 }]
  },
  libraryItemActionText: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "Inter_700Bold"
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
