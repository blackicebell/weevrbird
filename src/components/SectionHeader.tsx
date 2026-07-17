import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppTheme } from "../theme/useTheme";

export function SectionHeader({ title, action, theme }: { title: string; action?: string; theme: AppTheme }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {action && <Text style={[styles.meta, { color: theme.accent }]}>{action}</Text>}
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
  }
});
