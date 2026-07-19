import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { avatarMarks } from "../app/editorial";
import { palette } from "../theme/tokens";

export function ProfileMark({ index = 0, size = 56, selected = false, showLabel = false, labelColor = palette.ink }: {
  index?: number;
  size?: number;
  selected?: boolean;
  showLabel?: boolean;
  labelColor?: string;
}) {
  const mark = avatarMarks[index % avatarMarks.length] ?? avatarMarks[0];
  const scale = size / 56;

  return (
    <View style={showLabel ? styles.wrapperWithLabel : undefined}>
      <View
        style={[
          styles.mark,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: mark.background,
            borderColor: selected ? palette.ink : "rgba(15, 61, 46, 0.12)",
            borderWidth: selected ? 3 : 1
          }
        ]}
      >
        <View style={[styles.backdropRing, { borderColor: mark.accent, borderWidth: Math.max(1, 2 * scale) }]} />
        <View
          style={[
            styles.shoulder,
            {
              backgroundColor: mark.foreground,
              width: 39 * scale,
              height: 27 * scale,
              borderRadius: 18 * scale,
              left: 10 * scale,
              top: 34 * scale,
              transform: [{ rotate: `${mark.neckTilt}deg` }]
            }
          ]}
        />
        <View
          style={[
            styles.chest,
            {
              backgroundColor: mark.chest,
              width: 25 * scale,
              height: 20 * scale,
              borderRadius: 14 * scale,
              left: 19 * scale,
              top: 39 * scale,
              transform: [{ rotate: `${mark.neckTilt}deg` }]
            }
          ]}
        />
        <View
          style={[
            styles.neck,
            {
              backgroundColor: mark.foreground,
              width: 23 * scale,
              height: 28 * scale,
              borderRadius: 13 * scale,
              left: 25 * scale,
              top: 24 * scale,
              transform: [{ rotate: `${mark.neckTilt}deg` }]
            }
          ]}
        />
        <View
          style={[
            styles.head,
            {
              backgroundColor: mark.foreground,
              width: 30 * scale,
              height: 29 * scale,
              borderRadius: 16 * scale,
              left: 24 * scale,
              top: 12 * scale
            }
          ]}
        />
        {mark.crest && (
          <View
            style={[
              styles.crest,
              {
                backgroundColor: mark.accent,
                width: 15 * scale,
                height: 9 * scale,
                borderRadius: 8 * scale,
                left: 24 * scale,
                top: 9 * scale,
                transform: [{ rotate: "-24deg" }]
              }
            ]}
          />
        )}
        <View
          style={[
            styles.facePatch,
            {
              backgroundColor: mark.chest,
              width: 15 * scale,
              height: 15 * scale,
              borderRadius: 8 * scale,
              left: 35 * scale,
              top: 22 * scale
            }
          ]}
        />
        <View
          style={[
            styles.collar,
            {
              backgroundColor: mark.accent,
              width: 21 * scale,
              height: 7 * scale,
              borderRadius: 7 * scale,
              left: 23 * scale,
              top: 37 * scale,
              transform: [{ rotate: `${mark.neckTilt}deg` }]
            }
          ]}
        />
        <View
          style={[
            styles.eye,
            {
              width: Math.max(2, 3 * scale),
              height: Math.max(2, 3 * scale),
              borderRadius: Math.max(1, 1.5 * scale),
              left: 43 * scale,
              top: 20 * scale
            }
          ]}
        />
        <View
          style={[
            styles.beak,
            {
              borderLeftColor: mark.beak,
              borderLeftWidth: 12 * scale,
              borderTopWidth: 5 * scale,
              borderBottomWidth: 5 * scale,
              left: 51 * scale,
              top: 21 * scale
            }
          ]}
        />
      </View>
      {showLabel && <Text style={[styles.label, { color: labelColor }]} numberOfLines={2}>{mark.label}</Text>}
    </View>
  );
}

export function getProfileMarkLabel(index = 0) {
  return avatarMarks[index % avatarMarks.length]?.label ?? avatarMarks[0].label;
}

const styles = StyleSheet.create({
  wrapperWithLabel: {
    alignItems: "center",
    gap: 6,
    width: 82
  },
  mark: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  backdropRing: {
    position: "absolute",
    width: "74%",
    height: "74%",
    borderRadius: 999,
    opacity: 0.16
  },
  shoulder: {
    position: "absolute",
    opacity: 0.98
  },
  chest: {
    position: "absolute",
    opacity: 0.96
  },
  neck: {
    position: "absolute",
    opacity: 0.98
  },
  head: {
    position: "absolute"
  },
  crest: {
    position: "absolute",
    opacity: 0.96
  },
  facePatch: {
    position: "absolute",
    opacity: 0.94
  },
  collar: {
    position: "absolute",
    opacity: 0.9
  },
  eye: {
    position: "absolute",
    backgroundColor: "#0E1715"
  },
  beak: {
    position: "absolute",
    width: 0,
    height: 0,
    borderTopColor: "transparent",
    borderBottomColor: "transparent"
  },
  label: {
    minHeight: 28,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold",
    textAlign: "center"
  }
});
