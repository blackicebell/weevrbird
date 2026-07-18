import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SectionHeader } from "../components/SectionHeader";
import {
  avatars,
  feedEditorialMeta,
  profileCollections,
  profileContributionTypes
} from "../app/editorial";
import { localDataService } from "../data/localDataService";
import { palette, radii, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem, SubmittedContribution } from "../types/product";

export function ProfileScreen({ theme, selectedAvatar, selectedInterests, submittedContributions, onPlaceContribution, onOpenContribute, onOpenDetail, onResetApp }: {
  theme: AppTheme;
  selectedAvatar: number;
  selectedInterests: string[];
  submittedContributions: SubmittedContribution[];
  onPlaceContribution: (contributionId: string, feedId: string) => void;
  onOpenContribute: () => void;
  onOpenDetail: (item: FeedItem) => void;
  onResetApp: () => void;
}) {
  const [following, setFollowing] = useState(false);
  const [activeShelf, setActiveShelf] = useState<(typeof profileCollections)[number] | null>(null);
  const [activeContribution, setActiveContribution] = useState<SubmittedContribution | null>(null);
  const [showAttentionEditor, setShowAttentionEditor] = useState(false);
  const [showShelfDraft, setShowShelfDraft] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const featuredContribution = localDataService.getFeaturedContribution();
  const questionContribution = localDataService.getQuestionContribution();
  const contributionTypes = getProfileContributionTypes(submittedContributions);
  const reviewContributionCount = submittedContributions.filter((contribution) => contribution.status === "review").length;

  if (activeShelf) {
    return (
      <ProfileShelfDetail
        collection={activeShelf}
        theme={theme}
        onBack={() => setActiveShelf(null)}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  if (activeContribution) {
    return (
      <SubmittedContributionDetail
        contribution={activeContribution}
        theme={theme}
        onBack={() => setActiveContribution(null)}
        onPlace={(feedId) => {
          onPlaceContribution(activeContribution.id, feedId);
          setActiveContribution({ ...activeContribution, feedId, status: "placed", placedAt: new Date().toISOString() });
        }}
      />
    );
  }

  if (showSafety) {
    return <ProfileSafetyPanel theme={theme} onBack={() => setShowSafety(false)} onResetApp={onResetApp} />;
  }

  if (showAttentionEditor) {
    return <AttentionMapEditor theme={theme} selectedInterests={selectedInterests} onBack={() => setShowAttentionEditor(false)} />;
  }

  if (showShelfDraft) {
    return <NewShelfPanel theme={theme} onBack={() => setShowShelfDraft(false)} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.profileMasthead, { backgroundColor: "#FFFDF8", borderColor: "#DDF0E4" }]}>
        <View style={styles.profileIdentityZone}>
          <View style={styles.profileMastheadTop}>
            <ProfileAvatar label={avatars[selectedAvatar]} index={selectedAvatar} theme={theme} />
            <View style={styles.profileIdentityCopy}>
              <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>ATTENTION MAP</Text>
              <Text style={[styles.profileName, { color: theme.text }]}>Quiet Architect</Text>
              <Text style={[styles.profileHandle, { color: theme.muted }]}>@quietarchitect / Atlanta</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={following ? "Unfollow Quiet Architect" : "Follow Quiet Architect"}
              accessibilityState={{ selected: following }}
              style={({ pressed }) => [styles.profileConnectButton, pressed && styles.profileButtonPressed, { backgroundColor: palette.deepForest }]}
              onPress={() => setFollowing((current) => !current)}
            >
              <Text style={styles.profileConnectText}>{following ? "Following" : "Follow"}</Text>
            </Pressable>
          </View>
        </View>
        <View style={[styles.profileMastheadDivider, { backgroundColor: "#DDF0E4" }]} />
        <Text style={[styles.profileIntroPrompt, { color: palette.deepForest }]}>Attention pattern</Text>
        <Text style={[styles.profileIntro, { color: theme.text }]}>
          Neighborhood design, independent bookstores, Black visual culture, and the places where people naturally gather.
        </Text>
        <View style={[styles.sharedContext, { borderColor: "#DDF0E4" }]}>
          <Ionicons name="link-outline" color={palette.deepForest} size={17} />
          <Text style={[styles.sharedContextText, { color: theme.muted }]}>Overlap: Atlanta, Black Tech, and UX Design.</Text>
        </View>
      </View>

      <ProfileChapter theme={theme} />

      <SectionHeader title="Attention Map" action="Edit" onAction={() => setShowAttentionEditor(true)} theme={theme} />
      <View style={styles.interestShelf}>
        {selectedInterests.concat(["Urbanism", "Independent Publishing"]).slice(0, 5).map((interest, index) => (
          <View key={`shelf-${interest}`} style={[styles.interestShelfItem, { backgroundColor: ["#DDF0E4", "#DCE9F8", "#F7DDCE", "#F2DBB6", "#E9DDBE"][index], borderColor: theme.line }]}>
            <Text style={[styles.interestShelfText, { color: theme.text }]}>{interest}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="From You" action={submittedContributions.length > 0 ? reviewContributionCount > 0 ? `${reviewContributionCount} private` : "Visible" : "Start"} onAction={onOpenContribute} theme={theme} />
      {submittedContributions.length > 0 ? (
        <View style={styles.fromYouStack}>
          {submittedContributions.slice(0, 3).map((contribution) => (
            <SubmittedContributionCard
              key={contribution.id}
              contribution={contribution}
              theme={theme}
              onOpen={() => setActiveContribution(contribution)}
            />
          ))}
        </View>
      ) : (
        <FromYouEmptyState theme={theme} onOpenContribute={onOpenContribute} />
      )}

      <SectionHeader title="From This Person" action="Archive" onAction={() => setActiveShelf(profileCollections[0])} theme={theme} />
      <ProfileContribution item={featuredContribution} label="Recommendation in Atlanta" theme={theme} onOpen={() => onOpenDetail(featuredContribution)} />
      <ProfileContribution item={questionContribution} label="Question in Black Tech" theme={theme} onOpen={() => onOpenDetail(questionContribution)} />

      <SectionHeader title="Shelves" action="New" onAction={() => setShowShelfDraft(true)} theme={theme} />
      {profileCollections.map((collection) => (
        <ProfileCollectionRow key={collection.title} collection={collection} theme={theme} onOpen={() => setActiveShelf(collection)} />
      ))}

      <SectionHeader title="Rhythm" theme={theme} />
      <View style={styles.profileTypeGrid}>
        {contributionTypes.map((type) => (
          <View key={type.label} style={[styles.profileTypeTile, { borderColor: theme.line, backgroundColor: "rgba(255, 255, 252, 0.58)" }]}>
            <Text style={[styles.profileTypeLabel, { color: theme.text }]}>{type.label}</Text>
            <Text style={[styles.profileTypeCount, { color: theme.muted }]}>{type.count} contributions</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Elsewhere" theme={theme} />
      <View style={[styles.elsewherePanel, { borderColor: theme.line }]}>
        <ExternalProfileLink icon="globe-outline" title="Personal site" domain="quietarchitect.studio" theme={theme} />
        <ExternalProfileLink icon="reader-outline" title="Newsletter" domain="fieldnotes.email" theme={theme} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open privacy and safety controls"
        style={({ pressed }) => [styles.profileOverflowAction, pressed && styles.profileButtonPressed]}
        onPress={() => setShowSafety(true)}
      >
        <Ionicons name="ellipsis-horizontal" color={theme.muted} size={20} />
        <Text style={[styles.profileOverflowText, { color: theme.muted }]}>Privacy and safety controls</Text>
      </Pressable>
    </ScrollView>
  );
}

function getProfileContributionTypes(submittedContributions: SubmittedContribution[]) {
  return profileContributionTypes.map((type) => {
    const localCount = submittedContributions.filter((contribution) => {
      if (type.label === "Notes") return contribution.type === "Note";
      if (type.label === "Questions") return contribution.type === "Question";
      if (type.label === "Recommendations") return contribution.type === "Recommendation";
      if (type.label === "Reading Lists") return contribution.type === "Link" || contribution.type === "Long Read";
      return false;
    }).length;

    return { ...type, count: type.count + localCount };
  });
}

function AttentionMapEditor({ theme, selectedInterests, onBack }: {
  theme: AppTheme;
  selectedInterests: string[];
  onBack: () => void;
}) {
  const editableInterests = selectedInterests.concat(["Urbanism", "Independent Publishing"]).slice(0, 5);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.shelfHero, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>EDIT ATTENTION MAP</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>Tune what this profile pays attention to.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>These topics help people understand what you notice, save, and contribute.</Text>
      </View>
      <View style={styles.attentionEditStack}>
        {editableInterests.map((interest, index) => (
          <View key={`edit-interest-${interest}`} style={[styles.attentionEditRow, { borderColor: theme.line, backgroundColor: theme.panel }]}>
            <View style={[styles.profileCollectionIcon, { backgroundColor: ["#DDF0E4", "#DCE9F8", "#F7DDCE", "#F2DBB6", "#E9DDBE"][index] }]} />
            <View style={styles.profileCollectionCopy}>
              <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{interest}</Text>
              <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>Visible on profile and used to explain overlap.</Text>
            </View>
            <Ionicons name="checkmark-circle-outline" color={theme.accent} size={19} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function NewShelfPanel({ theme, onBack }: { theme: AppTheme; onBack: () => void }) {
  const draftRows = [
    "Choose a shelf name",
    "Save three useful pieces",
    "Decide whether it is public"
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.shelfHero, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <View style={[styles.profileCollectionIcon, { backgroundColor: "#DDF0E4" }]}>
          <Ionicons name="albums-outline" color={palette.deepForest} size={20} />
        </View>
        <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>NEW SHELF</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>Start from a useful pattern.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>A shelf should feel like a return path, not a folder. Weevrbird will help group saved pieces when there is enough signal.</Text>
      </View>
      {draftRows.map((row, index) => (
        <View key={row} style={[styles.attentionEditRow, { borderColor: theme.line, backgroundColor: theme.panel }]}>
          <Text style={[styles.profileTypeLabel, { color: theme.accent }]}>{index + 1}</Text>
          <View style={styles.profileCollectionCopy}>
            <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{row}</Text>
            <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{getShelfDraftBody(index)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function getShelfDraftBody(index: number) {
  if (index === 0) return "Keep it specific enough that someone understands why the pieces belong together.";
  if (index === 1) return "A shelf becomes valuable once it holds more than one piece worth returning to.";
  return "Private-first keeps collections useful before they become performative.";
}

function ProfileAvatar({ label, index, theme }: { label: string; index: number; theme: AppTheme }) {
  const colors = [palette.sage, palette.indigo, palette.clay, palette.plum, palette.gold, "#3E6D75", "#866653", "#4E6251"];
  return (
    <View style={[styles.avatar, { backgroundColor: colors[index % colors.length], borderColor: theme.text }]}>
      <Text style={styles.avatarText}>{label}</Text>
    </View>
  );
}

function ProfileChapter({ theme }: { theme: AppTheme }) {
  return (
    <View style={[styles.profileChapter, { borderColor: theme.line }]}>
      <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>CURRENT CHAPTER</Text>
      <Text style={[styles.profileChapterTitle, { color: theme.text }]}>Designing for slower attention</Text>
      <Text style={[styles.meta, { color: theme.muted }]}>2026-present / Journal theme</Text>
      <Text style={[styles.profileChapterBody, { color: theme.muted }]}>
        A running thread about interfaces, neighborhoods, and attention rituals.
      </Text>
    </View>
  );
}

function ProfileContribution({ item, label, theme, onOpen }: { item: FeedItem; label: string; theme: AppTheme; onOpen: () => void }) {
  const feed = localDataService.getFeed(item.feedId);
  const editorial = feedEditorialMeta[feed.id] ?? feedEditorialMeta.atlanta;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.profileContribution, pressed && styles.profileRowPressed, { borderColor: editorial.secondary }]}
    >
      <Text style={[styles.moduleEyebrow, { color: editorial.accent }]}>{label}</Text>
      <Text style={[styles.profileContributionTitle, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.body, { color: theme.muted }]} numberOfLines={2}>{item.body ?? item.excerpt}</Text>
      <Text style={[styles.profileContributionSignal, { color: editorial.accent }]}>{getContributionSignal(item)}</Text>
      <Text style={[styles.meta, { color: theme.muted }]}>{editorial.masthead} / {item.publishedAt}</Text>
    </Pressable>
  );
}

function getContributionSignal(item: FeedItem) {
  if (item.itemType === "recommendation") {
    return "Useful because it gives timing, place, and local context.";
  }

  if (item.itemType === "discussion") {
    return "Useful because it invites practical answers, not hot takes.";
  }

  return "Useful because it adds a clear signal to the issue.";
}

function FromYouEmptyState({ theme, onOpenContribute }: { theme: AppTheme; onOpenContribute: () => void }) {
  return (
    <View style={[styles.fromYouEmpty, { borderColor: theme.line, backgroundColor: theme.panel }]}>
      <View style={[styles.profileCollectionIcon, { backgroundColor: "#DDF0E4" }]}>
        <Ionicons name="create-outline" color={palette.deepForest} size={19} />
      </View>
      <View style={styles.profileCollectionCopy}>
        <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>Add one useful signal</Text>
        <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>Save it privately first. Place it when you know which Smartfeed needs it.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Contribute"
        onPress={onOpenContribute}
        style={({ pressed }) => [styles.fromYouEmptyButton, pressed && styles.profileButtonPressed, { backgroundColor: theme.accent }]}
      >
        <Text style={styles.fromYouEmptyButtonText}>Contribute</Text>
      </Pressable>
    </View>
  );
}

function SubmittedContributionCard({ contribution, theme, onOpen }: {
  contribution: SubmittedContribution;
  theme: AppTheme;
  onOpen: () => void;
}) {
  const feed = localDataService.getFeed(contribution.feedId);
  const editorial = feedEditorialMeta[feed.id] ?? feedEditorialMeta.atlanta;
  const savedAt = formatContributionTime(contribution.createdAt);
  const placed = contribution.status === "placed";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open your ${contribution.type} contribution`}
      onPress={onOpen}
      style={({ pressed }) => [styles.submittedContributionCard, pressed && styles.profileRowPressed, { borderColor: editorial.secondary, backgroundColor: theme.panel }]}
    >
      <View style={styles.submittedContributionTop}>
        <Text style={[styles.moduleEyebrow, { color: editorial.accent }]}>{contribution.type} in {feed.name}</Text>
        <View style={[styles.reviewBadge, { borderColor: editorial.secondary, backgroundColor: `${editorial.secondary}88` }]}>
          <Text style={[styles.reviewBadgeText, { color: editorial.accent }]}>{placed ? "Placed" : "Private"}</Text>
        </View>
      </View>
      <Text style={[styles.submittedContributionBody, { color: theme.text }]} numberOfLines={3}>{contribution.body}</Text>
      <Text style={[styles.profileContributionSignal, { color: editorial.accent }]}>{placed ? `Visible in ${feed.name}.` : "Private until you choose a Smartfeed."}</Text>
      <Text style={[styles.meta, { color: theme.muted }]}>{placed && contribution.placedAt ? `Placed ${formatContributionTime(contribution.placedAt)}` : `Saved privately ${savedAt}`}</Text>
    </Pressable>
  );
}

function SubmittedContributionDetail({ contribution, theme, onBack, onPlace }: {
  contribution: SubmittedContribution;
  theme: AppTheme;
  onBack: () => void;
  onPlace: (feedId: string) => void;
}) {
  const [selectedFeedId, setSelectedFeedId] = useState(contribution.feedId);
  const feed = localDataService.getFeed(contribution.feedId);
  const selectedFeed = localDataService.getFeed(selectedFeedId);
  const editorial = feedEditorialMeta[feed.id] ?? feedEditorialMeta.atlanta;
  const selectedEditorial = feedEditorialMeta[selectedFeed.id] ?? feedEditorialMeta.atlanta;
  const placementFeeds = localDataService.getFeeds().filter((entry) => entry.joined).slice(0, 4);
  const placed = contribution.status === "placed";

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.submittedDetail, { borderColor: editorial.secondary, backgroundColor: editorial.paper }]}>
        <View style={styles.submittedContributionTop}>
          <Text style={[styles.moduleEyebrow, { color: editorial.accent }]}>{contribution.type} / {feed.name}</Text>
          <View style={[styles.reviewBadge, { borderColor: editorial.secondary, backgroundColor: `${editorial.secondary}88` }]}>
            <Text style={[styles.reviewBadgeText, { color: editorial.accent }]}>{placed ? "Placed" : "Private"}</Text>
          </View>
        </View>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>{placed ? "Your contribution is live." : "Choose where this belongs."}</Text>
        <Text style={[styles.submittedDetailBody, { color: theme.text }]}>{contribution.body}</Text>
        {!placed && (
          <View style={styles.placementPanel}>
            <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>Place in a Smartfeed</Text>
            <View style={styles.placementChips}>
              {placementFeeds.map((entry) => {
                const entryEditorial = feedEditorialMeta[entry.id] ?? feedEditorialMeta.atlanta;
                const selected = selectedFeedId === entry.id;

                return (
                  <Pressable
                    key={entry.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Place in ${entry.name}`}
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedFeedId(entry.id)}
                    style={({ pressed }) => [
                      styles.placementChip,
                      pressed && styles.profileRowPressed,
                      {
                        borderColor: selected ? entryEditorial.accent : theme.line,
                        backgroundColor: selected ? `${entryEditorial.secondary}AA` : "rgba(255, 255, 252, 0.62)"
                      }
                    ]}
                  >
                    <Text style={[styles.placementChipText, { color: selected ? entryEditorial.accent : theme.text }]}>{entry.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={[styles.placementPreview, { borderColor: selectedEditorial.secondary, backgroundColor: selectedEditorial.paper }]}>
              <Text style={[styles.moduleEyebrow, { color: selectedEditorial.accent }]}>{selectedFeed.name} preview</Text>
              <Text style={[styles.submittedContributionBody, { color: theme.text }]} numberOfLines={3}>{contribution.body}</Text>
              <Text style={[styles.profileContributionSignal, { color: selectedEditorial.accent }]}>This will become visible inside {selectedFeed.name}.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Place contribution in ${selectedFeed.name}`}
              onPress={() => onPlace(selectedFeedId)}
              style={({ pressed }) => [styles.placeButton, pressed && styles.profileButtonPressed, { backgroundColor: selectedEditorial.accent }]}
            >
              <Ionicons name="checkmark-circle-outline" color="#FFFDF8" size={18} />
              <Text style={styles.placeButtonText}>Place in {selectedFeed.name}</Text>
            </Pressable>
          </View>
        )}
        <View style={[styles.submittedStatusPanel, { borderColor: editorial.secondary, backgroundColor: theme.dark ? "rgba(245, 238, 228, 0.06)" : "rgba(255, 255, 252, 0.64)" }]}>
          <Ionicons name={placed ? "checkmark-circle-outline" : "time-outline"} color={editorial.accent} size={20} />
          <View style={styles.profileCollectionCopy}>
            <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{placed ? `Visible in ${feed.name}` : "Private for now"}</Text>
            <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{placed ? `You can now find it in the ${feed.name} Smartfeed.` : "Only you can see this until you choose a Smartfeed."}</Text>
          </View>
        </View>
        <Text style={[styles.meta, { color: theme.muted }]}>{placed && contribution.placedAt ? `Placed ${formatContributionTime(contribution.placedAt)}` : `Saved ${formatContributionTime(contribution.createdAt)}`}</Text>
      </View>
    </ScrollView>
  );
}

function formatContributionTime(createdAt: string) {
  return new Date(createdAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function ProfileCollectionRow({ collection, theme, onOpen }: {
  collection: { title: string; meta: string; description: string; icon: keyof typeof Ionicons.glyphMap };
  theme: AppTheme;
  onOpen: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open shelf ${collection.title}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.profileCollectionRow, pressed && styles.profileRowPressed, { borderColor: theme.line }]}
    >
      <View style={[styles.profileCollectionIcon, { backgroundColor: "#DDF0E4" }]}>
        <Ionicons name={collection.icon} color={palette.deepForest} size={19} />
      </View>
      <View style={styles.profileCollectionCopy}>
        <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{collection.title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{collection.meta}</Text>
        <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{collection.description}</Text>
      </View>
      <Ionicons name="arrow-forward" color={theme.muted} size={17} />
    </Pressable>
  );
}

function ProfileShelfDetail({ collection, theme, onBack, onOpenDetail }: {
  collection: (typeof profileCollections)[number];
  theme: AppTheme;
  onBack: () => void;
  onOpenDetail: (item: FeedItem) => void;
}) {
  const shelfItems = localDataService.getShelfItems(collection.title);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.shelfHero, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <View style={[styles.profileCollectionIcon, { backgroundColor: "#DDF0E4" }]}>
          <Ionicons name={collection.icon} color={palette.deepForest} size={20} />
        </View>
        <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>SHELF</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>{collection.title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{collection.description}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{collection.meta}</Text>
      </View>
      {shelfItems.map((item) => (
        <Pressable
          key={`shelf-item-${item.id}`}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.title}`}
          onPress={() => onOpenDetail(item)}
          style={({ pressed }) => [styles.shelfItem, pressed && styles.profileRowPressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
        >
          <Text style={[styles.moduleEyebrow, { color: theme.accent }]}>{item.sourceName ?? "Weevrbird"}</Text>
          <Text style={[styles.shelfItemTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>{item.publishedAt} / {item.replies} replies</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ProfileSafetyPanel({ theme, onBack, onResetApp }: { theme: AppTheme; onBack: () => void; onResetApp: () => void }) {
  const [acknowledgedControl, setAcknowledgedControl] = useState<string | null>(null);
  const controls = [
    { icon: "volume-mute-outline", title: "Mute profile", done: "Profile muted", body: "Hide this person's contributions without changing your public signal." },
    { icon: "person-remove-outline", title: "Unfollow quietly", done: "Unfollowed quietly", body: "Stop seeing new signal from this profile. They will not be notified." },
    { icon: "flag-outline", title: "Report concern", done: "Concern noted", body: "Send a moderation note if something feels unsafe, spammy, or out of place." }
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.safetyHero, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>PRIVACY AND SAFETY</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>Quiet controls for your attention.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>These actions are private. Weevrbird should give you control without turning safety into a performance.</Text>
      </View>
      {controls.map((control) => {
        const acknowledged = acknowledgedControl === control.title;
        const accent = control.title === "Report concern" ? palette.red : theme.accent;

        return (
          <Pressable
            key={control.title}
            accessibilityRole="button"
            accessibilityLabel={acknowledged ? control.done : control.title}
            accessibilityState={{ selected: acknowledged }}
            onPress={() => setAcknowledgedControl(control.title)}
            style={({ pressed }) => [
              styles.safetyRow,
              acknowledged && styles.safetyRowAcknowledged,
              pressed && styles.profileRowPressed,
              {
                borderColor: acknowledged ? `${accent}55` : theme.line,
                backgroundColor: acknowledged ? `${accent}10` : theme.panel
              }
            ]}
          >
            <Ionicons name={acknowledged ? "checkmark-circle-outline" : control.icon as keyof typeof Ionicons.glyphMap} color={accent} size={21} />
            <View style={styles.profileCollectionCopy}>
              <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{acknowledged ? control.done : control.title}</Text>
              <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{acknowledged ? getSafetyAcknowledgement(control.title) : control.body}</Text>
            </View>
            <Ionicons name={acknowledged ? "checkmark" : "chevron-forward"} color={acknowledged ? accent : theme.muted} size={17} />
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset Weevrbird"
        onPress={onResetApp}
        style={({ pressed }) => [styles.resetRow, pressed && styles.profileRowPressed, { borderColor: "rgba(158, 61, 52, 0.24)", backgroundColor: "rgba(158, 61, 52, 0.06)" }]}
      >
        <Ionicons name="refresh-circle-outline" color={palette.red} size={24} />
        <View style={styles.profileCollectionCopy}>
          <Text style={[styles.profileCollectionTitle, { color: palette.red }]}>Reset Weevrbird</Text>
          <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>Clear your local setup and return to the first onboarding screen.</Text>
        </View>
        <Ionicons name="chevron-forward" color={palette.red} size={17} />
      </Pressable>
    </ScrollView>
  );
}

function getSafetyAcknowledgement(title: string) {
  if (title === "Mute profile") return "Their signal will stay out of your issue unless you choose to bring it back.";
  if (title === "Unfollow quietly") return "You will stop seeing new signal from this profile. They will not be notified.";
  return "A private moderation note has been prepared for review.";
}

function BackButton({ label, theme, onPress }: { label: string; theme: AppTheme; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.profileBackButton}>
      <Ionicons name="chevron-back" color={theme.text} size={20} />
      <Text style={[styles.profileBackText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function ExternalProfileLink({ icon, title, domain, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  domain: string;
  theme: AppTheme;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={opened ? `${title} link ready` : `Open ${title}`}
      accessibilityState={{ selected: opened }}
      onPress={() => setOpened(true)}
      style={({ pressed }) => [styles.externalProfileLink, opened && styles.externalProfileLinkOpened, pressed && styles.profileRowPressed, { borderColor: opened ? `${theme.accent}44` : "transparent" }]}
    >
      <Ionicons name={opened ? "checkmark-circle-outline" : icon} color={opened ? theme.accent : theme.muted} size={17} />
      <View style={styles.externalProfileCopy}>
        <Text style={[styles.externalProfileTitle, { color: theme.text }]}>{opened ? `${title} ready` : title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{opened ? `External link: ${domain}` : domain}</Text>
      </View>
      <Ionicons name={opened ? "checkmark" : "open-outline"} color={opened ? theme.accent : theme.muted} size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 190,
    gap: 18
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#FFFDF8",
    fontSize: 24,
    fontWeight: "900"
  },
  moduleEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  profileMasthead: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft
  },
  profileIdentityZone: {
    gap: spacing.md
  },
  profileMastheadTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  profileMastheadDivider: {
    height: 1,
    opacity: 0.9
  },
  profileIdentityCopy: {
    flex: 1
  },
  profileName: {
    fontSize: 28,
    lineHeight: 31,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  profileHandle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_600SemiBold"
  },
  profileConnectButton: {
    minHeight: 34,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: spacing.xs
  },
  profileConnectText: {
    color: "#FFFDF8",
    fontSize: 12,
    fontFamily: "Inter_700Bold"
  },
  profileButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }]
  },
  profileIntroPrompt: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  profileIntro: {
    fontSize: 19,
    lineHeight: 27,
    fontFamily: "PlayfairDisplay_600SemiBold"
  },
  sharedContext: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center"
  },
  sharedContextText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_600SemiBold"
  },
  profileChapter: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: spacing.lg,
    gap: spacing.xs
  },
  profileChapterTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  profileChapterBody: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Inter_500Medium"
  },
  interestShelf: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  interestShelfItem: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  interestShelfText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  attentionEditStack: {
    gap: spacing.md
  },
  attentionEditRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card
  },
  profileContribution: {
    borderBottomWidth: 1,
    paddingVertical: spacing.lg,
    gap: spacing.sm
  },
  profileContributionTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  profileContributionSignal: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  fromYouStack: {
    gap: spacing.md
  },
  fromYouEmpty: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card
  },
  fromYouEmptyButton: {
    minHeight: 36,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  fromYouEmptyButtonText: {
    color: "#FFFDF8",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold"
  },
  submittedContributionCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card
  },
  submittedContributionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  submittedContributionBody: {
    fontSize: 18,
    lineHeight: 25,
    fontFamily: "Inter_600SemiBold"
  },
  reviewBadge: {
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  reviewBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  submittedDetail: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card
  },
  submittedDetailBody: {
    fontSize: 19,
    lineHeight: 29,
    fontFamily: "Inter_500Medium"
  },
  submittedStatusPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  placementPanel: {
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
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  placementChipText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  placementPreview: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm
  },
  placeButton: {
    minHeight: 44,
    borderRadius: radii.round,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  placeButtonText: {
    color: "#FFFDF8",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  profileRowPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  profileCollectionRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: "rgba(255, 255, 252, 0.58)"
  },
  profileCollectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center"
  },
  profileCollectionCopy: {
    flex: 1
  },
  profileCollectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  profileCollectionDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_500Medium"
  },
  profileTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  profileTypeTile: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: 2
  },
  profileTypeCount: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_600SemiBold"
  },
  profileTypeLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  elsewherePanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: "rgba(255, 255, 252, 0.48)"
  },
  externalProfileLink: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  externalProfileLinkOpened: {
    backgroundColor: "rgba(15, 61, 46, 0.04)"
  },
  externalProfileCopy: {
    flex: 1
  },
  externalProfileTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  profileOverflowAction: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingBottom: spacing.xl
  },
  profileOverflowText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_600SemiBold"
  },
  profileBackButton: {
    minHeight: 42,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  profileBackText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  shelfHero: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card
  },
  shelfTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  shelfItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.sm
  },
  shelfItemTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  safetyHero: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card
  },
  safetyRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  safetyRowAcknowledged: {
    shadowColor: "#0F3D2E",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1
  },
  resetRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  }
});
