import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppTheme } from "../theme/useTheme";

export function SectionHeader({
  title,
  action,
  actionAccessibilityLabel,
  onAction,
  theme
}: {
  title: string;
  action?: string;
  actionAccessibilityLabel?: string;
  onAction?: () => void;
  theme: AppTheme;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {action && (
        onAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionAccessibilityLabel ?? action}
            onPress={onAction}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={[styles.meta, { color: theme.accent }]}>{action}</Text>
          </Pressable>
        ) : (
          <Text style={[styles.meta, { color: theme.accent }]}>{action}</Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 21,
    fontFamily: "PlayfairDisplay_700Bold"
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_500Medium"
  },
  actionButton: {
    minHeight: 34,
    paddingHorizontal: 4,
    justifyContent: "center"
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }]
  }
});
