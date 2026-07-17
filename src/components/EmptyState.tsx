import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radii, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";

export function EmptyState({ icon, title, body, actionLabel, onAction, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.emptyState, { backgroundColor: theme.panel, borderColor: theme.line }]}>
      <Ionicons name={icon} color={theme.accent} size={30} />
      <Text style={[styles.cardTitle, { color: theme.text, textAlign: "center" }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.muted, textAlign: "center" }]}>{body}</Text>
      {actionLabel && onAction && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.emptyAction, pressed && styles.emptyActionPressed, { backgroundColor: theme.text }]}
        >
          <Text style={[styles.emptyActionText, { color: theme.bg }]}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" color={theme.bg} size={15} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter_400Regular"
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold"
  },
  emptyState: {
    minHeight: 200,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md
  },
  emptyAction: {
    minHeight: 42,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  emptyActionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  emptyActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter_700Bold"
  }
});
