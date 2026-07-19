import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { avatarMarks, OnboardingStep } from "../app/editorial";
import { normalizeProfileHandle } from "../app/appState";
import { ProfileMark } from "../components/ProfileMark";
import { PrimaryButton } from "../components/PrimaryButton";
import { localDataService } from "../data/localDataService";
import { radii, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";

const logo = require("../../assets/icon.png");

export function OnboardingScreen(props: {
  step: OnboardingStep;
  setStep: (step: OnboardingStep) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedInterests: string[];
  setSelectedInterests: (next: string[]) => void;
  selectedAvatar: number;
  setSelectedAvatar: (next: number) => void;
  profileName: string;
  setProfileName: (next: string) => void;
  profileHandle: string;
  setProfileHandle: (next: string) => void;
  profileBio: string;
  setProfileBio: (next: string) => void;
  finish: () => void;
  theme: AppTheme;
}) {
  const {
    step,
    setStep,
    selectedCity,
    setSelectedCity,
    selectedInterests,
    setSelectedInterests,
    selectedAvatar,
    setSelectedAvatar,
    profileName,
    setProfileName,
    profileHandle,
    setProfileHandle,
    profileBio,
    setProfileBio,
    finish,
    theme
  } = props;
  const locationOptions = [
    "Global",
    "Atlanta",
    "Brooklyn",
    "Houston",
    "Chicago",
    "Washington DC",
    "Lagos",
    "London",
    "Toronto",
    "United States",
    "Nigeria",
    "United Kingdom"
  ];
  const progressSteps: OnboardingStep[] = ["welcome", "city", "interests", "avatar", "profile", "ready"];
  const currentStepIndex = progressSteps.indexOf(step);
  const canGoBack = currentStepIndex > 0;
  const previewInterests = selectedInterests.filter((interest) => interest !== selectedCity);
  const interests = localDataService.getInterests();
  const selectedInterestCount = selectedInterests.filter((interest) => interest !== selectedCity).length;
  const issueBuildItems = [
    { label: selectedCity, icon: "location-outline" as keyof typeof Ionicons.glyphMap },
    { label: previewInterests[0] ? `${previewInterests[0]} section` : "Stories worth reading", icon: "albums-outline" as keyof typeof Ionicons.glyphMap },
    { label: previewInterests[1] ? `${previewInterests[1]} section` : "Useful community notes", icon: "chatbubbles-outline" as keyof typeof Ionicons.glyphMap },
    { label: "Saved pieces stay in your Library", icon: "bookmark-outline" as keyof typeof Ionicons.glyphMap }
  ];
  const productPromises = [
    { title: "A daily edition", body: "A short set of articles, updates, questions, and recommendations selected around your interests.", icon: "newspaper-outline" as keyof typeof Ionicons.glyphMap },
    { title: "Smartfeeds", body: "Focused sections for a city, topic, or community. They stay finite so you can actually catch up.", icon: "albums-outline" as keyof typeof Ionicons.glyphMap },
    { title: "A useful library", body: "Save links, places, reads, and conversations so good information does not disappear.", icon: "bookmark-outline" as keyof typeof Ionicons.glyphMap }
  ];
  const howItWorks = [
    { title: "We gather", body: "Trusted outside sources and community posts become candidates.", icon: "cloud-download-outline" as keyof typeof Ionicons.glyphMap },
    { title: "We filter", body: "Your city, interests, saved items, and muted topics shape what appears.", icon: "options-outline" as keyof typeof Ionicons.glyphMap },
    { title: "You decide", body: "Read, save, or add your own note. Nothing has to become a loud public post.", icon: "checkmark-done-outline" as keyof typeof Ionicons.glyphMap }
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length <= 3) return;
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const selectLocation = (location: string) => {
    const previousLocations = new Set(locationOptions);
    const selectedWithoutOldLocation = selectedInterests.filter((interest) => !previousLocations.has(interest));

    setSelectedCity(location);
    setSelectedInterests(Array.from(new Set([location, ...selectedWithoutOldLocation])));
  };

  const goBack = () => {
    const previousStep = progressSteps[currentStepIndex - 1];
    if (previousStep) setStep(previousStep);
  };

  const canContinueInterests = selectedInterestCount >= 3;
  const cleanHandle = normalizeProfileHandle(profileHandle);
  const canContinueProfile = profileName.trim().length >= 2 && cleanHandle.length >= 3 && profileBio.trim().length >= 24;

  return (
    <View style={styles.onboarding}>
      <View style={styles.brandRow}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.wordmark, { color: theme.text }]}>Weevrbird</Text>
      </View>
      <View style={styles.progressHeader}>
        {canGoBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back one onboarding step"
            onPress={goBack}
            style={({ pressed }) => [styles.backStepButton, pressed && styles.pressableChoicePressed]}
          >
            <Ionicons name="chevron-back" color={theme.text} size={18} />
            <Text style={[styles.backStepText, { color: theme.text }]}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backStepPlaceholder} />
        )}
        <OnboardingProgress index={currentStepIndex} total={progressSteps.length} theme={theme} />
      </View>

      <ScrollView
        contentContainerStyle={styles.onboardingScroll}
        showsVerticalScrollIndicator={false}
      >
      {step === "welcome" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>A personal information app</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Keep up with what is useful without opening five different feeds.</Text>
          <Text style={[styles.body, { color: theme.muted }]}>
            Weevrbird builds a daily edition from trusted sources, local updates, community recommendations, and your saved context. It is made for catching up, keeping what matters, and contributing with more intent.
          </Text>
          <View style={[styles.promisePanel, { borderColor: theme.line, backgroundColor: theme.panel }]}>
            {productPromises.map((promise) => (
              <PromiseRow key={promise.title} promise={promise} theme={theme} />
            ))}
          </View>
          <PrimaryButton label="Build my first issue" icon="arrow-forward" onPress={() => setStep("city")} theme={theme} />
        </View>
      )}

      {step === "city" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Start with place</Text>
          <Text style={[styles.screenTitle, { color: theme.text }]}>What location should Today understand first?</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Choose a city, country, or Global. This helps Weevrbird start with the right local guides, official updates, events, and broader sources. You can change it later.</Text>
          <View style={styles.chipWrap}>
            {locationOptions.map((location) => (
              <Chip key={location} label={location} selected={selectedCity === location} onPress={() => selectLocation(location)} theme={theme} />
            ))}
          </View>
          <InlineNote
            icon="shield-checkmark-outline"
            title="No exact location needed"
            body="Weevrbird only needs a broad starting point for the first edition."
            theme={theme}
          />
          <PrimaryButton label="Continue" icon="arrow-forward" onPress={() => setStep("interests")} theme={theme} />
        </View>
      )}

      {step === "interests" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Shape your sections</Text>
          <Text style={[styles.screenTitle, { color: theme.text }]}>What should Weevrbird pay attention to?</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Pick at least three. These become your first Smartfeeds: focused sections that combine outside sources, community posts, and saved context.</Text>
          <View style={styles.cardGrid}>
            {interests.slice(0, 10).map((interest) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${selectedInterests.includes(interest) ? "Remove" : "Add"} ${interest} interest`}
                accessibilityState={{ selected: selectedInterests.includes(interest) }}
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={({ pressed }) => [
                  styles.interestCard,
                  pressed && styles.pressableChoicePressed,
                  { backgroundColor: theme.panel, borderColor: selectedInterests.includes(interest) ? theme.accent : theme.line }
                ]}
              >
                <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
                {selectedInterests.includes(interest) && <Ionicons name="checkmark-circle" color={theme.accent} size={20} />}
              </Pressable>
            ))}
          </View>
          <Text style={[styles.selectionHint, { color: canContinueInterests ? theme.muted : theme.accent }]}>
            {canContinueInterests ? `${selectedInterestCount} sections selected` : `Choose ${3 - selectedInterestCount} more to continue`}
          </Text>
          <PrimaryButton label="Continue" icon="arrow-forward" onPress={() => setStep("avatar")} theme={theme} disabled={!canContinueInterests} />
        </View>
      )}

      {step === "avatar" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Your profile starts private</Text>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Choose a simple profile mark.</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Your profile is built around what you notice, save, and contribute. A small bird mark keeps the focus on your taste and context, not popularity.</Text>
          <View style={styles.avatarGrid}>
            {avatarMarks.map((mark, index) => (
              <AvatarButton key={mark.id} index={index} selected={selectedAvatar === index} onPress={() => setSelectedAvatar(index)} theme={theme} />
            ))}
          </View>
          <InlineNote
            icon="create-outline"
            title="Contributions begin private"
            body="Write a link, question, recommendation, or note first. Then choose where it belongs."
            theme={theme}
          />
          <PrimaryButton label="Continue" icon="arrow-forward" onPress={() => setStep("profile")} theme={theme} />
        </View>
      )}

      {step === "profile" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Create your profile</Text>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Choose the name your contributions can carry.</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Use a pen name, not a legal name. It tells people what you usually notice, save, and contribute.</Text>
          <View style={[styles.profileDraft, { borderColor: theme.line, backgroundColor: theme.panel }]}>
            <ProfileMark index={selectedAvatar} size={54} selected />
            <View style={styles.profileDraftCopy}>
              <Text style={[styles.profileDraftName, { color: theme.text }]}>{profileName.trim() || "Profile name"}</Text>
              <Text style={[styles.profileDraftHandle, { color: theme.muted }]}>@{cleanHandle || "handle"} / {selectedCity}</Text>
            </View>
          </View>
          <FieldLabel label="Pen name" theme={theme} />
          <TextInput
            accessibilityLabel="Pen name"
            value={profileName}
            onChangeText={(value) => setProfileName(value.slice(0, 36))}
            placeholder="Field Architect"
            placeholderTextColor={theme.muted}
            style={[styles.textField, { borderColor: theme.line, backgroundColor: theme.panel, color: theme.text }]}
          />
          <FieldLabel label="Handle" theme={theme} />
          <View style={[styles.handleField, { borderColor: theme.line, backgroundColor: theme.panel }]}>
            <Text style={[styles.handlePrefix, { color: theme.muted }]}>@</Text>
            <TextInput
              accessibilityLabel="Profile handle"
              value={profileHandle}
              onChangeText={(value) => setProfileHandle(normalizeProfileHandle(value))}
              placeholder="fieldarchitect"
              placeholderTextColor={theme.muted}
              autoCapitalize="none"
              style={[styles.handleInput, { color: theme.text }]}
            />
          </View>
          <FieldLabel label="What you pay attention to" theme={theme} />
          <TextInput
            accessibilityLabel="What you pay attention to"
            value={profileBio}
            onChangeText={(value) => setProfileBio(value.slice(0, 160))}
            placeholder="Local food, practical tech, independent bookstores, and places worth returning to."
            placeholderTextColor={theme.muted}
            multiline
            style={[styles.textArea, { borderColor: theme.line, backgroundColor: theme.panel, color: theme.text }]}
          />
          <Text style={[styles.selectionHint, { color: canContinueProfile ? theme.muted : theme.accent }]}>
            {canContinueProfile ? "Profile preview ready" : "Add a name, handle, and one specific attention statement"}
          </Text>
          <PrimaryButton label="Preview my first edition" icon="arrow-forward" onPress={() => setStep("ready")} theme={theme} disabled={!canContinueProfile} />
        </View>
      )}

      {step === "ready" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>You are ready</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Your first edition will start with {selectedCity} and the sections you chose.</Text>
          <View style={[styles.issuePreview, { backgroundColor: theme.panel, borderColor: theme.line }]}>
            <Text style={[styles.issuePreviewLabel, { color: theme.accent }]}>WHAT HAPPENS NEXT</Text>
            {issueBuildItems.map((item) => (
              <View key={item.label} style={styles.issueRow}>
                <Ionicons name={item.icon} color={theme.accent} size={18} />
                <Text style={[styles.issueText, { color: theme.text }]}>{item.label}</Text>
              </View>
            ))}
            <View style={[styles.issueDivider, { backgroundColor: theme.line }]} />
            <Text style={[styles.issuePromise, { color: theme.muted }]}>Today gives you a finite edition. Smartfeeds organize the topics. Contribute lets you add context when you have something useful. Library keeps what you want to return to.</Text>
          </View>
          <View style={styles.howItWorksGrid}>
            {howItWorks.map((item) => (
              <MiniExplainer key={item.title} item={item} theme={theme} />
            ))}
          </View>
          <PrimaryButton label="Open Today" icon="newspaper-outline" onPress={finish} theme={theme} />
        </View>
      )}
      </ScrollView>
    </View>
  );
}

function OnboardingProgress({ index, total, theme }: { index: number; total: number; theme: AppTheme }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Onboarding step ${index + 1} of ${total}`}
      style={styles.progressWrap}
    >
      {Array.from({ length: total }).map((_, itemIndex) => (
        <View
          key={`progress-${itemIndex}`}
          style={[
            styles.progressDot,
            { backgroundColor: itemIndex <= index ? theme.accent : "rgba(17, 32, 50, 0.12)" }
          ]}
        />
      ))}
    </View>
  );
}

