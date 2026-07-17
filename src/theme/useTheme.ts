import { palette } from "./tokens";

export function useTheme() {
  const dark = false;
  return {
    dark,
    bg: dark ? palette.dark : palette.paper,
    panel: dark ? palette.darkPanel : palette.glassLight,
    panelAlt: dark ? "rgba(24, 42, 37, 0.78)" : "rgba(214, 241, 229, 0.38)",
    text: dark ? palette.darkText : palette.ink,
    muted: dark ? palette.darkMuted : "#33433E",
    line: dark ? palette.darkLine : palette.glassLine,
    accent: dark ? palette.seafoam : palette.deepForest,
    success: dark ? "#9DB98F" : palette.sage,
    forest: dark ? palette.seafoam : palette.deepForest,
    serif: "PlayfairDisplay_700Bold",
    serifSoft: "PlayfairDisplay_600SemiBold",
    sans: "Inter_400Regular",
    sansMedium: "Inter_500Medium",
    sansSemi: "Inter_600SemiBold",
    sansBold: "Inter_700Bold"
  };
}

export type AppTheme = ReturnType<typeof useTheme>;
