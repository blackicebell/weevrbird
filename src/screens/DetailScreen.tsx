import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { feedEditorialMeta } from "../app/editorial";
import { launchFeeds } from "../data/mockData";
import { palette, radii, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem } from "../types/product";

export function DetailScreen({
  item,
  theme,
  saved,
  markedUseful,
  onBack,
  onToggleSaved,
  onToggleUseful
}: {
  item: FeedItem;
  theme: AppTheme;
  saved: boolean;
  markedUseful: boolean;
  onBack: () => void;
  onToggleSaved: () => void;
  onToggleUseful: () => void;
}) {
  const feed = launchFeeds.find((entry) => entry.id === item.feedId) ?? launchFeeds[0];
  const editorial = feedEditorialMeta[item.feedId] ?? feedEditorialMeta.atlanta;
  const body = item.body ?? item.excerpt ?? "A useful signal saved into this issue.";

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" color={theme.text} size={20} />
        <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
      </Pressable>

      <View style={[styles.readerCard, { backgroundColor: editorial.paper, borderColor: editorial.secondary }]}>
        <View style={styles.readerTop}>
          <View style={[styles.feedIcon, { backgroundColor: editorial.secondary }]}>
            <Ionicons name={editorial.motif} color={editorial.accent} size={22} />
          </View>
          <View style={styles.readerMetaCopy}>
            <Text style={[styles.kicker, { color: editorial.accent }]}>{feed.name.toUpperCase()}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{item.sourceName ?? editorial.masthead} / {item.publishedAt}</Text>
          </View>
        </View>

        <Text style={[styles.readerTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.readerBody, { color: theme.muted }]}>{body}</Text>

        <View style={[styles.contextPanel, { borderColor: editorial.secondary, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.06)" : "rgba(255, 255, 252, 0.62)" }]}>
          <Text style={[styles.contextTitle, { color: theme.text }]}>Why this is in your issue</Text>
          <Text style={[styles.body, { color: theme.muted }]}>{getDetailReason(item, feed.name)}</Text>
        </View>

        <View style={styles.actionRow}>
          <DetailAction
            icon={markedUseful ? "sparkles" : "sparkles-outline"}
            label={markedUseful ? "Marked useful" : "Mark useful"}
            active={markedUseful}
            onPress={onToggleUseful}
            theme={theme}
            accent={editorial.accent}
          />
          <DetailAction
            icon={saved ? "bookmark" : "bookmark-outline"}
            label={saved ? "Saved" : "Save"}
            active={saved}
            onPress={onToggleSaved}
            theme={theme}
            accent={editorial.accent}
          />
        </View>
      </View>

      <View style={[styles.replyPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>CONVERSATION</Text>
        <Text style={[styles.replyTitle, { color: theme.text }]}>{item.replies} thoughtful repl{item.replies === 1 ? "y" : "ies"}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Replies stay attached to the piece so the useful context is easy to revisit later.</Text>
      </View>
    </ScrollView>
  );
}

function DetailAction({ icon, label, active, onPress, theme, accent }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
  theme: AppTheme;
  accent: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.detailAction,
        pressed && styles.detailActionPressed,
        { borderColor: active ? `${accent}55` : theme.line, backgroundColor: active ? `${accent}14` : theme.panel }
      ]}
    >
      <Ionicons name={icon} color={active ? accent : theme.muted} size={18} />
      <Text style={[styles.detailActionText, { color: active ? accent : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function getDetailReason(item: FeedItem, feedName: string) {
  if (item.imported) return `Selected from ${feedName} because it gives you useful context without sending you into an endless feed.`;
  if (item.itemType === "recommendation") return "Saved-worthy because it includes place, timing, and a low-pressure reason to try it.";
  if (item.itemType === "question" || item.itemType === "discussion") return "Included because the replies can become practical context for people with the same question.";
  return "Included because it adds a specific signal to today's issue.";
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 190,
    gap: 18
  },
  backButton: {
    minHeight: 42,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  backText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  readerCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card
  },
  readerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  feedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  readerMetaCopy: {
    flex: 1
  },
  kicker: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_500Medium"
  },
  readerTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  readerBody: {
    fontSize: 17,
    lineHeight: 28,
    fontFamily: "Inter_400Regular"
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter_400Regular"
  },
  contextPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs
  },
  contextTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  detailAction: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  detailActionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  },
  detailActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  replyPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.sm
  },
  replyTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: "PlayfairDisplay_700Bold"
  }
});
