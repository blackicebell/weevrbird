import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AuthStatus, isValidEmail } from "../app/appState";
import { palette, radii, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";

export function EmailLinkGate({
  theme,
  authStatus,
  accountEmail,
  profileName,
  compact = false,
  onRequestLink,
  onCompleteSignIn,
  onSignOut
}: {
  theme: AppTheme;
  authStatus: AuthStatus;
  accountEmail: string;
  profileName: string;
  compact?: boolean;
  onRequestLink: (email: string, penName?: string) => void;
  onCompleteSignIn: () => void;
  onSignOut?: () => void;
}) {
  const [email, setEmail] = useState(accountEmail);
  const [penName, setPenName] = useState(profileName);
  const [message, setMessage] = useState<string | null>(null);
  const normalizedEmail = email.trim().toLowerCase();
  const canSend = isValidEmail(normalizedEmail);
  const title = authStatus === "signed_in" ? "Account ready" : authStatus === "link_sent" ? "Check your email" : "Save your identity with email";
  const statusLabel = authStatus === "signed_in" ? "Signed in" : authStatus === "link_sent" ? "Email link sent" : "Local profile";
  const body = useMemo(() => {
    if (authStatus === "signed_in") return "Your profile, saved items, and contributions are tied to this email.";
    if (authStatus === "link_sent") return "Open the email link on this device to finish, then continue below.";
    return "Use an email link instead of a password. Your pen name is what people see when you contribute.";
  }, [authStatus]);

  const sendLink = () => {
    if (!canSend) {
      setMessage("Enter a valid email address first.");
      return;
    }

    onRequestLink(normalizedEmail, penName);
    setMessage(`Link sent to ${normalizedEmail}.`);
  };

  if (authStatus === "signed_in") {
    return (
      <View style={[styles.card, compact && styles.cardCompact, { backgroundColor: theme.panel, borderColor: theme.line }]}>
        <StatusBadge label={statusLabel} icon="checkmark-circle-outline" theme={theme} />
        <View style={[styles.iconWrap, { backgroundColor: palette.seafoam }]}>
          <Ionicons name="checkmark-circle-outline" color={theme.accent} size={21} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
          <Text style={[styles.email, { color: theme.accent }]}>{accountEmail}</Text>
        </View>
        {onSignOut && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={onSignOut}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed, { borderColor: theme.line }]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Sign out</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.card, compact && styles.cardCompact, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <StatusBadge label={statusLabel} icon={authStatus === "link_sent" ? "mail-open-outline" : "phone-portrait-outline"} theme={theme} />
      <View style={[styles.headerIcon, { backgroundColor: authStatus === "link_sent" ? palette.sky : palette.seafoam }]}>
        <Ionicons name={authStatus === "link_sent" ? "mail-open-outline" : "mail-outline"} color={theme.accent} size={22} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      </View>

      <View style={styles.fieldStack}>
        <Text style={[styles.label, { color: theme.accent }]}>Email</Text>
        <TextInput
          accessibilityLabel="Email address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setMessage(null);
          }}
          placeholder="you@example.com"
          placeholderTextColor={theme.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.field, { borderColor: theme.line, color: theme.text, backgroundColor: theme.panelAlt }]}
        />
      </View>

      <View style={styles.fieldStack}>
        <Text style={[styles.label, { color: theme.accent }]}>Pen name optional</Text>
        <TextInput
          accessibilityLabel="Optional pen name"
          value={penName}
          onChangeText={(value) => setPenName(value.slice(0, 36))}
          placeholder="Field Architect"
          placeholderTextColor={theme.muted}
          style={[styles.field, { borderColor: theme.line, color: theme.text, backgroundColor: theme.panelAlt }]}
        />
      </View>

      {message && (
        <Text style={[styles.message, { color: authStatus === "link_sent" ? theme.accent : palette.red }]}>{message}</Text>
      )}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={authStatus === "link_sent" ? "Send another email link" : "Send email link"}
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={sendLink}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, !canSend && styles.disabled, { backgroundColor: theme.text }]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.bg }]}>{authStatus === "link_sent" ? "Resend link" : "Send email link"}</Text>
          <Ionicons name="arrow-forward" color={theme.bg} size={17} />
        </Pressable>

        {authStatus === "link_sent" && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="I opened the email link"
            onPress={onCompleteSignIn}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed, { borderColor: theme.line }]}
          >
            <Ionicons name="link-outline" color={theme.accent} size={16} />
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>I opened the link</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function StatusBadge({ label, icon, theme }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.statusBadge, { borderColor: theme.line, backgroundColor: theme.panelAlt }]}>
      <Ionicons name={icon} color={theme.accent} size={15} />
      <Text style={[styles.statusBadgeText, { color: theme.accent }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card
  },
  cardCompact: {
    padding: spacing.md
  },
  statusBadge: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  statusBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    gap: 4
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: "Inter_700Bold"
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_500Medium"
  },
  email: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  fieldStack: {
    gap: spacing.xs
  },
  label: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase"
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold"
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  actions: {
    gap: spacing.sm
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  primaryButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_700Bold"
  },
  secondaryButton: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  secondaryButtonText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.42
  }
});
