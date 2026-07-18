import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { feedEditorialMeta } from "../app/editorial";
import { localDataService } from "../data/localDataService";
import { shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem } from "../types/product";

export function FeedCard({ item, theme, saved = !!item.saved, markedUseful = false, onToggleSaved, onToggleUseful, onOpen }: {
  item: FeedItem;
  theme: AppTheme;
  saved?: boolean;
  markedUseful?: boolean;
  onToggleSaved?: () => void;
  onToggleUseful?: () => void;
  onOpen?: () => void;
}) {
  const isExternal = item.imported;
  const isUserContribution = item.authorId === "you";
  const feed = localDataService.getFeed(item.feedId);
  const editorial = feedEditorialMeta[item.feedId] ?? feedEditorialMeta.atlanta;
  const storyType = isUserContribution ? "fromYou" : item.itemType === "recommendation" ? "recommendation" : item.itemType === "official_update" ? "official" : isExternal ? "reading" : "community";
  const storyIcon: keyof typeof Ionicons.glyphMap = storyType === "recommendation" ? "location-outline" : storyType === "official" ? "shield-checkmark-outline" : storyType === "reading" ? "book-outline" : storyType === "fromYou" ? "checkmark-circle-outline" : "chatbubbles-outline";
  const signalLabel = storyType === "reading"
    ? "Worth five minutes"
    : storyType === "recommendation"
      ? "Place to try"
      : storyType === "official"
        ? "Local notice"
        : storyType === "fromYou"
          ? "From your review"
          : "Community thread";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        storyType === "official" && styles.officialCard,
        pressed && onOpen && styles.cardPressed,
        { backgroundColor: storyType === "official" ? "#F7FAFB" : editorial.paper, borderColor: storyType === "official" ? "#D7E2E6" : editorial.secondary }
      ]}
    >
      <View style={[styles.paperFold, { borderTopColor: editorial.secondary, borderRightColor: editorial.secondary }]} />
      <View style={styles.cardMetaRow}>
        <View style={styles.cardMetaCluster}>
          <View style={[styles.storyTypeIcon, { backgroundColor: storyType === "official" ? "#E8F0F3" : editorial.secondary }]}>
            <Ionicons name={storyIcon} color={storyType === "official" ? "#49626B" : editorial.accent} size={14} />
          </View>
          <Text style={[styles.typeText, { color: editorial.accent }]}>
            {feed.name} / {isUserContribution ? "From You" : isExternal ? item.sourceName : item.itemType.replace("_", " ")}
          </Text>
        </View>
        <Text style={[styles.meta, { color: theme.muted }]}>{item.publishedAt}</Text>
      </View>
      <Text style={[styles.storySignal, { color: storyType === "official" ? "#49626B" : editorial.accent }]}>{signalLabel}</Text>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
      {!!(item.body ?? item.excerpt) && <Text style={[styles.body, { color: theme.muted }]}>{item.body ?? item.excerpt}</Text>}
      {storyType === "recommendation" && <StoryTypePanel icon="pin-outline" title="Add to weekend plans" body="A low-pressure save for later, not a public performance." theme={theme} editorial={editorial} />}
      {storyType === "fromYou" && <StoryTypePanel icon="checkmark-circle-outline" title="You placed this here" body="It moved from private review into the Smartfeed you chose." theme={theme} editorial={editorial} />}
      {storyType === "official" && <StoryTypePanel icon="time-outline" title="Action items" body="Check closures, transit notes, and reopening times before you head downtown." theme={theme} editorial={editorial} muted />}
      {isExternal && <Text style={[styles.externalNotice, { color: theme.muted }]}>Reading time: 5 min / Read source / Discuss on Weevrbird</Text>}
      {isUserContribution ? (
        <UserContributionFooter
          item={item}
          saved={saved}
          onToggleSaved={onToggleSaved ?? (() => undefined)}
          theme={theme}
          accent={editorial.accent}
        />
      ) : (
        <View style={styles.actionRow}>
          <ActionPill
            icon={markedUseful ? "sparkles" : "sparkles-outline"}
            label={markedUseful ? "Marked useful" : item.reactionLabel}
            accessibilityLabel={markedUseful ? "Remove useful mark" : `Mark useful: ${item.title}`}
            active={markedUseful}
            onPress={onToggleUseful ?? (() => undefined)}
            theme={theme}
            accent={editorial.accent}
          />
          <ActionPill
            icon="chatbubble-outline"
            label={item.replies > 10 ? `Join ${item.replies}` : `${item.replies} replies`}
            accessibilityLabel={`Open conversation for ${item.title}. ${item.replies} replies.`}
            onPress={() => undefined}
            theme={theme}
            accent={editorial.accent}
          />
          <ActionPill
            icon={saved ? "bookmark" : "bookmark-outline"}
            label={saved ? "Saved" : "Save"}
            accessibilityLabel={saved ? `Remove ${item.title} from saved items` : `Save ${item.title}`}
            active={saved}
            onPress={onToggleSaved ?? (() => undefined)}
            theme={theme}
            accent={editorial.accent}
          />
        </View>
      )}
    </Pressable>
  );
}

