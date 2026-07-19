import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

import { feedEditorialMeta } from "../app/editorial";
import { localDataService } from "../data/localDataService";
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
  onToggleUseful,
  onOpenLibrary
}: {
  item: FeedItem;
  theme: AppTheme;
  saved: boolean;
  markedUseful: boolean;
  onBack: () => void;
  onToggleSaved: () => void;
  onToggleUseful: () => void;
  onOpenLibrary: () => void;
}) {
  const feed = localDataService.getFeed(item.feedId);
  const editorial = feedEditorialMeta[item.feedId] ?? feedEditorialMeta.atlanta;
  const body = item.body ?? item.excerpt ?? "A useful piece saved into this issue.";
  const itemTitle = item.title ?? "this piece";
  const publishedLabel = item.publishedAt || "Recent";
  const replyCount = Number.isFinite(item.replies) ? item.replies : 0;
  const isUserContribution = item.authorId === "you";
  const [shareStatus, setShareStatus] = useState<"idle" | "copying" | "copied" | "sharing" | "shared" | "unavailable">("idle");
  const [sourceStatus, setSourceStatus] = useState<"idle" | "opening" | "opened" | "unavailable">("idle");
  const [saveNotice, setSaveNotice] = useState<"saved" | "removed" | null>(null);
  const [usefulNotice, setUsefulNotice] = useState<"marked" | "removed" | null>(null);
  const [reportStatus, setReportStatus] = useState<"idle" | "noted">("idle");
  const shareUrl = getShareUrl(item);
  const shareMessage = getShareMessage(item, feed.name, shareUrl);
  const sourceCue = getSourceTrustCue(item);
  const hasExternalSource = !!item.url;
  const sourceDomain = getSourceDomain(item.url);
  const shareBusy = shareStatus === "sharing" || shareStatus === "copying";

  useEffect(() => {
    setShareStatus("idle");
    setSourceStatus("idle");
    setSaveNotice(null);
    setUsefulNotice(null);
    setReportStatus("idle");
  }, [item.id]);

  useEffect(() => {
    if (shareStatus !== "shared" && shareStatus !== "copied") return;

    const timeout = setTimeout(() => setShareStatus("idle"), 1800);
    return () => clearTimeout(timeout);
  }, [shareStatus]);

  useEffect(() => {
    if (sourceStatus !== "opened") return;

    const timeout = setTimeout(() => setSourceStatus("idle"), 1800);
    return () => clearTimeout(timeout);
  }, [sourceStatus]);

  const shareItem = async () => {
    try {
      setShareStatus("sharing");
      await Share.share({
        title: itemTitle,
        message: shareMessage,
        url: shareUrl
      });
      setShareStatus("shared");
    } catch {
      setShareStatus("unavailable");
    }
  };

  const copyItemLink = async () => {
    try {
      setShareStatus("copying");
      await Clipboard.setStringAsync(shareUrl);
      setShareStatus("copied");
    } catch {
      setShareStatus("unavailable");
    }
  };

  const openSource = async () => {
    if (!item.url) return;

    try {
      setSourceStatus("opening");
      await Linking.openURL(item.url);
      setSourceStatus("opened");
    } catch {
      setSourceStatus("unavailable");
    }
  };

  const saveItem = () => {
    const wasSaved = saved;
    onToggleSaved();
    setSaveNotice(wasSaved ? "removed" : "saved");
    setUsefulNotice(null);
  };

  const saveAgain = () => {
    if (saved) return;
    onToggleSaved();
    setSaveNotice("saved");
    setUsefulNotice(null);
  };

  const markUseful = () => {
    const wasMarked = markedUseful;
    onToggleUseful();
    setUsefulNotice(wasMarked ? "removed" : "marked");
    setSaveNotice(null);
  };

  const markUsefulAgain = () => {
    if (markedUseful) return;
    onToggleUseful();
    setUsefulNotice("marked");
    setSaveNotice(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" color={theme.text} size={20} />
        <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
      </Pressable>

      <View style={[styles.readerCard, { backgroundColor: editorial.paper, borderColor: editorial.secondary }]}>
        <View style={styles.readerTop}>
          <View style={[styles.feedIcon, { backgroundColor: editorial.secondary }]}>
            <Ionicons name={isUserContribution ? "checkmark-circle-outline" : editorial.motif} color={editorial.accent} size={22} />
          </View>
          <View style={styles.readerMetaCopy}>
            <Text style={[styles.kicker, { color: editorial.accent }]}>{isUserContribution ? "PLACED FROM YOUR REVIEW" : feed.name.toUpperCase()}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{isUserContribution ? `Visible in ${feed.name}` : item.sourceName ?? editorial.masthead} / {publishedLabel}</Text>
          </View>
        </View>
        <View style={styles.trustCueRow}>
          <View style={[styles.trustCue, { borderColor: `${editorial.accent}33`, backgroundColor: `${editorial.accent}10` }]}>
            <Ionicons name={sourceCue.icon} color={editorial.accent} size={15} />
            <Text style={[styles.trustCueText, { color: editorial.accent }]}>{sourceCue.label}</Text>
          </View>
          {hasExternalSource && (
            <View style={[styles.trustCue, { borderColor: theme.line, backgroundColor: theme.panel }]}>
              <Ionicons name="open-outline" color={theme.muted} size={15} />
              <Text style={[styles.trustCueText, { color: theme.muted }]}>{sourceDomain ?? "External source"}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.readerTitle, { color: theme.text }]}>{itemTitle}</Text>
        <Text style={[styles.readerBody, { color: theme.muted }]}>{body}</Text>

        {isUserContribution && (
          <View style={[styles.placedPanel, { borderColor: editorial.secondary, backgroundColor: `${editorial.secondary}77` }]}>
            <Ionicons name="newspaper-outline" color={editorial.accent} size={20} />
            <View style={styles.placedPanelCopy}>
              <Text style={[styles.contextTitle, { color: theme.text }]}>This is now part of {feed.name}</Text>
              <Text style={[styles.body, { color: theme.muted }]}>Your contribution moved from private review into the Smartfeed you chose. People can save it or use it as local context.</Text>
            </View>
          </View>
        )}

        {isUserContribution && (
          <ContributionEngagement item={item} theme={theme} accent={editorial.accent} />
        )}

        <View style={[styles.contextPanel, { borderColor: editorial.secondary, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.06)" : "rgba(255, 255, 252, 0.62)" }]}>
          <Text style={[styles.contextTitle, { color: theme.text }]}>{isUserContribution ? "Why it belongs here" : "Why this is in your issue"}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>{getDetailReason(item, feed.name)}</Text>
        </View>

        {(item.imported || hasExternalSource) && (
          <SourceTransparencyPanel
            item={item}
            feedName={feed.name}
            sourceDomain={sourceDomain}
            theme={theme}
            accent={editorial.accent}
          />
        )}

        <View style={styles.actionRow}>
          {hasExternalSource && (
            <DetailAction
              icon={sourceStatus === "opened" ? "checkmark-circle" : "open-outline"}
              label={sourceStatus === "opening" ? "Opening source" : sourceStatus === "opened" ? "Source opened" : "Open source"}
              accessibilityLabel={sourceDomain ? `Open source for ${itemTitle} on ${sourceDomain}` : `Open source for ${itemTitle}`}
              active={sourceStatus === "opening" || sourceStatus === "opened"}
              onPress={() => { void openSource(); }}
              disabled={sourceStatus === "opening"}
              theme={theme}
              accent={editorial.accent}
            />
          )}
          <DetailAction
            icon="share-outline"
            label={shareStatus === "sharing" ? "Sharing" : shareStatus === "shared" ? "Shared" : "Share"}
            accessibilityLabel={`Share ${itemTitle}`}
            active={shareStatus === "sharing" || shareStatus === "shared"}
            onPress={() => { void shareItem(); }}
            disabled={shareBusy}
            theme={theme}
            accent={editorial.accent}
          />
          <DetailAction
            icon={shareStatus === "copied" ? "checkmark-circle" : "copy-outline"}
            label={shareStatus === "copying" ? "Copying" : shareStatus === "copied" ? "Copied" : "Copy link"}
            accessibilityLabel={`Copy link for ${itemTitle}`}
            active={shareStatus === "copying" || shareStatus === "copied"}
            onPress={() => { void copyItemLink(); }}
            disabled={shareBusy}
            theme={theme}
            accent={editorial.accent}
          />
          <DetailAction
            icon={markedUseful ? "checkmark-circle" : "checkmark-circle-outline"}
            label={markedUseful ? "Marked useful" : "Mark useful"}
            accessibilityLabel={markedUseful ? `Remove useful mark from ${itemTitle}` : `Mark ${itemTitle} useful`}
            active={markedUseful}
            onPress={markUseful}
            theme={theme}
            accent={editorial.accent}
          />
          <DetailAction
            icon={saved ? "bookmark" : "bookmark-outline"}
            label={saved ? "Saved" : "Save"}
            accessibilityLabel={saved ? `Remove ${itemTitle} from Library` : `Save ${itemTitle} to Library`}
            active={saved}
            onPress={saveItem}
            theme={theme}
            accent={editorial.accent}
          />
        </View>
        {saveNotice === "saved" && saved && (
          <View style={[styles.savedNotice, { borderColor: editorial.secondary, backgroundColor: `${editorial.secondary}88` }]}>
            <Ionicons name="bookmark" color={editorial.accent} size={17} />
            <Text style={[styles.savedNoticeText, { color: theme.text }]}>Saved to Library. Weevrbird will keep this easy to return to.</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${itemTitle} in Library`}
              onPress={onOpenLibrary}
              style={({ pressed }) => [styles.savedNoticeAction, pressed && styles.detailActionPressed, { backgroundColor: editorial.accent }]}
            >
              <Text style={styles.savedNoticeActionText}>View</Text>
              <Ionicons name="arrow-forward" color="#FFFDF8" size={14} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Dismiss saved confirmation for ${itemTitle}`}
              onPress={() => setSaveNotice(null)}
              style={({ pressed }) => [styles.savedNoticeDismiss, pressed && styles.detailActionPressed]}
            >
              <Ionicons name="close" color={theme.muted} size={16} />
            </Pressable>
          </View>
        )}
        {saveNotice === "removed" && !saved && (
          <View style={[styles.savedNotice, { borderColor: theme.line, backgroundColor: theme.panel }]}>
            <Ionicons name="bookmark-outline" color={theme.muted} size={17} />
            <Text style={[styles.savedNoticeText, { color: theme.text }]}>Removed from Library. Your private opened history can still bring it back later.</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Save ${itemTitle} again`}
              onPress={saveAgain}
              style={({ pressed }) => [styles.savedNoticeAction, pressed && styles.detailActionPressed, { backgroundColor: editorial.accent }]}
            >
              <Text style={styles.savedNoticeActionText}>Save again</Text>
              <Ionicons name="bookmark" color="#FFFDF8" size={14} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Dismiss removed from Library message for ${itemTitle}`}
              onPress={() => setSaveNotice(null)}
              style={({ pressed }) => [styles.savedNoticeDismiss, pressed && styles.detailActionPressed]}
            >
              <Ionicons name="close" color={theme.muted} size={16} />
            </Pressable>
          </View>
        )}
        {usefulNotice === "marked" && markedUseful && (
          <View style={[styles.savedNotice, { borderColor: editorial.secondary, backgroundColor: `${editorial.secondary}88` }]}>
            <Ionicons name="checkmark-circle" color={editorial.accent} size={17} />
            <Text style={[styles.savedNoticeText, { color: theme.text }]}>Marked useful. Weevrbird will remember this as worth returning to.</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Dismiss useful confirmation for ${itemTitle}`}
              onPress={() => setUsefulNotice(null)}
              style={({ pressed }) => [styles.savedNoticeDismiss, pressed && styles.detailActionPressed]}
            >
              <Ionicons name="close" color={theme.muted} size={16} />
            </Pressable>
          </View>
        )}
        {usefulNotice === "removed" && !markedUseful && (
          <View style={[styles.savedNotice, { borderColor: theme.line, backgroundColor: theme.panel }]}>
            <Ionicons name="checkmark-circle-outline" color={theme.muted} size={17} />
            <Text style={[styles.savedNoticeText, { color: theme.text }]}>Useful mark removed. The piece stays in your opened history if you viewed it before.</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Mark ${itemTitle} useful again`}
              onPress={markUsefulAgain}
              style={({ pressed }) => [styles.savedNoticeAction, pressed && styles.detailActionPressed, { backgroundColor: editorial.accent }]}
            >
              <Text style={styles.savedNoticeActionText}>Mark again</Text>
              <Ionicons name="checkmark-circle" color="#FFFDF8" size={14} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Dismiss useful mark removed message for ${itemTitle}`}
              onPress={() => setUsefulNotice(null)}
              style={({ pressed }) => [styles.savedNoticeDismiss, pressed && styles.detailActionPressed]}
            >
              <Ionicons name="close" color={theme.muted} size={16} />
            </Pressable>
          </View>
        )}
        {shareStatus === "unavailable" && (
          <View style={[styles.statusNotice, { borderColor: `${palette.red}44`, backgroundColor: `${palette.red}10` }]}>
            <Ionicons name="alert-circle-outline" color={palette.red} size={17} />
            <Text style={[styles.statusNoticeText, { color: palette.red }]}>Sharing is not available on this device right now.</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss sharing error"
              onPress={() => setShareStatus("idle")}
              style={({ pressed }) => [styles.savedNoticeDismiss, pressed && styles.detailActionPressed]}
            >
              <Ionicons name="close" color={palette.red} size={16} />
            </Pressable>
          </View>
        )}
        {sourceStatus === "unavailable" && (
          <View style={[styles.statusNotice, { borderColor: `${palette.red}44`, backgroundColor: `${palette.red}10` }]}>
            <Ionicons name="alert-circle-outline" color={palette.red} size={17} />
            <Text style={[styles.statusNoticeText, { color: palette.red }]}>This source could not be opened right now.</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss source error"
              onPress={() => setSourceStatus("idle")}
              style={({ pressed }) => [styles.savedNoticeDismiss, pressed && styles.detailActionPressed]}
            >
              <Ionicons name="close" color={palette.red} size={16} />
            </Pressable>
          </View>
        )}
      </View>

      {isUserContribution ? (
        <View style={[styles.replyPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
          <Text style={[styles.kicker, { color: theme.accent }]}>IN CONTEXT</Text>
          <Text style={[styles.replyTitle, { color: theme.text }]}>Placed, not performed.</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Weevrbird treats your contribution as useful context first. Conversation can gather around it later, but the piece can stand on its own.</Text>
          <ReportRow itemTitle={itemTitle} status={reportStatus} theme={theme} onReport={() => setReportStatus("noted")} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Return to ${feed.name}`}
            onPress={onBack}
            style={({ pressed }) => [styles.contextButton, pressed && styles.detailActionPressed, { backgroundColor: editorial.accent }]}
          >
            <Text style={styles.contextButtonText}>Back to {feed.name}</Text>
            <Ionicons name="arrow-forward" color="#FFFDF8" size={15} />
          </Pressable>
        </View>
      ) : (
        <View style={[styles.replyPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
          <Text style={[styles.kicker, { color: theme.accent }]}>CONVERSATION</Text>
          <Text style={[styles.replyTitle, { color: theme.text }]}>{replyCount} thoughtful repl{replyCount === 1 ? "y" : "ies"}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Replies stay attached to the piece so the useful context is easy to revisit later.</Text>
          <ReportRow itemTitle={itemTitle} status={reportStatus} theme={theme} onReport={() => setReportStatus("noted")} />
        </View>
      )}
    </ScrollView>
  );
}

function DetailAction({ icon, label, accessibilityLabel, active, disabled = false, onPress, theme, accent }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accessibilityLabel?: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
  theme: AppTheme;
  accent: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, selected: active }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.detailAction,
        pressed && styles.detailActionPressed,
        disabled && styles.detailActionDisabled,
        { borderColor: active ? `${accent}55` : theme.line, backgroundColor: active ? `${accent}14` : theme.panel }
      ]}
    >
      <Ionicons name={icon} color={active ? accent : theme.muted} size={18} />
      <Text style={[styles.detailActionText, { color: active ? accent : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function ContributionEngagement({ item, theme, accent }: {
  item: FeedItem;
  theme: AppTheme;
  accent: string;
}) {
  const engagement = item.engagementSummary;
  const saves = engagement?.saves ?? 0;
  const useful = engagement?.useful ?? 0;

  return (
    <View style={[styles.engagementPanel, { borderColor: `${accent}33`, backgroundColor: `${accent}0F` }]}>
      <View style={styles.engagementStats}>
        <EngagementStat icon="bookmark-outline" label={saves > 0 ? `${saves} saved` : "No saves yet"} theme={theme} accent={accent} />
        <EngagementStat icon="checkmark-circle-outline" label={useful > 0 ? `${useful} useful` : "Waiting for response"} theme={theme} accent={accent} />
      </View>
      {engagement?.replyPreview ? (
        <View style={styles.replyPreview}>
          <Text style={[styles.contextTitle, { color: theme.text }]}>One thoughtful reply</Text>
          <Text style={[styles.body, { color: theme.muted }]}>{engagement.replyPreview}</Text>
        </View>
      ) : (
        <Text style={[styles.body, { color: theme.muted }]}>No replies yet. The piece is still useful as something you saved.</Text>
      )}
    </View>
  );
}

function EngagementStat({ icon, label, theme, accent }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: AppTheme;
  accent: string;
}) {
  return (
    <View style={styles.engagementStat}>
      <Ionicons name={icon} color={accent} size={17} />
      <Text style={[styles.meta, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

function ReportRow({ itemTitle, status, theme, onReport }: {
  itemTitle: string;
  status: "idle" | "noted";
  theme: AppTheme;
  onReport: () => void;
}) {
  const noted = status === "noted";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={noted ? `Report received for ${itemTitle}` : `Report ${itemTitle}`}
      accessibilityState={{ disabled: noted, selected: noted }}
      onPress={onReport}
      disabled={noted}
      style={({ pressed }) => [
        styles.reportRow,
        pressed && styles.detailActionPressed,
        noted && styles.reportRowDisabled,
        { borderColor: noted ? "rgba(158, 61, 52, 0.34)" : theme.line, backgroundColor: noted ? "rgba(158, 61, 52, 0.06)" : theme.panel }
      ]}
    >
      <Ionicons name={noted ? "checkmark-circle-outline" : "flag-outline"} color={noted ? palette.red : theme.muted} size={18} />
      <View style={styles.reportCopy}>
        <Text style={[styles.reportTitle, { color: noted ? palette.red : theme.text }]}>{noted ? "Report received" : "Report this piece"}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{noted ? "Thanks. We'll use this to keep your issue relevant and safe." : "Use this for spam, unsafe content, or something that feels out of place."}</Text>
      </View>
    </Pressable>
  );
}

function SourceTransparencyPanel({ item, feedName, sourceDomain, theme, accent }: {
  item: FeedItem;
  feedName: string;
  sourceDomain: string | null;
  theme: AppTheme;
  accent: string;
}) {
  const sourceName = item.sourceName ?? "External source";
  const sourceLabel = sourceDomain ? `${sourceName} / ${sourceDomain}` : sourceName;

  const notes = [
    {
      icon: "newspaper-outline" as const,
      title: "Original source",
      body: sourceLabel
    },
    {
      icon: "git-merge-outline" as const,
      title: "What Weevrbird did",
      body: `Placed this in ${feedName} as attributed reading context. The original piece stays with the source.`
    },
    {
      icon: "bookmark-outline" as const,
      title: "Your copy",
      body: "Saving or marking useful only changes your private Weevrbird library."
    }
  ];

  return (
    <View style={[styles.sourceTransparencyPanel, { borderColor: `${accent}28`, backgroundColor: theme.panel }]}>
      <View style={styles.sourceTransparencyHeader}>
        <Ionicons name="information-circle-outline" color={accent} size={19} />
        <Text style={[styles.contextTitle, { color: theme.text }]}>Source transparency</Text>
      </View>
      {notes.map((note) => (
        <View key={note.title} style={styles.sourceTransparencyRow}>
          <Ionicons name={note.icon} color={accent} size={17} />
          <View style={styles.sourceTransparencyCopy}>
            <Text style={[styles.sourceTransparencyTitle, { color: theme.text }]}>{note.title}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{note.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function getDetailReason(item: FeedItem, feedName: string) {
  if (item.authorId === "you") return `You contributed this to ${feedName} because it gives people something specific to save, try, or use as context.`;
  if (item.imported) return `Selected from ${feedName} because it gives you useful context without sending you into an endless feed.`;
  if (item.itemType === "recommendation") return "Saved-worthy because it includes place, timing, and a low-pressure reason to try it.";
  if (item.itemType === "question" || item.itemType === "discussion") return "Included because the replies can become practical context for people with the same question.";
  return "Included because it adds specific context to today's issue.";
}

function getSourceTrustCue(item: FeedItem): {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
} {
  if (item.authorId === "you") return { icon: "person-circle-outline", label: "Your contribution" };
  if (item.itemType === "official_update") return { icon: "shield-checkmark-outline", label: "Official update" };
  if (item.imported) return { icon: "newspaper-outline", label: item.sourceName ? "Source imported" : "Curated source" };
  if (item.itemType === "recommendation") return { icon: "ribbon-outline", label: "Community recommendation" };
  if (item.itemType === "question" || item.itemType === "discussion") return { icon: "chatbubbles-outline", label: "Community discussion" };
  return { icon: "layers-outline", label: "Weevrbird context" };
}

function getShareUrl(item: FeedItem) {
  if (item.url) return item.url;
  return `https://weevrbird.app/item/${encodeURIComponent(item.id)}`;
}

function getSourceDomain(url?: string) {
  if (!url) return null;

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function getShareMessage(item: FeedItem, feedName: string, shareUrl: string) {
  const title = item.title ?? "A useful Weevrbird piece";
  const source = item.sourceName ? `${item.sourceName} via ${feedName}` : `${feedName} on Weevrbird`;
  return `${title}\n\n${source}\n${shareUrl}`;
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
  trustCueRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  trustCue: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  trustCueText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
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
  placedPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  placedPanelCopy: {
    flex: 1,
    gap: spacing.xs
  },
  engagementPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.md
  },
  engagementStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  engagementStat: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  replyPreview: {
    borderTopWidth: 1,
    borderTopColor: "rgba(18, 31, 27, 0.1)",
    paddingTop: spacing.md,
    gap: spacing.xs
  },
  contextTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  sourceTransparencyPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.md
  },
  sourceTransparencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  sourceTransparencyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  sourceTransparencyCopy: {
    flex: 1,
    gap: 2
  },
  sourceTransparencyTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  reportRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  reportRowDisabled: {
    opacity: 0.82
  },
  reportCopy: {
    flex: 1,
    gap: 2
  },
  reportTitle: {
    fontSize: 14,
    lineHeight: 18,
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
  detailActionDisabled: {
    opacity: 0.64
  },
  detailActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  statusNotice: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  statusNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  savedNotice: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  savedNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_700Bold"
  },
  savedNoticeAction: {
    minHeight: 34,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  savedNoticeActionText: {
    color: "#FFFDF8",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "Inter_700Bold"
  },
  savedNoticeDismiss: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
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
  },
  contextButton: {
    minHeight: 42,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  contextButtonText: {
    color: "#FFFDF8",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  }
});
