import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { contributionMeta, contributionTypes } from "../app/editorial";
import { PrimaryButton } from "../components/PrimaryButton";
import { localDataService } from "../data/localDataService";
import { palette, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { SubmittedContribution } from "../types/product";

export function ContributeScreen({
  theme,
  draftType,
  setDraftType,
  draft,
  setDraft,
  submittedContributions,
  onSubmitContribution,
  onPlaceContribution
}: {
  theme: AppTheme;
  draftType: string;
  setDraftType: (type: string) => void;
  draft: string;
  setDraft: (text: string) => void;
  submittedContributions: SubmittedContribution[];
  onSubmitContribution: (contribution: SubmittedContribution) => void;
  onPlaceContribution: (contributionId: string, feedId: string) => void;
}) {
  const [submittedContributionId, setSubmittedContributionId] = React.useState<string | null>(null);
  const [selectedReviewFeedId, setSelectedReviewFeedId] = React.useState<string | null>(null);
  const charLimit = draftType === "Long Read" ? 5000 : draftType === "Note" ? 280 : 900;
  const contributionGuidance = getContributionGuidance(draftType);
  const trimmedDraft = draft.trim();
  const qualityChecks = [
    { label: "Specific enough to help someone decide", complete: trimmedDraft.length >= 24 },
    { label: "Adds context, not just a reaction", complete: /\s/.test(trimmedDraft) && trimmedDraft.split(/\s+/).length >= 6 },
    { label: "Ready to fit inside a finite issue", complete: trimmedDraft.length > 0 && trimmedDraft.length <= charLimit }
  ];
  const readyToSubmit = qualityChecks.every((check) => check.complete);
  const latestContribution = submittedContributionId
    ? submittedContributions.find((contribution) => contribution.id === submittedContributionId)
    : submittedContributions[0];
  const reviewContributions = submittedContributions.filter((contribution) => contribution.status === "review");
  const placementFeeds = localDataService.getFeeds().filter((feed) => feed.joined).slice(0, 4);

  const submit = () => {
    if (!trimmedDraft) {
      Alert.alert("Add a little context", "Your contribution needs text before it can be shared.");
      return;
    }

    if (!readyToSubmit) {
      Alert.alert("Tighten the signal", "Add a little more context so this can help someone decide whether to save, reply, or move on.");
      return;
    }

    const createdAt = new Date().toISOString();
    const contributionId = `local-${createdAt}`;
    setSubmittedContributionId(contributionId);
    setSelectedReviewFeedId(getDefaultFeedId(draftType));
    onSubmitContribution({
      id: contributionId,
      type: draftType,
      body: trimmedDraft,
      feedId: getDefaultFeedId(draftType),
      createdAt,
      status: "review"
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.kicker, { color: theme.accent }]}>ADD USEFUL SIGNAL</Text>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Contribute</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Share something specific enough to help someone read, save, try, or join with less noise.</Text>
        <View style={[styles.guidancePanel, { backgroundColor: theme.panel, borderColor: theme.line }]}>
          <View style={[styles.guidanceIcon, { backgroundColor: contributionGuidance.color }]}>
            <Ionicons name={contributionGuidance.icon} color={theme.text} size={18} />
          </View>
          <View style={styles.guidanceCopy}>
            <Text style={[styles.guidanceTitle, { color: theme.text }]}>{contributionGuidance.title}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{contributionGuidance.body}</Text>
          </View>
        </View>
        <View style={styles.contributionList}>
          {contributionTypes.map((type) => (
            <ContributionTypeRow
              key={type}
              type={type}
              selected={draftType === type}
              onPress={() => setDraftType(type)}
              theme={theme}
            />
          ))}
        </View>
        <View style={[styles.editor, { backgroundColor: theme.panel, borderColor: theme.line }]}>
          <Text style={[styles.editorLabel, { color: theme.accent }]}>{draftType}</Text>
          <TextInput
            accessibilityLabel={`${draftType} contribution editor`}
            accessibilityHint={contributionGuidance.placeholder}
            multiline
            value={draft}
            onChangeText={(text) => text.length <= charLimit && setDraft(text)}
            placeholder={contributionGuidance.placeholder}
            placeholderTextColor={theme.muted}
            style={[styles.textInput, { color: theme.text }]}
          />
          <View style={styles.editorFooter}>
            <Text style={[styles.meta, { color: theme.muted }]}>{draft.length}/{charLimit}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>Draft preserved locally</Text>
          </View>
        </View>
        <View style={[styles.qualityPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
          <Text style={[styles.qualityTitle, { color: theme.text }]}>Before it joins an issue</Text>
          {qualityChecks.map((check) => (
            <View key={check.label} style={styles.qualityRow}>
              <Ionicons name={check.complete ? "checkmark-circle" : "ellipse-outline"} color={check.complete ? theme.success : theme.muted} size={18} />
              <Text style={[styles.meta, { color: check.complete ? theme.text : theme.muted }]}>{check.label}</Text>
            </View>
          ))}
        </View>
        {!!trimmedDraft && (
          <ContributionPreview
            type={draftType}
            body={trimmedDraft}
            theme={theme}
            guidance={contributionGuidance}
          />
        )}
        {latestContribution && (
          <ContributionConfirmation contribution={latestContribution} theme={theme} />
        )}
        {reviewContributions.length > 0 && (
          <InlineReviewPlacement
            contribution={reviewContributions[0]}
            selectedFeedId={selectedReviewFeedId ?? reviewContributions[0].feedId}
            placementFeeds={placementFeeds}
            theme={theme}
            onSelectFeed={setSelectedReviewFeedId}
            onPlace={() => {
              const feedId = selectedReviewFeedId ?? reviewContributions[0].feedId;
              onPlaceContribution(reviewContributions[0].id, feedId);
              setSubmittedContributionId(reviewContributions[0].id);
            }}
          />
        )}
        {submittedContributions.length > 0 && (
          <View style={[styles.reviewQueue, { borderColor: theme.line, backgroundColor: theme.panel }]}>
            <Text style={[styles.qualityTitle, { color: theme.text }]}>Recent contributions</Text>
            {submittedContributions.slice(0, 3).map((contribution) => (
              <SubmittedContributionRow key={contribution.id} contribution={contribution} theme={theme} />
            ))}
          </View>
        )}
        <View style={[styles.safetyPanel, { backgroundColor: theme.panelAlt, borderColor: theme.line }]}>
          <Ionicons name="shield-checkmark-outline" color={theme.success} size={22} />
          <Text style={[styles.body, { color: theme.muted }]}>Specific beats viral. Useful context helps people decide whether to save, reply, or move on.</Text>
        </View>
        <PrimaryButton label="Save to review queue" icon="send-outline" onPress={submit} theme={theme} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InlineReviewPlacement({
  contribution,
  selectedFeedId,
  placementFeeds,
  theme,
  onSelectFeed,
  onPlace
}: {
  contribution: SubmittedContribution;
  selectedFeedId: string;
  placementFeeds: ReturnType<typeof localDataService.getFeeds>;
  theme: AppTheme;
  onSelectFeed: (feedId: string) => void;
  onPlace: () => void;
}) {
  const selectedFeed = localDataService.getFeed(selectedFeedId);

  return (
    <View style={[styles.inlineReviewPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
      <View style={styles.inlineReviewTop}>
        <View style={[styles.guidanceIcon, { backgroundColor: palette.seafoam }]}>
          <Ionicons name="file-tray-full-outline" color={theme.text} size={18} />
        </View>
        <View style={styles.guidanceCopy}>
          <Text style={[styles.qualityTitle, { color: theme.text }]}>Place this signal now</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>Choose where it belongs before it joins the issue.</Text>
        </View>
      </View>
      <Text style={[styles.submittedBody, { color: theme.text }]} numberOfLines={3}>{contribution.body}</Text>
      <View style={styles.placementChips}>
        {placementFeeds.map((feed) => {
          const selected = selectedFeedId === feed.id;
          return (
            <Pressable
              key={feed.id}
              accessibilityRole="button"
              accessibilityLabel={`Place in ${feed.name}`}
              accessibilityState={{ selected }}
              onPress={() => onSelectFeed(feed.id)}
              style={({ pressed }) => [
                styles.placementChip,
                pressed && styles.contributionRowPressed,
                { borderColor: selected ? theme.accent : theme.line, backgroundColor: selected ? theme.panelAlt : "rgba(255, 255, 252, 0.62)" }
              ]}
            >
              <Text style={[styles.placementChipText, { color: selected ? theme.accent : theme.text }]}>{feed.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Place contribution in ${selectedFeed.name}`}
        onPress={onPlace}
        style={({ pressed }) => [styles.inlinePlaceButton, pressed && styles.contributionRowPressed, { backgroundColor: theme.accent }]}
      >
        <Ionicons name="checkmark-circle-outline" color="#FFFDF8" size={18} />
        <Text style={styles.inlinePlaceButtonText}>Place in {selectedFeed.name}</Text>
      </Pressable>
    </View>
  );
}

function getDefaultFeedId(type: string) {
  if (type === "Question" || type === "Discussion") return "black-tech";
  if (type === "Recommendation") return "atlanta";
  return "creative-community";
}

function ContributionPreview({ type, body, theme, guidance }: {
  type: string;
  body: string;
  theme: AppTheme;
  guidance: ReturnType<typeof getContributionGuidance>;
}) {
  return (
    <View style={[styles.previewCard, { borderColor: theme.line, backgroundColor: theme.panel }]}>
      <View style={styles.previewTop}>
        <View style={[styles.guidanceIcon, { backgroundColor: guidance.color }]}>
          <Ionicons name={guidance.icon} color={theme.text} size={18} />
        </View>
        <View style={styles.guidanceCopy}>
          <Text style={[styles.previewKicker, { color: theme.accent }]}>{type} preview</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>How this will read inside Weevrbird</Text>
        </View>
      </View>
      <Text style={[styles.previewBody, { color: theme.text }]}>{body}</Text>
      <View style={[styles.previewRule, { backgroundColor: theme.line }]} />
      <Text style={[styles.meta, { color: theme.muted }]}>Status after saving: ready to place</Text>
    </View>
  );
}

function ContributionConfirmation({ contribution, theme }: { contribution: SubmittedContribution; theme: AppTheme }) {
  const placed = contribution.status === "placed";

  return (
    <View style={[styles.confirmationPanel, { borderColor: "#CFE8DA", backgroundColor: theme.dark ? "rgba(214, 241, 229, 0.08)" : "#F2FBF6" }]}>
      <Ionicons name={placed ? "checkmark-done-circle-outline" : "checkmark-circle"} color={theme.success} size={22} />
      <View style={styles.guidanceCopy}>
        <Text style={[styles.qualityTitle, { color: theme.text }]}>{placed ? "Placed in an issue" : "Saved and ready to place"}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {placed ? `${contribution.type} / Marked for a future issue` : `${contribution.type} / Choose a Smartfeed below`}
        </Text>
      </View>
    </View>
  );
}

function SubmittedContributionRow({ contribution, theme }: { contribution: SubmittedContribution; theme: AppTheme }) {
  const savedAt = new Date(contribution.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const placed = contribution.status === "placed";

  return (
    <View style={[styles.submittedRow, { borderColor: theme.line, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.05)" : "rgba(255, 255, 252, 0.68)" }]}>
      <View style={styles.submittedTop}>
        <Text style={[styles.previewKicker, { color: theme.accent }]}>{contribution.type}</Text>
        <Text style={[styles.statusPill, { color: theme.success }]}>{placed ? "Placed" : "Review"}</Text>
      </View>
      <Text style={[styles.submittedBody, { color: theme.text }]} numberOfLines={2}>{contribution.body}</Text>
      <Text style={[styles.meta, { color: theme.muted }]}>{placed && contribution.placedAt ? `Placed ${new Date(contribution.placedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : `Saved ${savedAt}`}</Text>
    </View>
  );
}

function getContributionGuidance(type: string) {
  const guidance: Record<string, {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    title: string;
    body: string;
    placeholder: string;
  }> = {
    Note: {
      icon: "create-outline",
      color: palette.seafoam,
      title: "A quick signal",
      body: "Best for a short observation, update, or useful detail others can act on.",
      placeholder: "Share the detail that would help someone understand what changed..."
    },
    Question: {
      icon: "bulb-outline",
      color: palette.sky,
      title: "A question with context",
      body: "Ask something people can answer from experience, not just opinion.",
      placeholder: "What are you trying to understand, and what context would help people answer?"
    },
    Discussion: {
      icon: "chatbubbles-outline",
      color: "#FFE1D3",
      title: "A focused conversation",
      body: "Start with a clear tension, example, or decision people can respond to.",
      placeholder: "Name the situation, why it matters, and what kind of replies would be useful..."
    },
    Recommendation: {
      icon: "ribbon-outline",
      color: "#F5DFAE",
      title: "Saveable local knowledge",
      body: "Explain who it is for, when to go, and what makes it worth saving.",
      placeholder: "What should someone try, when should they go, and why is it worth keeping?"
    },
    Link: {
      icon: "link-outline",
      color: "#E7DAFF",
      title: "A link worth discussing",
      body: "Do not just drop the link. Add why it matters and who should read it.",
      placeholder: "Paste the link context: why this is worth reading and what question it raises..."
    },
    "Long Read": {
      icon: "newspaper-outline",
      color: palette.mint,
      title: "A deeper piece",
      body: "Use this when the context matters more than the reaction.",
      placeholder: "Write the fuller version: what happened, what you noticed, and what others can take from it..."
    }
  };

  return guidance[type] ?? guidance.Note;
}

function ContributionTypeRow({ type, selected, onPress, theme }: {
  type: string;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  const meta = contributionMeta[type];
  const rowColors = {
    Note: palette.seafoam,
    Question: palette.sky,
    Discussion: "#FFE1D3",
    Recommendation: "#F5DFAE",
    Link: "#E7DAFF",
    "Long Read": palette.mint
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose contribution type: ${type}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.contributionRow,
        pressed && styles.contributionRowPressed,
        { backgroundColor: selected ? theme.panelAlt : theme.panel, borderColor: selected ? theme.accent : theme.line }
      ]}
    >
      <View style={[styles.contributionIcon, { backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.08)" : rowColors[type as keyof typeof rowColors], borderColor: theme.line }]}>
        <Ionicons name={meta.icon} color={selected ? theme.accent : theme.text} size={18} />
      </View>
      <View style={styles.contributionCopy}>
        <Text style={[styles.contributionTitle, { color: theme.text }]}>{type}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{meta.helper}</Text>
      </View>
      {selected && <Ionicons name="checkmark-circle" color={theme.accent} size={18} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
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
  guidancePanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    ...shadows.card
  },
  guidanceIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center"
  },
  guidanceCopy: {
    flex: 1,
    gap: 3
  },
  guidanceTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Inter_700Bold"
  },
  contributionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  contributionRow: {
    width: "48%",
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.card
  },
  contributionRowPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  contributionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  contributionCopy: {
    flex: 1
  },
  contributionTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  editor: {
    minHeight: 290,
    borderWidth: 1,
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card
  },
  editorLabel: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  textInput: {
    minHeight: 230,
    textAlignVertical: "top",
    fontSize: 18,
    lineHeight: 27
  },
  editorFooter: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  qualityPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm
  },
  qualityTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  qualityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card
  },
  previewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  previewKicker: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  previewBody: {
    fontSize: 18,
    lineHeight: 27,
    fontFamily: "Inter_500Medium"
  },
  previewRule: {
    height: 1,
    width: "100%"
  },
  confirmationPanel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  reviewQueue: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm
  },
  inlineReviewPanel: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card
  },
  inlineReviewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  placementChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  placementChip: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  placementChipText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  inlinePlaceButton: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  inlinePlaceButtonText: {
    color: "#FFFDF8",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  submittedRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs
  },
  submittedTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  submittedBody: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold"
  },
  statusPill: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  safetyPanel: {
    borderWidth: 1,
    borderRadius: 22,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  }
});