function UserContributionFooter({ item, saved, onToggleSaved, theme, accent }: {
  item: FeedItem;
  saved: boolean;
  onToggleSaved: () => void;
  theme: AppTheme;
  accent: string;
}) {
  return (
    <View style={styles.userContributionFooter}>
      <View style={styles.userContributionStatus}>
        <Ionicons name="checkmark-circle-outline" color={accent} size={17} />
        <Text style={[styles.meta, { color: theme.muted }]}>Placed in this issue</Text>
      </View>
      <ActionPill
        icon={saved ? "bookmark" : "bookmark-outline"}
        label={saved ? "Saved" : "Save"}
        accessibilityLabel={saved ? `Remove ${item.title} from saved items` : `Save ${item.title}`}
        active={saved}
        onPress={onToggleSaved}
        theme={theme}
        accent={accent}
      />
    </View>
  );
}

function StoryTypePanel({ icon, title, body, theme, editorial, muted }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  theme: AppTheme;
  editorial: (typeof feedEditorialMeta)[string];
  muted?: boolean;
}) {
  return (
    <View style={[styles.storyTypePanel, { backgroundColor: muted ? "#EDF3F5" : `${editorial.secondary}88`, borderColor: muted ? "#D7E2E6" : editorial.secondary }]}>
      <Ionicons name={icon} color={muted ? "#49626B" : editorial.accent} size={18} />
      <View style={styles.storyTypePanelCopy}>
        <Text style={[styles.storyTypePanelTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{body}</Text>
      </View>
    </View>
  );
}

function ActionPill({ icon, label, accessibilityLabel, active, onPress, theme, accent }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accessibilityLabel: string;
  active?: boolean;
  onPress: () => void;
  theme: AppTheme;
  accent: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionPill,
        pressed && styles.actionPillPressed,
        {
          backgroundColor: active ? `${accent}14` : "rgba(255, 255, 252, 0.48)",
          borderColor: active ? `${accent}55` : "rgba(18, 31, 27, 0.12)"
        }
      ]}
    >
      <Ionicons name={icon} color={active ? accent : theme.muted} size={16} />
      <Text style={[styles.meta, { color: active ? accent : theme.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    gap: 14,
    overflow: "hidden",
    ...shadows.card
  },
  cardPressed: {
    opacity: 0.86,
    transform: [{ translateY: 1 }]
  },
  officialCard: {
    borderRadius: 6
  },
  paperFold: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 24,
    borderRightWidth: 24,
    borderLeftWidth: 24,
    borderBottomWidth: 24,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent"
  },
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    alignItems: "center"
  },
  cardMetaCluster: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  storyTypeIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  typeText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  storySignal: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold"
  },
  externalNotice: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_600SemiBold"
  },
  storyTypePanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  storyTypePanelCopy: {
    flex: 1,
    gap: 2
  },
  storyTypePanelTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: spacing.sm
  },
  userContributionFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(18, 31, 27, 0.1)",
    paddingTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  userContributionStatus: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  actionPill: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  actionPillPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.97 }]
  }
});
