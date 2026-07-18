import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";

import { avatars, feedEditorialMeta } from "../app/editorial";
import { localDataService } from "../data/localDataService";
import { shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem, Person } from "../types/product";

export function FeedCard({ item, theme, viewerInterests = [], saved = !!item.saved, markedUseful = false, onToggleSaved, onToggleUseful, onOpen }: {
  item: FeedItem;
  theme: AppTheme;
  viewerInterests?: string[];
  saved?: boolean;
  markedUseful?: boolean;
  onToggleSaved?: () => void;
  onToggleUseful?: () => void;
  onOpen?: () => void;
}) {
  const [authorPreviewOpen, setAuthorPreviewOpen] = useState(false);
  const [connectRequested, setConnectRequested] = useState(false);
  const isExternal = item.imported;
  const isUserContribution = item.authorId === "you";
  const author = item.authorId && !isUserContribution
    ? localDataService.getPeople().find((person) => person.id === item.authorId)
    : null;
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
      {author && (
        <AuthorContextRow
          author={author}
          item={item}
          feedName={feed.name}
          theme={theme}
          accent={editorial.accent}
          expanded={authorPreviewOpen}
          onOpen={(event) => {
            event.stopPropagation();
            setAuthorPreviewOpen((current) => !current);
          }}
        />
      )}
      {authorPreviewOpen && author && (
        <AuthorPreviewPanel
          author={author}
          item={item}
          feedName={feed.name}
          theme={theme}
          accent={editorial.accent}
          viewerInterests={viewerInterests}
          connectRequested={connectRequested}
          onConnect={(event) => {
            event.stopPropagation();
            if (!author.linked) setConnectRequested(true);
          }}
        />
      )}
      <Text style={[styles.storySignal, { color: storyType === "official" ? "#49626B" : editorial.accent }]}>{signalLabel}</Text>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
      {!!(item.body ?? item.excerpt) && <Text style={[styles.body, { color: theme.muted }]}>{item.body ?? item.excerpt}</Text>}
      {storyType === "recommendation" && <StoryTypePanel icon="pin-outline" title="Add to weekend plans" body="A low-pressure save for later, not a public performance." theme={theme} editorial={editorial} />}
      {storyType === "fromYou" && <StoryTypePanel icon="checkmark-circle-outline" title="You contributed this" body="It moved from private review into the Smartfeed you chose." theme={theme} editorial={editorial} />}
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
            onPress={(event) => {
              event.stopPropagation();
              onToggleUseful?.();
            }}
            theme={theme}
            accent={editorial.accent}
          />
          <ActionPill
            icon="chatbubble-outline"
            label={item.replies > 10 ? `Join ${item.replies}` : `${item.replies} replies`}
            accessibilityLabel={`Open conversation for ${item.title}. ${item.replies} replies.`}
            onPress={(event) => {
              event.stopPropagation();
              onOpen?.();
            }}
            theme={theme}
            accent={editorial.accent}
          />
          <ActionPill
            icon={saved ? "bookmark" : "bookmark-outline"}
            label={saved ? "Saved" : "Save"}
            accessibilityLabel={saved ? `Remove ${item.title} from saved items` : `Save ${item.title}`}
            active={saved}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSaved?.();
            }}
            theme={theme}
            accent={editorial.accent}
          />
        </View>
      )}
    </Pressable>
  );
}

function AuthorContextRow({ author, item, feedName, theme, accent, expanded, onOpen }: {
  author: Person;
  item: FeedItem;
  feedName: string;
  theme: AppTheme;
  accent: string;
  expanded: boolean;
  onOpen: (event: GestureResponderEvent) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${expanded ? "Close" : "Open"} profile preview for ${author.displayName}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.authorContextRow, pressed && styles.authorContextRowPressed, { borderColor: `${accent}24`, backgroundColor: `${accent}0F` }]}
    >
      <View style={[styles.authorAvatar, { borderColor: `${accent}44` }]}>
        <Text style={[styles.authorAvatarText, { color: accent }]}>{avatars[author.avatar] ?? author.displayName.charAt(0)}</Text>
      </View>
      <View style={styles.authorContextCopy}>
        <Text style={[styles.authorContextName, { color: theme.text }]}>{author.displayName}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{formatAuthorContributionContext(item)} in {feedName} / @{author.username}</Text>
      </View>
      <Ionicons name={expanded ? "chevron-up" : "person-circle-outline"} color={theme.muted} size={18} />
    </Pressable>
  );
}