function Chip({ label, selected, onPress, theme }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose ${label}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.pressableChoicePressed,
        { backgroundColor: selected ? theme.text : theme.panel, borderColor: selected ? theme.text : theme.line }
      ]}
    >
      <Text style={[styles.chipText, { color: selected ? theme.bg : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function PromiseRow({ promise, theme }: {
  promise: { title: string; body: string; icon: keyof typeof Ionicons.glyphMap };
  theme: AppTheme;
}) {
  return (
    <View style={styles.promiseRow}>
      <View style={[styles.promiseIcon, { backgroundColor: theme.panelAlt }]}>
        <Ionicons name={promise.icon} color={theme.accent} size={16} />
      </View>
      <View style={styles.promiseCopy}>
        <Text style={[styles.promiseTitle, { color: theme.text }]}>{promise.title}</Text>
        <Text style={[styles.promiseBody, { color: theme.muted }]}>{promise.body}</Text>
      </View>
    </View>
  );
}

function InlineNote({ icon, title, body, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.inlineNote, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <View style={[styles.promiseIcon, { backgroundColor: theme.panelAlt }]}>
        <Ionicons name={icon} color={theme.accent} size={16} />
      </View>
      <View style={styles.promiseCopy}>
        <Text style={[styles.promiseTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.promiseBody, { color: theme.muted }]}>{body}</Text>
      </View>
    </View>
  );
}

function MiniExplainer({ item, theme }: {
  item: { title: string; body: string; icon: keyof typeof Ionicons.glyphMap };
  theme: AppTheme;
}) {
  return (
    <View style={[styles.miniExplainer, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <Ionicons name={item.icon} color={theme.accent} size={17} />
      <Text style={[styles.miniExplainerTitle, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.miniExplainerBody, { color: theme.muted }]}>{item.body}</Text>
    </View>
  );
}

function FieldLabel({ label, theme }: { label: string; theme: AppTheme }) {
  return <Text style={[styles.fieldLabel, { color: theme.accent }]}>{label}</Text>;
}

function AvatarButton({ index, selected, onPress, theme }: {
  index: number;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose ${avatarMarks[index].label} profile mark`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.avatarChoice,
        pressed && styles.pressableChoicePressed
      ]}
    >
      <ProfileMark index={index} size={68} selected={selected} showLabel labelColor={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  onboarding: {
    flex: 1,
    padding: spacing.lg,
    zIndex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center"
  },
  onboardingScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: spacing.lg
  },
  onboardingPanel: {
    justifyContent: "center",
    gap: spacing.lg
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  progressHeader: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm
  },
  backStepButton: {
    minWidth: 72,
    minHeight: 34,
    borderRadius: radii.round,
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  backStepPlaceholder: {
    minWidth: 72
  },
  backStepText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  progressWrap: {
    flex: 1,
    flexDirection: "row",
    gap: 6
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 3
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 13
  },
  wordmark: {
    fontSize: 30,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0
  },
  kicker: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    fontFamily: "PlayfairDisplay_700Bold",
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
  promisePanel: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 2
  },
  inlineNote: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  promiseRow: {
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  promiseIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  promiseCopy: {
    flex: 1,
    gap: 2
  },
  promiseTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  promiseBody: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_500Medium"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    minHeight: 40,
    borderRadius: radii.round,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  chipText: {
    fontSize: 14,
    fontWeight: "800"
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  selectionHint: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  fieldLabel: {
    marginBottom: -10,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  textField: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold"
  },
  handleField: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center"
  },
  handlePrefix: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold"
  },
  handleInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold"
  },
  textArea: {
    minHeight: 92,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_500Medium",
    textAlignVertical: "top"
  },
  profileDraft: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  profileDraftCopy: {
    flex: 1
  },
  profileDraftName: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  profileDraftHandle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_600SemiBold"
  },
  interestCard: {
    width: "48%",
    minHeight: 86,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  pressableChoicePressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  },
  interestText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800"
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  avatarChoice: {
    width: 82,
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center"
  },
  issuePreview: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md
  },
  issuePreviewLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  issueText: {
    fontSize: 17,
    fontWeight: "700"
  },
  issueDivider: {
    height: 1,
    opacity: 0.8
  },
  issuePromise: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_500Medium"
  },
  howItWorksGrid: {
    gap: spacing.sm
  },
  miniExplainer: {
    minHeight: 70,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4
  },
  miniExplainerTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  miniExplainerBody: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_500Medium"
  }
});
