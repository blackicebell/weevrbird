import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { avatars, OnboardingStep } from "../app/editorial";
import { PrimaryButton } from "../components/PrimaryButton";
import { localDataService } from "../data/localDataService";
import { palette, radii, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";

const logo = require("../../Weevrbird Logos/PNG-01.png");

export function OnboardingScreen(props: {
  step: OnboardingStep;
  setStep: (step: OnboardingStep) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedInterests: string[];
  setSelectedInterests: (next: string[]) => void;
  selectedAvatar: number;
  setSelectedAvatar: (next: number) => void;
  finish: () => void;
  theme: AppTheme;
}) {
  const { step, setStep, selectedCity, setSelectedCity, selectedInterests, setSelectedInterests, selectedAvatar, setSelectedAvatar, finish, theme } = props;
  const cityOptions = ["Atlanta", "Decatur", "Brooklyn", "Houston", "Chicago", "Washington DC"];
  const progressSteps: OnboardingStep[] = ["welcome", "city", "interests", "avatar", "ready"];
  const currentStepIndex = progressSteps.indexOf(step);
  const previewInterests = selectedInterests.filter((interest) => interest !== selectedCity);
  const interests = localDataService.getInterests();
  const issueBuildItems = [
    { label: selectedCity, icon: "location-outline" as keyof typeof Ionicons.glyphMap },
    { label: previewInterests[0] ?? "Local culture", icon: "albums-outline" as keyof typeof Ionicons.glyphMap },
    { label: previewInterests[1] ?? "Useful conversations", icon: "chatbubbles-outline" as keyof typeof Ionicons.glyphMap },
    { label: "Personal archive", icon: "bookmark-outline" as keyof typeof Ionicons.glyphMap }
  ];
  const productPromises = [
    { title: "Read finite issues", body: "Start with what changed and stop when you are caught up.", icon: "newspaper-outline" as keyof typeof Ionicons.glyphMap },
    { title: "Save useful signal", body: "Keep the pieces, places, and questions you may need later.", icon: "bookmark-outline" as keyof typeof Ionicons.glyphMap },
    { title: "Contribute privately", body: "Write first, then place it only where it belongs.", icon: "create-outline" as keyof typeof Ionicons.glyphMap }
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length <= 3) return;
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <View style={styles.onboarding}>
      <View style={styles.brandRow}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.wordmark, { color: theme.text }]}>Weevrbird</Text>
      </View>
      <OnboardingProgress index={currentStepIndex} total={progressSteps.length} theme={theme} />

      {step === "welcome" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Your first issue starts here.</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>A calmer way to follow what is worth your attention.</Text>
          <Text style={[styles.body, { color: theme.muted }]}>
            Pick a city, a few interests, and a pen-name style. Weevrbird turns them into one useful daily issue, a personal archive, and a quieter way to contribute.
          </Text>
          <View style={styles.promiseStack}>
            {productPromises.map((promise) => (
              <PromiseRow key={promise.title} promise={promise} theme={theme} />
            ))}
          </View>
          <PrimaryButton label="Build my first issue" icon="arrow-forward" onPress={() => setStep("city")} theme={theme} />
        </View>
      )}

      {step === "city" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Set the local lens.</Text>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Where should your issue start?</Text>
          <Text style={[styles.body, { color: theme.muted }]}>No precise location needed. This simply gives Today a place to begin.</Text>
          <View style={styles.chipWrap}>
            {cityOptions.map((city) => (
              <Chip key={city} label={city} selected={selectedCity === city} onPress={() => setSelectedCity(city)} theme={theme} />
            ))}
          </View>
          <PrimaryButton label="Continue" icon="arrow-forward" onPress={() => setStep("interests")} theme={theme} />
        </View>
      )}

      {step === "interests" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Choose the sections.</Text>
          <Text style={[styles.screenTitle, { color: theme.text }]}>What should Weevrbird watch for?</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Pick at least three. These become the first sections in your issue, and you can tune them later.</Text>
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
          <PrimaryButton label="Continue" icon="arrow-forward" onPress={() => setStep("avatar")} theme={theme} />
        </View>
      )}

      {step === "avatar" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Choose your mark.</Text>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Pick a quiet profile mark</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Profiles start with a simple letter mark so the focus stays on what people notice, save, and place into the right Smartfeed.</Text>
          <View style={styles.avatarGrid}>
            {avatars.map((letter, index) => (
              <AvatarButton key={letter} label={letter} index={index} selected={selectedAvatar === index} onPress={() => setSelectedAvatar(index)} theme={theme} />
            ))}
          </View>
          <PrimaryButton label="Build my first issue" icon="sparkles-outline" onPress={() => setStep("ready")} theme={theme} />
        </View>
      )}

      {step === "ready" && (
        <View style={styles.onboardingPanel}>
          <Text style={[styles.kicker, { color: theme.accent }]}>Your first issue is ready.</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Today is built around {selectedCity}, useful signal, and calmer conversation.</Text>
          <View style={[styles.issuePreview, { backgroundColor: theme.panel, borderColor: theme.line }]}>
            <Text style={[styles.issuePreviewLabel, { color: theme.accent }]}>WHAT WEEVRBIRD WILL HELP YOU DO</Text>
            {issueBuildItems.map((item) => (
              <View key={item.label} style={styles.issueRow}>
                <Ionicons name={item.icon} color={theme.accent} size={18} />
                <Text style={[styles.issueText, { color: theme.text }]}>{item.label}</Text>
              </View>
            ))}
            <View style={[styles.issueDivider, { backgroundColor: theme.line }]} />
            <Text style={[styles.issuePromise, { color: theme.muted }]}>Read a finite issue, save what matters, and add useful signal privately before you place it.</Text>
          </View>
          <PrimaryButton label="Open Today" icon="newspaper-outline" onPress={finish} theme={theme} />
        </View>
      )}
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
    <View style={[styles.promiseRow, { borderColor: theme.line, backgroundColor: theme.panel }]}>
      <View style={[styles.promiseIcon, { backgroundColor: theme.panelAlt }]}>
        <Ionicons name={promise.icon} color={theme.accent} size={17} />
      </View>
      <View style={styles.promiseCopy}>
        <Text style={[styles.promiseTitle, { color: theme.text }]}>{promise.title}</Text>
        <Text style={[styles.promiseBody, { color: theme.muted }]}>{promise.body}</Text>
      </View>
    </View>
  );
}

function AvatarButton({ label, index, selected, onPress, theme }: {
  label: string;
  index: number;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  const colors = [palette.sage, palette.indigo, palette.clay, palette.plum, palette.gold, "#3E6D75", "#866653", "#4E6251"];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Avatar ${label}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.avatar,
        pressed && styles.pressableChoicePressed,
        { backgroundColor: colors[index % colors.length], borderColor: selected ? theme.text : "transparent" }
      ]}
    >
      <Text style={styles.avatarText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  onboarding: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
    zIndex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center"
  },
  onboardingPanel: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  progressWrap: {
    flexDirection: "row",
    gap: 6,
    paddingTop: spacing.sm
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 3
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radii.sm
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
  promiseStack: {
    gap: spacing.sm
  },
  promiseRow: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  promiseIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#FFFDF8",
    fontSize: 24,
    fontWeight: "900"
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
  }
});