function AuthorPreviewPanel({ author, item, feedName, theme, accent, viewerInterests, connectRequested, onConnect }: {
  author: Person;
  item: FeedItem;
  feedName: string;
  theme: AppTheme;
  accent: string;
  viewerInterests: string[];
  connectRequested: boolean;
  onConnect: (event: GestureResponderEvent) => void;
}) {
  const sharedInterests = getSharedInterests(author.interests, viewerInterests);
  const connectionLabel = author.linked ? "Linked" : connectRequested ? "Request sent" : "Connect";
  const reason = sharedInterests.length > 0
    ? `You both pay attention to ${formatList(sharedInterests)}.`
    : `${author.displayName} appeared through a useful ${formatAuthorContributionContext(item).toLowerCase()} in ${feedName}.`;

  return (
    <View style={[styles.authorPreviewPanel, { borderColor: `${accent}33`, backgroundColor: `${accent}0D` }]}>
      <View style={styles.authorPreviewTop}>
        <View style={[styles.authorPreviewAvatar, { backgroundColor: `${accent}18`, borderColor: `${accent}44` }]}>
          <Text style={[styles.authorPreviewAvatarText, { color: accent }]}>{avatars[author.avatar] ?? author.displayName.charAt(0)}</Text>
        </View>
        <View style={styles.authorPreviewIdentity}>
          <Text style={[styles.authorPreviewKicker, { color: accent }]}>PROFILE PREVIEW</Text>
          <Text style={[styles.authorPreviewName, { color: theme.text }]}>{author.displayName}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>@{author.username} / {author.city}</Text>
        </View>
      </View>
      <View style={styles.authorPreviewBlock}>
        <Text style={[styles.authorPreviewLabel, { color: accent }]}>What they pay attention to</Text>
        <Text style={[styles.authorPreviewBio, { color: theme.text }]}>{author.bio}</Text>
      </View>
      <View style={[styles.authorReasonPanel, { borderColor: `${accent}24`, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.05)" : "rgba(255, 255, 252, 0.58)" }]}>
        <Ionicons name="link-outline" color={accent} size={16} />
        <Text style={[styles.authorReasonText, { color: theme.muted }]}>{reason}</Text>
      </View>
      {sharedInterests.length > 0 && (
        <View style={styles.authorInterestRow}>
          {sharedInterests.map((interest) => (
            <View key={`${author.id}-${interest}`} style={[styles.authorInterestPill, { borderColor: `${accent}33`, backgroundColor: `${accent}10` }]}>
              <Text style={[styles.authorInterestText, { color: accent }]}>{interest}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={[styles.authorFeaturedContribution, { borderTopColor: `${accent}22` }]}>
        <Text style={[styles.authorPreviewLabel, { color: accent }]}>Featured contribution</Text>
        <Text style={[styles.authorFeaturedTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{formatAuthorContributionContext(item)} in {feedName}</Text>
      </View>
      <View style={styles.authorPreviewActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={author.linked ? `${author.displayName} is linked` : connectRequested ? `Connection request sent to ${author.displayName}` : `Send connect request to ${author.displayName}`}
          accessibilityState={{ disabled: author.linked || connectRequested }}
          disabled={author.linked || connectRequested}
          onPress={onConnect}
          style={({ pressed }) => [
            styles.authorConnectButton,
            pressed && styles.actionPillPressed,
            { backgroundColor: author.linked || connectRequested ? `${accent}14` : accent, borderColor: `${accent}55` }
          ]}
        >
          <Ionicons name={author.linked ? "checkmark-circle" : connectRequested ? "time-outline" : "person-add-outline"} color={author.linked || connectRequested ? accent : "#FFFDF8"} size={16} />
          <Text style={[styles.authorConnectButtonText, { color: author.linked || connectRequested ? accent : "#FFFDF8" }]}>{connectionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatAuthorContributionContext(item: FeedItem) {
  if (item.itemType === "recommendation") return "Recommendation";
  if (item.itemType === "question") return "Question";
  if (item.itemType === "discussion") return "Discussion";
  if (item.itemType === "long_read") return "Long read";
  if (item.itemType === "link") return "Link";
  return "Contribution";
}

function getSharedInterests(authorInterests: string[], viewerInterests: string[]) {
  const normalizedViewerInterests = viewerInterests.map(normalizeInterest);
  return authorInterests.filter((interest) => normalizedViewerInterests.includes(normalizeInterest(interest))).slice(0, 3);
}

function normalizeInterest(interest: string) {
  const value = interest.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (value === "ux" || value === "uxdesign") return "uxdesign";
  if (value === "localfood" || value === "food") return "food";
  if (value === "culture") return "culture";
  return value;
}

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "a shared interest";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function UserContributionFooter({ item, saved, onToggleSaved, theme, accent }: {
  item: FeedItem;
  saved: boolean;
  onToggleSaved: () => void;
  theme: AppTheme;
  accent: string;
}) {
  const engagement = item.engagementSummary;
  const signal = engagement?.replyPreview
    ? "1 thoughtful reply"
    : engagement && engagement.saves > 0
      ? `${engagement.saves} saved it`
      : "No replies yet";

  return (
    <View style={styles.userContributionFooter}>
      <View style={styles.userContributionFooterCopy}>
        <View style={styles.userContributionStatus}>
          <Ionicons name="checkmark-circle-outline" color={accent} size={17} />
          <Text style={[styles.meta, { color: theme.muted }]}>Placed in this issue</Text>
        </View>
        <Text style={[styles.userContributionSignal, { color: accent }]}>{signal}</Text>
      </View>
      <ActionPill
        icon={saved ? "bookmark" : "bookmark-outline"}
        label={saved ? "Saved" : "Save"}
        accessibilityLabel={saved ? `Remove ${item.title} from saved items` : `Save ${item.title}`}
        active={saved}
        onPress={(event) => {
          event.stopPropagation();
          onToggleSaved();
        }}
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
  onPress: (event: GestureResponderEvent) => void;
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
  authorContextRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  authorContextRowPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }]
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 252, 0.72)"
  },
  authorAvatarText: {
    fontSize: 15,
    lineHeight: 19,
    fontFamily: "Inter_700Bold"
  },
  authorContextCopy: {
    flex: 1,
    gap: 1
  },
  authorContextName: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  authorPreviewPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.md
  },
  authorPreviewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  authorPreviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  authorPreviewAvatarText: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: "Inter_700Bold"
  },
  authorPreviewIdentity: {
    flex: 1,
    gap: 2
  },
  authorPreviewKicker: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  authorPreviewName: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  authorPreviewBlock: {
    gap: 4
  },
  authorPreviewLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  authorPreviewBio: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_600SemiBold"
  },
  authorReasonPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs
  },
  authorReasonText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_600SemiBold"
  },
  authorInterestRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  authorInterestPill: {
    minHeight: 28,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    justifyContent: "center"
  },
  authorInterestText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold"
  },
  authorFeaturedContribution: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: 3
  },
  authorFeaturedTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  authorPreviewActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm
  },
  authorConnectButton: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  authorConnectButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold"
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  userContributionFooterCopy: {
    flex: 1,
    gap: 3
  },
  userContributionSignal: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold"
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
