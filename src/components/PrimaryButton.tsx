import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { radii, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";

export function PrimaryButton({ label, icon, onPress, theme, disabled = false }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: AppTheme;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !disabled && styles.primaryButtonPressed,
        disabled && styles.primaryButtonDisabled,
        { backgroundColor: theme.text }
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: theme.bg }]}>{label}</Text>
      <Ionicons name={icon} color={theme.bg} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  primaryButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }]
  },
  primaryButtonDisabled: {
    opacity: 0.42
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800"
  }
});
