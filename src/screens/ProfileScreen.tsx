import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ProfileMark } from "../components/ProfileMark";
import { SectionHeader } from "../components/SectionHeader";
import { EmailLinkGate } from "../components/EmailLinkGate";
import {
  feedEditorialMeta,
  profileCollections,
  profileContributionTypes
} from "../app/editorial";
import { AuthStatus } from "../app/appState";
import { releaseInfo } from "../app/release";
import { localDataService } from "../data/localDataService";
import { palette, radii, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem, SubmittedContribution } from "../types/product";
import { formatFeedItemType } from "../utils/feedItemLabels";

export function ProfileScreen({ theme, selectedAvatar, profileName, profileHandle, profileBio, authStatus, accountEmail, selectedCity, connectionCount, selectedInterests, submittedContributions, onRequestEmailLink, onCompleteEmailSignIn, onSignOut, onPlaceContribution, onOpenContribute, onOpenDetail, onResetApp }: {
  theme: AppTheme;
  selectedAvatar: number;
  profileName: string;
  profileHandle: string;
  profileBio: string;
  authStatus: AuthStatus;
  accountEmail: string;
  selectedCity: string;
  connectionCount: number;
  selectedInterests: string[];
  submittedContributions: SubmittedContribution[];
  onRequestEmailLink: (email: string, penName?: string) => void;
  onCompleteEmailSignIn: () => void;
  onSignOut: () => void;
  onPlaceContribution: (contributionId: string, feedId: string) => void;
  onOpenContribute: () => void;
  onOpenDetail: (item: FeedItem) => void;
  onResetApp: () => void;
}) {
  const [activeShelf, setActiveShelf] = useState<(typeof profileCollections)[number] | null>(null);
  const [activeContribution, setActiveContribution] = useState<SubmittedContribution | null>(null);
  const [showAttentionEditor, setShowAttentionEditor] = useState(false);
  const [showShelfDraft, setShowShelfDraft] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showContributionBrowser, setShowContributionBrowser] = useState(false);
  const featuredContribution = localDataService.getFeaturedContribution();
  const questionContribution = localDataService.getQuestionContribution();
  const publicContributions = [featuredContribution, questionContribution];
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
    return (
      <ProfileSafetyPanel
        theme={theme}
        authStatus={authStatus}
        accountEmail={accountEmail}
        onBack={() => setShowSafety(false)}
        onSignOut={onSignOut}
        onResetApp={onResetApp}
      />
    );
  }

  if (showContributionBrowser) {
    return (
      <ProfileContributionBrowser
        theme={theme}
        submittedContributions={submittedContributions}
        publicContributions={publicContributions}
        onBack={() => setShowContributionBrowser(false)}
        onOpenSubmitted={setActiveContribution}
        onOpenPublic={onOpenDetail}
      />
    );
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
            <ProfileMark index={selectedAvatar} size={58} selected />
            <View style={styles.profileIdentityCopy}>
              <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>ATTENTION MAP</Text>
              <Text style={[styles.profileName, { color: theme.text }]}>{profileName}</Text>
              <Text style={[styles.profileHandle, { color: theme.muted }]}>@{profileHandle} / {selectedCity}</Text>
            </View>
            <View style={[styles.ownProfileBadge, { backgroundColor: "#DDF0E4" }]}>
              <Text style={[styles.ownProfileBadgeText, { color: palette.deepForest }]}>You</Text>
            </View>
          </View>
        </View>
        <View style={[styles.profileMastheadDivider, { backgroundColor: "#DDF0E4" }]} />
        <Text style={[styles.profileIntroPrompt, { color: palette.deepForest }]}>Attention pattern</Text>
        <Text style={[styles.profileIntro, { color: theme.text }]}>
          {profileBio}
        </Text>
        <View style={[styles.sharedContext, { borderColor: "#DDF0E4" }]}>
          <Ionicons name="link-outline" color={palette.deepForest} size={17} />
          <Text style={[styles.sharedContextText, { color: theme.muted }]}>Overlap: {selectedInterests.slice(0, 3).join(", ")}.</Text>
        </View>
        <View style={[styles.privateProfileStats, { borderColor: "#DDF0E4", backgroundColor: "rgba(221, 240, 228, 0.38)" }]}>
          <View style={styles.privateStatItem}>
            <Text style={[styles.privateStatValue, { color: theme.text }]}>{connectionCount}</Text>
            <Text style={[styles.privateStatLabel, { color: theme.muted }]}>Connection{connectionCount === 1 ? "" : "s"}</Text>
          </View>
          <View style={styles.privateStatCopy}>
            <Text style={[styles.privateStatTitle, { color: palette.deepForest }]}>Visible only to you</Text>
            <Text style={[styles.privateStatBody, { color: theme.muted }]}>Connections help you track who you have linked with without turning your profile into a scoreboard.</Text>
          </View>
        </View>
      </View>

      <SectionHeader title="Account" action={authStatus === "signed_in" ? "Signed in" : "Email link"} theme={theme} />
      <EmailLinkGate
        theme={theme}
        authStatus={authStatus}
        accountEmail={accountEmail}
        profileName={profileName}
        compact
        onRequestLink={onRequestEmailLink}
        onCompleteSignIn={onCompleteEmailSignIn}
        onSignOut={onSignOut}
      />

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

      <SectionHeader title="From This Person" action="Browse" onAction={() => setShowContributionBrowser(true)} theme={theme} />
      <ProfileContribution item={featuredContribution} label="Recommendation in Atlanta" theme={theme} onOpen={() => onOpenDetail(featuredContribution)} />
      <ProfileContribution item={questionContribution} label="Question in Tech" theme={theme} onOpen={() => onOpenDetail(questionContribution)} />

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
        <ExternalProfileLink icon="globe-outline" title="Personal site" domain={`${profileHandle}.studio`} theme={theme} />
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

function ProfileContributionBrowser({ theme, submittedContributions, publicContributions, onBack, onOpenSubmitted, onOpenPublic }: {
  theme: AppTheme;
  submittedContributions: SubmittedContribution[];
  publicContributions: FeedItem[];
  onBack: () => void;
  onOpenSubmitted: (contribution: SubmittedContribution) => void;
  onOpenPublic: (item: FeedItem) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const contributionCategories = getBrowserContributionCategories(submittedContributions, publicContributions);
  const filteredSubmittedContributions = submittedContributions.filter((contribution) => contributionMatchesCategory(contribution.type, activeCategory));
  const filteredPublicContributions = publicContributions.filter((item) => publicContributionMatchesCategory(item, activeCategory));

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.shelfHero, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>BROWSE CONTRIBUTIONS</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>Contributions by topic and community.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Start by type, then open the pieces that match what you are curious about.</Text>
      </View>

      <SectionHeader title="Browse by Type" theme={theme} />
      <View style={styles.profileTypeGrid}>
        {contributionCategories.map((category) => {
          const selected = activeCategory === category.label;

          return (
            <Pressable
              key={`browse-category-${category.label}`}
              accessibilityRole="button"
              accessibilityLabel={`Show ${category.label.toLowerCase()} contributions`}
              accessibilityState={{ selected }}
              onPress={() => setActiveCategory(category.label)}
              style={({ pressed }) => [
                styles.profileTypeTile,
                pressed && styles.profileRowPressed,
                {
                  borderColor: selected ? theme.accent : theme.line,
                  backgroundColor: selected ? theme.panelAlt : "rgba(255, 255, 252, 0.58)"
                }
              ]}
            >
              <Text style={[styles.profileTypeLabel, { color: theme.text }]}>{category.label}</Text>
              <Text style={[styles.profileTypeCount, { color: theme.muted }]}>{category.count} contribution{category.count === 1 ? "" : "s"}</Text>
            </Pressable>
          );
        })}
      </View>

      {filteredSubmittedContributions.length > 0 && (
        <>
          <SectionHeader title="From You" theme={theme} />
          <View style={styles.fromYouStack}>
            {filteredSubmittedContributions.map((contribution) => (
              <SubmittedContributionCard
                key={`browse-submitted-${contribution.id}`}
                contribution={contribution}
                theme={theme}
                onOpen={() => onOpenSubmitted(contribution)}
              />
            ))}
          </View>
        </>
      )}

      <SectionHeader title="Public Contributions" theme={theme} />
      {filteredPublicContributions.map((item) => (
        <ProfileContribution
          key={`browse-public-${item.id}`}
          item={item}
          label={`${formatContributionLabel(item)} in ${localDataService.getFeed(item.feedId).name}`}
          theme={theme}
          onOpen={() => onOpenPublic(item)}
        />
      ))}
    </ScrollView>
  );
}

function getBrowserContributionCategories(submittedContributions: SubmittedContribution[], publicContributions: FeedItem[]) {
  const counts = new Map<string, number>();

  submittedContributions.forEach((contribution) => {
    const category = getSubmittedContributionCategory(contribution.type);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  });

  publicContributions.forEach((item) => {
    const category = getPublicContributionCategory(item);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  });

  const categories = ["Questions", "Recommendations", "Notes", "Reading Lists"]
    .map((label) => ({ label, count: counts.get(label) ?? 0 }))
    .filter((category) => category.count > 0);

  return [{ label: "All", count: submittedContributions.length + publicContributions.length }].concat(categories);
}

function contributionMatchesCategory(type: string, activeCategory: string) {
  if (activeCategory === "All") return true;
  return getSubmittedContributionCategory(type) === activeCategory;
}

function publicContributionMatchesCategory(item: FeedItem, activeCategory: string) {
  if (activeCategory === "All") return true;
  return getPublicContributionCategory(item) === activeCategory;
}

function getSubmittedContributionCategory(type: string) {
  if (type === "Question" || type === "Discussion") return "Questions";
  if (type === "Recommendation") return "Recommendations";
  if (type === "Link" || type === "Long Read") return "Reading Lists";
  return "Notes";
}

function getPublicContributionCategory(item: FeedItem) {
  if (item.itemType === "recommendation") return "Recommendations";
  if (item.itemType === "question" || item.itemType === "discussion") return "Questions";
  if (item.itemType === "link" || item.itemType === "long_read" || item.itemType === "external_article" || item.itemType === "external_video" || item.itemType === "external_podcast") return "Reading Lists";
  if (item.itemType === "official_update") return "Notes";
  return "Notes";
}

function formatContributionLabel(item: FeedItem) {
  return formatFeedItemType(item.itemType);
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
  const starterItems = localDataService.searchLibrary("").slice(0, 4);
  const [shelfName, setShelfName] = useState("Places and reads worth returning to");
  const [visibility, setVisibility] = useState<"Private" | "Public">("Private");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(starterItems.slice(0, 2).map((item) => item.id));
  const [savedDraft, setSavedDraft] = useState(false);
  const trimmedName = shelfName.trim();
  const canSave = trimmedName.length >= 3 && selectedItemIds.length > 0;

  const toggleStarterItem = (itemId: string) => {
    setSavedDraft(false);
    setSelectedItemIds((current) => (
      current.includes(itemId) ? current.filter((id) => id !== itemId) : current.concat(itemId)
    ));
  };

  const saveShelfDraft = () => {
    if (!canSave) return;
    setSavedDraft(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.shelfHero, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <View style={[styles.profileCollectionIcon, { backgroundColor: "#DDF0E4" }]}>
          <Ionicons name="albums-outline" color={palette.deepForest} size={20} />
        </View>
        <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>NEW SHELF</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>Start from a useful pattern.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>A shelf is a return path. Name the pattern, choose a few starting pieces, then decide whether it stays private.</Text>
      </View>

      <View style={[styles.shelfDraftPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <Text style={[styles.moduleEyebrow, { color: theme.accent }]}>SHELF NAME</Text>
        <TextInput
          accessibilityLabel="Shelf name"
          value={shelfName}
          onChangeText={(value) => {
            setSavedDraft(false);
            setShelfName(value.slice(0, 52));
          }}
          placeholder="Name this shelf"
          placeholderTextColor={theme.muted}
          style={[styles.shelfNameInput, { borderColor: theme.line, color: theme.text, backgroundColor: theme.bg }]}
        />

        <Text style={[styles.moduleEyebrow, { color: theme.accent }]}>VISIBILITY</Text>
        <View style={styles.shelfVisibilityRow}>
          {(["Private", "Public"] as const).map((option) => {
            const selected = visibility === option;

            return (
              <Pressable
                key={`shelf-visibility-${option}`}
                accessibilityRole="button"
                accessibilityLabel={`Make shelf ${option.toLowerCase()}`}
                accessibilityState={{ selected }}
                onPress={() => {
                  setSavedDraft(false);
                  setVisibility(option);
                }}
                style={({ pressed }) => [
                  styles.shelfVisibilityButton,
                  pressed && styles.profileRowPressed,
                  {
                    borderColor: selected ? theme.accent : theme.line,
                    backgroundColor: selected ? theme.panelAlt : theme.panel
                  }
                ]}
              >
                <Ionicons name={selected ? "checkmark-circle" : option === "Private" ? "lock-closed-outline" : "globe-outline"} color={selected ? theme.accent : theme.muted} size={18} />
                <Text style={[styles.shelfVisibilityText, { color: selected ? theme.accent : theme.text }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.moduleEyebrow, { color: theme.accent }]}>STARTING PIECES</Text>
        <View style={styles.shelfStarterStack}>
          {starterItems.map((item) => {
            const selected = selectedItemIds.includes(item.id);
            const itemTitle = item.title ?? "Untitled piece";

            return (
              <Pressable
                key={`starter-shelf-item-${item.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${selected ? "Remove" : "Add"} ${itemTitle}`}
                accessibilityState={{ selected }}
                onPress={() => toggleStarterItem(item.id)}
                style={({ pressed }) => [
                  styles.shelfStarterItem,
                  pressed && styles.profileRowPressed,
                  {
                    borderColor: selected ? `${theme.accent}66` : theme.line,
                    backgroundColor: selected ? theme.panelAlt : theme.bg
                  }
                ]}
              >
                <Ionicons name={selected ? "checkmark-circle" : "add-circle-outline"} color={selected ? theme.accent : theme.muted} size={19} />
                <View style={styles.profileCollectionCopy}>
                  <Text style={[styles.profileCollectionTitle, { color: theme.text }]} numberOfLines={2}>{itemTitle}</Text>
                  <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{localDataService.getFeed(item.feedId).name} / {formatFeedItemType(item.itemType)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={savedDraft ? "Shelf draft saved" : "Save shelf draft"}
          accessibilityState={{ disabled: !canSave, selected: savedDraft }}
          disabled={!canSave}
          onPress={saveShelfDraft}
          style={({ pressed }) => [
            styles.shelfSaveButton,
            pressed && canSave && styles.profileButtonPressed,
            !canSave && styles.shelfSaveButtonDisabled,
            { backgroundColor: canSave ? theme.accent : theme.line }
          ]}
        >
          <Ionicons name={savedDraft ? "checkmark-circle-outline" : "albums-outline"} color="#FFFDF8" size={18} />
          <Text style={styles.shelfSaveButtonText}>{savedDraft ? "Shelf draft saved" : "Save shelf draft"}</Text>
        </Pressable>

        <Text style={[styles.profileCollectionDescription, { color: savedDraft ? theme.accent : theme.muted }]}>
          {savedDraft
            ? `${trimmedName} is saved as a ${visibility.toLowerCase()} shelf draft with ${selectedItemIds.length} starting piece${selectedItemIds.length === 1 ? "" : "s"}.`
            : canSave
              ? `${selectedItemIds.length} starting piece${selectedItemIds.length === 1 ? "" : "s"} selected.`
              : "Add a shelf name and at least one piece."}
        </Text>
      </View>
    </ScrollView>
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
  const itemTitle = item.title ?? "this piece";
  const itemSummary = item.body ?? item.excerpt ?? "A useful piece saved into this profile context.";
  const publishedLabel = item.publishedAt || "Recent";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${itemTitle}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.profileContribution, pressed && styles.profileRowPressed, { borderColor: editorial.secondary }]}
    >
      <Text style={[styles.moduleEyebrow, { color: editorial.accent }]}>{label}</Text>
      <Text style={[styles.profileContributionTitle, { color: theme.text }]}>{itemTitle}</Text>
      <Text style={[styles.body, { color: theme.muted }]} numberOfLines={2}>{itemSummary}</Text>
      <Text style={[styles.profileContributionSignal, { color: editorial.accent }]}>{getContributionSignal(item)}</Text>
      <Text style={[styles.meta, { color: theme.muted }]}>{editorial.masthead} / {publishedLabel}</Text>
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

  return "Useful because it adds a clear piece to the issue.";
}

function FromYouEmptyState({ theme, onOpenContribute }: { theme: AppTheme; onOpenContribute: () => void }) {
  return (
    <View style={[styles.fromYouEmpty, { borderColor: theme.line, backgroundColor: theme.panel }]}>
      <View style={[styles.profileCollectionIcon, { backgroundColor: "#DDF0E4" }]}>
        <Ionicons name="create-outline" color={palette.deepForest} size={19} />
      </View>
      <View style={styles.profileCollectionCopy}>
        <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>Add one useful contribution</Text>
        <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>Save it privately first. Make it visible when you know which Smartfeed needs it.</Text>
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
            <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>Choose a Smartfeed</Text>
            <View style={styles.placementChips}>
              {placementFeeds.map((entry) => {
                const entryEditorial = feedEditorialMeta[entry.id] ?? feedEditorialMeta.atlanta;
                const selected = selectedFeedId === entry.id;

                return (
                  <Pressable
                    key={entry.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${entry.name} for this contribution`}
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
              accessibilityLabel={`Make contribution visible in ${selectedFeed.name}`}
              onPress={() => onPlace(selectedFeedId)}
              style={({ pressed }) => [styles.placeButton, pressed && styles.profileButtonPressed, { backgroundColor: selectedEditorial.accent }]}
            >
              <Ionicons name="checkmark-circle-outline" color="#FFFDF8" size={18} />
              <Text style={styles.placeButtonText}>Make visible</Text>
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
      {shelfItems.map((item) => {
        const itemTitle = item.title ?? "this piece";
        const publishedLabel = item.publishedAt || "Recent";
        const replyCount = Number.isFinite(item.replies) ? item.replies : 0;
        const replyLabel = replyCount === 1 ? "1 reply" : `${replyCount} replies`;

        return (
          <Pressable
            key={`shelf-item-${item.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Open ${itemTitle}`}
            onPress={() => onOpenDetail(item)}
            style={({ pressed }) => [styles.shelfItem, pressed && styles.profileRowPressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
          >
            <Text style={[styles.moduleEyebrow, { color: theme.accent }]}>{item.sourceName ?? "Weevrbird pick"}</Text>
            <Text style={[styles.shelfItemTitle, { color: theme.text }]}>{itemTitle}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{publishedLabel} / {replyLabel}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ProfileSafetyPanel({ theme, authStatus, accountEmail, onBack, onSignOut, onResetApp }: {
  theme: AppTheme;
  authStatus: AuthStatus;
  accountEmail: string;
  onBack: () => void;
  onSignOut: () => void;
  onResetApp: () => void;
}) {
  const [acknowledgedControl, setAcknowledgedControl] = useState<string | null>(null);
  const [discoverableThroughContributions, setDiscoverableThroughContributions] = useState(true);
  const [showPeopleSuggestions, setShowPeopleSuggestions] = useState(true);
  const [showMutualLinks, setShowMutualLinks] = useState(false);
  const [connectRequestScope, setConnectRequestScope] = useState("Shared interests");
  const [resetArmed, setResetArmed] = useState(false);
  const [supportStatus, setSupportStatus] = useState<"idle" | "copied" | "unavailable">("idle");
  const [deleteRequestStatus, setDeleteRequestStatus] = useState<"idle" | "copied" | "unavailable">("idle");
  const [privacySummaryStatus, setPrivacySummaryStatus] = useState<"idle" | "copied" | "unavailable">("idle");
  const [signedOutHere, setSignedOutHere] = useState(false);
  const controls = [
    { icon: "volume-mute-outline", title: "Mute profile", done: "Profile muted", body: "Hide this person's contributions without changing what others see from you." },
    { icon: "person-remove-outline", title: "Disconnect profile", done: "Profile disconnected", body: "Remove the mutual link and stop seeing new contributions from this profile. They will not be notified." },
    { icon: "flag-outline", title: "Report concern", done: "Concern noted", body: "Send a moderation note if something feels unsafe, spammy, or out of place." }
  ];
  const signedIn = authStatus === "signed_in";
  const supportEmail = releaseInfo.supportEmail;

  const copySupportEmail = async () => {
    try {
      await Clipboard.setStringAsync([
        `Support: ${supportEmail}`,
        `App: Weevrbird ${releaseInfo.version}`,
        `iOS build: ${releaseInfo.iosBuildNumber}`,
        `Android code: ${releaseInfo.androidVersionCode}`,
        accountEmail ? `Account: ${accountEmail}` : "Account: not linked"
      ].join("\n"));
      setSupportStatus("copied");
    } catch {
      setSupportStatus("unavailable");
    }
  };

  const handleSignOut = () => {
    onSignOut();
    setSignedOutHere(true);
  };

  const copyDeletionRequest = async () => {
    try {
      await Clipboard.setStringAsync([
        "I want to delete my Weevrbird account data.",
        `Account: ${accountEmail || "not linked"}`,
        `App: Weevrbird ${releaseInfo.version}`,
        `iOS build: ${releaseInfo.iosBuildNumber}`,
        `Android code: ${releaseInfo.androidVersionCode}`,
        `Support: ${supportEmail}`
      ].join("\n"));
      setDeleteRequestStatus("copied");
    } catch {
      setDeleteRequestStatus("unavailable");
    }
  };

  const copyPrivacySummary = async () => {
    try {
      await Clipboard.setStringAsync([
        "Weevrbird privacy summary",
        `App: Weevrbird ${releaseInfo.version}`,
        "This build stores onboarding, interests, saved pieces, opened history, contribution drafts, profile setup, and private connection count on this device.",
        "Location preference is broad only. The app does not request precise GPS location in this build.",
        "The app uses local bird profile marks and does not upload user photos, videos, or custom avatar images in this build.",
        "Email identity is used for contribution/profile identity once linked."
      ].join("\n"));
      setPrivacySummaryStatus("copied");
    } catch {
      setPrivacySummaryStatus("unavailable");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.safetyHero, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>PRIVACY AND SAFETY</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>Privacy controls for your attention.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>These actions are private. Weevrbird should give you control without turning safety into a performance.</Text>
      </View>
      <SectionHeader title="Data and Account" action={signedIn ? "Email linked" : "Local only"} theme={theme} />
      <View style={[styles.dataAccountPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <View style={styles.dataFactRow}>
          <Ionicons name="phone-portrait-outline" color={theme.accent} size={20} />
          <View style={styles.profileCollectionCopy}>
            <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>Saved on this device</Text>
            <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>Onboarding, interests, library saves, reading history, drafts, and profile setup are kept locally in this build.</Text>
          </View>
        </View>
        <View style={styles.dataFactRow}>
          <Ionicons name={signedIn ? "mail-open-outline" : "mail-outline"} color={theme.accent} size={20} />
          <View style={styles.profileCollectionCopy}>
            <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{signedIn ? accountEmail : "No email linked"}</Text>
            <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{signedIn ? "Your email protects contribution identity. Cross-device sync still needs production backend support." : "Reading still works. Link email before public contributions or profile recovery."}</Text>
          </View>
        </View>
      </View>
      <AccountActionRow
        icon={supportStatus === "copied" ? "checkmark-circle-outline" : supportStatus === "unavailable" ? "alert-circle-outline" : "help-circle-outline"}
        title={supportStatus === "copied" ? "Support details copied" : "Copy support details"}
        body={supportStatus === "unavailable" ? "Could not copy support details. Try again after checking clipboard access." : `${supportEmail} / includes app version and build.`}
        accent={supportStatus === "unavailable" ? palette.red : theme.accent}
        theme={theme}
        onPress={() => { void copySupportEmail(); }}
      />
      <AccountActionRow
        icon={privacySummaryStatus === "copied" ? "checkmark-circle-outline" : privacySummaryStatus === "unavailable" ? "alert-circle-outline" : "document-text-outline"}
        title={privacySummaryStatus === "copied" ? "Privacy summary copied" : "Copy privacy summary"}
        body={privacySummaryStatus === "unavailable" ? "Could not copy the privacy summary. Try again after checking clipboard access." : "Copies a plain-language summary of what this build stores and does not collect."}
        accent={privacySummaryStatus === "unavailable" ? palette.red : theme.accent}
        theme={theme}
        onPress={() => { void copyPrivacySummary(); }}
      />
      <AccountActionRow
        icon={deleteRequestStatus === "copied" ? "checkmark-circle-outline" : deleteRequestStatus === "unavailable" ? "alert-circle-outline" : "trash-outline"}
        title={deleteRequestStatus === "copied" ? "Deletion request copied" : "Copy deletion request"}
        body={deleteRequestStatus === "unavailable" ? "Could not copy the deletion request. Try again after checking clipboard access." : "Copies a support request with account and build details. This does not clear local device state."}
        accent={palette.red}
        theme={theme}
        onPress={() => { void copyDeletionRequest(); }}
      />
      {signedIn && (
        <AccountActionRow
          icon={signedOutHere ? "checkmark-circle-outline" : "log-out-outline"}
          title={signedOutHere ? "Signed out on this device" : "Sign out"}
          body={signedOutHere ? "Your local saved items and preferences remain on this device." : "Disconnect the email identity from this device while keeping local reading state."}
          accent={theme.accent}
          theme={theme}
          onPress={handleSignOut}
        />
      )}
      <View style={[styles.releaseInfoPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <Ionicons name="information-circle-outline" color={theme.accent} size={18} />
        <View style={styles.profileCollectionCopy}>
          <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>App version</Text>
          <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>
            Weevrbird {releaseInfo.version} / iOS build {releaseInfo.iosBuildNumber} / Android code {releaseInfo.androidVersionCode}
          </Text>
        </View>
      </View>

      <SectionHeader title="Discovery Controls" theme={theme} />
      <View style={[styles.discoveryControlsPanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <DiscoveryToggleRow
          icon="newspaper-outline"
          title="Discover me through public contributions"
          body="Your public notes, questions, and recommendations can help people understand your perspective."
          enabled={discoverableThroughContributions}
          onToggle={() => setDiscoverableThroughContributions((current) => !current)}
          theme={theme}
        />
        <DiscoveryToggleRow
          icon="people-outline"
          title="Show me people through shared interests"
          body="Weevrbird may surface people when their contributions overlap with your Attention Map."
          enabled={showPeopleSuggestions}
          onToggle={() => setShowPeopleSuggestions((current) => !current)}
          theme={theme}
        />
        <DiscoveryToggleRow
          icon="link-outline"
          title="Show mutual Links"
          body="Let profile previews mention mutual Links when that context is available."
          enabled={showMutualLinks}
          onToggle={() => setShowMutualLinks((current) => !current)}
          theme={theme}
        />
      </View>

      <SectionHeader title="Connect Requests" action={connectRequestScope} theme={theme} />
      <View style={styles.connectRequestGrid}>
        {["Everyone", "Shared interests", "Mutual Links", "Nobody"].map((option) => {
          const selected = option === connectRequestScope;

          return (
            <Pressable
              key={`connect-scope-${option}`}
              accessibilityRole="button"
              accessibilityLabel={`Allow connect requests from ${option}`}
              accessibilityState={{ selected }}
              onPress={() => setConnectRequestScope(option)}
              style={({ pressed }) => [
                styles.connectRequestOption,
                pressed && styles.profileRowPressed,
                {
                  borderColor: selected ? theme.accent : theme.line,
                  backgroundColor: selected ? theme.panelAlt : theme.panel
                }
              ]}
            >
              <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} color={selected ? theme.accent : theme.muted} size={18} />
              <Text style={[styles.connectRequestOptionText, { color: selected ? theme.accent : theme.text }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Safety" theme={theme} />
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
        accessibilityLabel={resetArmed ? "Confirm reset Weevrbird" : "Reset Weevrbird"}
        accessibilityState={{ selected: resetArmed }}
        onPress={() => {
          if (!resetArmed) {
            setResetArmed(true);
            return;
          }

          onResetApp();
        }}
        style={({ pressed }) => [styles.resetRow, pressed && styles.profileRowPressed, { borderColor: "rgba(158, 61, 52, 0.24)", backgroundColor: "rgba(158, 61, 52, 0.06)" }]}
      >
        <Ionicons name={resetArmed ? "warning-outline" : "refresh-circle-outline"} color={palette.red} size={24} />
        <View style={styles.profileCollectionCopy}>
          <Text style={[styles.profileCollectionTitle, { color: palette.red }]}>{resetArmed ? "Tap again to reset" : "Reset Weevrbird"}</Text>
          <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>
            {resetArmed ? "This clears your local profile, saved items, and contribution drafts on this device." : "Clear your local setup and return to the first onboarding screen."}
          </Text>
        </View>
        <Ionicons name={resetArmed ? "checkmark-circle-outline" : "chevron-forward"} color={palette.red} size={17} />
      </Pressable>
    </ScrollView>
  );
}

function DiscoveryToggleRow({ icon, title, body, enabled, onToggle, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  enabled: boolean;
  onToggle: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: enabled }}
      onPress={onToggle}
      style={({ pressed }) => [styles.discoveryToggleRow, pressed && styles.profileRowPressed]}
    >
      <Ionicons name={icon} color={theme.accent} size={20} />
      <View style={styles.profileCollectionCopy}>
        <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{body}</Text>
      </View>
      <View style={[styles.discoveryToggleTrack, { backgroundColor: enabled ? theme.accent : theme.line }]}>
        <View style={[styles.discoveryToggleThumb, enabled && styles.discoveryToggleThumbOn]} />
      </View>
    </Pressable>
  );
}

function getSafetyAcknowledgement(title: string) {
  if (title === "Mute profile") return "Their contributions will stay out of your issue unless you choose to bring them back.";
  if (title === "Disconnect profile") return "You will stop seeing new contributions from this profile. They will not be notified.";
  return "A private moderation note has been prepared for review.";
}

function AccountActionRow({ icon, title, body, accent, theme, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  accent: string;
  theme: AppTheme;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.accountActionRow,
        pressed && styles.profileRowPressed,
        { borderColor: theme.line, backgroundColor: theme.panel }
      ]}
    >
      <Ionicons name={icon} color={accent} size={21} />
      <View style={styles.profileCollectionCopy}>
        <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{body}</Text>
      </View>
      <Ionicons name="chevron-forward" color={theme.muted} size={17} />
    </Pressable>
  );
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
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "unavailable">("idle");
  const copied = copyStatus === "copied";
  const unavailable = copyStatus === "unavailable";
  const copyLink = async () => {
    try {
      await Clipboard.setStringAsync(`https://${domain}`);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("unavailable");
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copied ? `${title} link copied` : `Copy ${title} link`}
      accessibilityState={{ selected: copied }}
      onPress={() => { void copyLink(); }}
      style={({ pressed }) => [
        styles.externalProfileLink,
        copied && styles.externalProfileLinkOpened,
        unavailable && styles.externalProfileLinkUnavailable,
        pressed && styles.profileRowPressed,
        { borderColor: copied ? `${theme.accent}44` : unavailable ? `${palette.red}44` : "transparent" }
      ]}
    >
      <Ionicons name={copied ? "checkmark-circle-outline" : unavailable ? "alert-circle-outline" : icon} color={copied ? theme.accent : unavailable ? palette.red : theme.muted} size={17} />
      <View style={styles.externalProfileCopy}>
        <Text style={[styles.externalProfileTitle, { color: theme.text }]}>{copied ? `${title} copied` : title}</Text>
        <Text style={[styles.meta, { color: unavailable ? palette.red : theme.muted }]}>{unavailable ? "Could not copy this link." : domain}</Text>
      </View>
      <Ionicons name={copied ? "checkmark" : "copy-outline"} color={copied ? theme.accent : theme.muted} size={16} />
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
  ownProfileBadge: {
    minHeight: 30,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: spacing.xs
  },
  ownProfileBadgeText: {
    fontSize: 12,
    lineHeight: 16,
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
  privateProfileStats: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  privateStatItem: {
    minWidth: 86,
    alignItems: "center",
    justifyContent: "center"
  },
  privateStatValue: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  privateStatLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    textAlign: "center"
  },
  privateStatCopy: {
    flex: 1,
    gap: 2
  },
  privateStatTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  privateStatBody: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_500Medium"
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
    minWidth: 92,
    maxWidth: "100%",
    minHeight: 38,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center"
  },
  placementChipText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold",
    textAlign: "center"
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
  externalProfileLinkUnavailable: {
    backgroundColor: "rgba(158, 61, 52, 0.05)"
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
  shelfDraftPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card
  },
  shelfNameInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold"
  },
  shelfVisibilityRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  shelfVisibilityButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  shelfVisibilityText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  shelfStarterStack: {
    gap: spacing.sm
  },
  shelfStarterItem: {
    minHeight: 66,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  shelfSaveButton: {
    minHeight: 46,
    borderRadius: radii.round,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  shelfSaveButtonDisabled: {
    opacity: 0.62
  },
  shelfSaveButtonText: {
    color: "#FFFDF8",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
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
  dataAccountPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card
  },
  dataFactRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  accountActionRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    ...shadows.card
  },
  releaseInfoPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  discoveryControlsPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    gap: spacing.xs,
    ...shadows.card
  },
  discoveryToggleRow: {
    minHeight: 76,
    borderRadius: 8,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  discoveryToggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    padding: 3,
    marginTop: 2
  },
  discoveryToggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFDF8"
  },
  discoveryToggleThumbOn: {
    alignSelf: "flex-end"
  },
  connectRequestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  connectRequestOption: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  connectRequestOptionText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold"
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
