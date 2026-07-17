import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppTab, tabs } from "../app/editorial";
import { palette, shadows, spacing } from "../theme/tokens";
import { AppTheme } from "../theme/useTheme";

export function TabBar({ activeTab, setActiveTab, theme, bottomInset }: {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  theme: AppTheme;
  bottomInset: number;
}) {
  return (
    <View pointerEvents="box-none" style={[styles.tabBarAnchor, { bottom: Math.max(10, bottomInset + 10) }]}>
      <View style={[styles.tabBar, { borderColor: theme.dark ? theme.line : "rgba(255, 255, 255, 0.86)" }]}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const primary = tab.key === "Contribute";
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.key} tab`}
              accessibilityHint={active ? `${tab.key} is currently open.` : `Open ${tab.key}.`}
              accessibilityState={{ selected: active }}
              onPress={() => setActiveTab(tab.key)}
              style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
            >
              {primary ? (
                <LinearGradient colors={[palette.deepForest, "#1C9A75"]} style={[styles.primaryTabIcon, active && styles.primaryTabIconActive]}>
                  <Ionicons name="add" color="#FFFFFF" size={30} />
                </LinearGradient>
              ) : (
                <Ionicons name={tab.icon} color={active ? theme.forest : theme.muted} size={23} />
              )}
              <Text style={[styles.tabLabel, { color: active ? theme.accent : theme.muted }]}>{tab.key}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2
  },
  tabBar: {
    width: "92%",
    maxWidth: 528,
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 28,
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 252, 0.74)",
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    shadowColor: "#0F3D2E",
    shadowOpacity: 0.15,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  tabButtonPressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }]
  },
  primaryTabIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24,
    ...shadows.card
  },
  primaryTabIconActive: {
    transform: [{ scale: 1.06 }]
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold"
  }
});
