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
import { feedItems, launchFeeds } from "../data/mockData";
import { palette, radii, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";
import { FeedItem } from "../types/product";

export function ProfileScreen({ theme, selectedAvatar, selectedInterests, onOpenDetail, onResetApp }: {
  theme: AppTheme;
  selectedAvatar: number;
  selectedInterests: string[];
  onOpenDetail: (item: FeedItem) => void;
  onResetApp: () => void;
}) {
  const [following, setFollowing] = useState(false);
  const [activeShelf, setActiveShelf] = useState<(typeof profileCollections)[number] | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const featuredContribution = feedItems.find((item) => item.itemType === "recommendation") ?? feedItems[0];
  const questionContribution = feedItems.find((item) => item.itemType === "discussion") ?? feedItems[2];

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

  if (showSafety) {
    return <ProfileSafetyPanel theme={theme} onBack={() => setShowSafety(false)} onResetApp={onResetApp} />;
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
        <View style={[styles.profileSignalPanel, { borderColor: "#DDF0E4" }]}>
          <ProfileSignalRow label="Known for" value="Places, books, and slower attention" theme={theme} />
          <ProfileSignalRow label="Rhythm" value="Weekly field notes" theme={theme} />
          <ProfileSignalRow label="Best when" value="You want grounded local signal" theme={theme} />
        </View>
        <View style={styles.profileTrustRow}>
          <Text style={[styles.profileTrustText, { color: theme.muted }]}>Local context</Text>
          <Text style={[styles.profileTrustText, { color: theme.muted }]}>Useful questions</Text>
          <Text style={[styles.profileTrustText, { color: theme.muted }]}>Practical saves</Text>
        </View>
      </View>

      <ProfileChapter theme={theme} />

      <SectionHeader title="Attention Map" action="Edit" theme={theme} />
      <View style={styles.interestShelf}>
        {selectedInterests.concat(["Urbanism", "Independent Publishing"]).slice(0, 5).map((interest, index) => (
          <View key={`shelf-${interest}`} style={[styles.interestShelfItem, { backgroundColor: ["#DDF0E4", "#DCE9F8", "#F7DDCE", "#F2DBB6", "#E9DDBE"][index], borderColor: theme.line }]}>
            <Text style={[styles.interestShelfText, { color: theme.text }]}>{interest}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Recent Signal" action="View all" theme={theme} />
      <ProfileContribution item={featuredContribution} label="Recommendation in Atlanta" theme={theme} onOpen={() => onOpenDetail(featuredContribution)} />
      <ProfileContribution item={questionContribution} label="Question in Black Tech" theme={theme} onOpen={() => onOpenDetail(questionContribution)} />

      <SectionHeader title="Shelves" action="New shelf" theme={theme} />
      {profileCollections.map((collection) => (
        <ProfileCollectionRow key={collection.title} collection={collection} theme={theme} onOpen={() => setActiveShelf(collection)} />
      ))}

      <SectionHeader title="Contribution Rhythm" theme={theme} />
      <View style={styles.profileTypeGrid}>
        {profileContributionTypes.map((type) => (
          <View key={type.label} style={[styles.profileTypeTile, { borderColor: theme.line, backgroundColor: "rgba(255, 255, 252, 0.58)" }]}>
            <Text style={[styles.profileTypeLabel, { color: theme.text }]}>{type.label}</Text>
            <Text style={[styles.profileTypeCount, { color: theme.muted }]}>{type.count} contributions</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Elsewhere They Write" theme={theme} />
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

function ProfileAvatar({ label, index, theme }: { label: string; index: number; theme: AppTheme }) {
  const colors = [palette.sage, palette.indigo, palette.clay, palette.plum, palette.gold, "#3E6D75", "#866653", "#4E6251"];
  return (
    <View style={[styles.avatar, { backgroundColor: colors[index % colors.length], borderColor: theme.text }]}>
      <Text style={styles.avatarText}>{label}</Text>
    </View>
  );
}

function ProfileSignalRow({ label, value, theme }: { label: string; value: string; theme: AppTheme }) {
  return (
    <View style={styles.profileSignalRow}>
      <Text style={[styles.profileSignalLabel, { color: palette.deepForest }]}>{label}</Text>
      <Text style={[styles.profileSignalText, { color: theme.text }]}>{value}</Text>
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
  const feed = launchFeeds.find((entry) => entry.id === item.feedId) ?? launchFeeds[0];
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
  const shelfItems = getShelfItems(collection.title);
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
  const controls = [
    { icon: "volume-mute-outline", title: "Mute profile", body: "Hide this person's contributions without changing your public signal." },
    { icon: "person-remove-outline", title: "Unfollow quietly", body: "Stop seeing new signal from this profile. They will not be notified." },
    { icon: "flag-outline", title: "Report concern", body: "Send a moderation note if something feels unsafe, spammy, or out of place." }
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BackButton label="Back to profile" theme={theme} onPress={onBack} />
      <View style={[styles.safetyHero, { borderColor: theme.line, backgroundColor: theme.panel }]}>
        <Text style={[styles.moduleEyebrow, { color: palette.deepForest }]}>PRIVACY AND SAFETY</Text>
        <Text style={[styles.shelfTitle, { color: theme.text }]}>Quiet controls for your attention.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>These actions are private. Weevrbird should give you control without turning safety into a performance.</Text>
      </View>
      {controls.map((control) => (
        <Pressable
          key={control.title}
          accessibilityRole="button"
          accessibilityLabel={control.title}
          onPress={() => undefined}
          style={({ pressed }) => [styles.safetyRow, pressed && styles.profileRowPressed, { borderColor: theme.line, backgroundColor: theme.panel }]}
        >
          <Ionicons name={control.icon as keyof typeof Ionicons.glyphMap} color={control.title === "Report concern" ? palette.red : theme.accent} size={21} />
          <View style={styles.profileCollectionCopy}>
            <Text style={[styles.profileCollectionTitle, { color: theme.text }]}>{control.title}</Text>
            <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>{control.body}</Text>
          </View>
          <Ionicons name="chevron-forward" color={theme.muted} size={17} />
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset Weevrbird"
        onPress={onResetApp}
        style={({ pressed }) => [styles.resetRow, pressed && styles.profileRowPressed, { borderColor: "rgba(158, 61, 52, 0.24)", backgroundColor: "rgba(158, 61, 52, 0.06)" }]}
      >
        <Ionicons name="refresh-circle-outline" color={palette.red} size={24} />
        <View style={styles.profileCollectionCopy}>
          <Text style={[styles.profileCollectionTitle, { color: palette.red }]}>Reset Weevrbird</Text>
          <Text style={[styles.profileCollectionDescription, { color: theme.muted }]}>Clear this demo state and return to the first onboarding screen.</Text>
        </View>
        <Ionicons name="chevron-forward" color={palette.red} size={17} />
      </Pressable>
    </ScrollView>
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

function getShelfItems(title: string) {
  if (title.includes("Atlanta")) {
    return feedItems.filter((item) => item.feedId === "atlanta");
  }
  if (title.includes("slower attention")) {
    return feedItems.filter((item) => item.feedId === "creative-community" || item.title?.includes("attention"));
  }
  return feedItems.filter((item) => item.feedId === "creative-community" || item.feedId === "black-tech");
}

function ExternalProfileLink({ icon, title, domain, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  domain: string;
  theme: AppTheme;
}) {
  return (
    <View style={styles.externalProfileLink}>
      <Ionicons name={icon} color={theme.muted} size={17} />
      <View style={styles.externalProfileCopy}>
        <Text style={[styles.externalProfileTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{domain}</Text>
      </View>
      <Ionicons name="open-outline" color={theme.muted} size={16} />
    </View>
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
  profileSignalPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    gap: 8,
    backgroundColor: "rgba(221, 240, 228, 0.24)"
  },
  profileSignalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  profileSignalLabel: {
    width: 72,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  profileSignalText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_600SemiBold"
  },
  profileTrustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  profileTrustText: {
    borderWidth: 1,
    borderColor: "#DDF0E4",
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold",
    backgroundColor: "rgba(221, 240, 228, 0.42)"
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
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
  resetRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  }
});
