/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  Obsidian_dark: {
    text: "#edf6ff",
    background: "#07111f",
    backgroundElement: "#0b1728",
    backgroundSelected: "#101f33",
    textSecondary: "#8295aa",
    primary: "#38bdf8",
    primaryLightTab: "rgba(13, 186, 233, 0.92)",
    primaryLight: "rgba(56, 189, 248, 0.15)",
    accent: "#22d3ee",
    danger: "#ef4444",
    dangerBg: "rgba(239, 68, 68, 0.18)",
    warning: "#f59e0b",
    warningBg: "rgba(245, 158, 11, 0.18)",
    success: "#22c55e",
    successBg: "rgba(34, 197, 94, 0.15)",
    card: "#0d1b2d",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    surface: "#07111f",
    tint: "#38bdf8",
  },
  light: {
    text: "#0F172A",
    background: "#EEF2F6",
    backgroundElement: "#E2E8F0",
    backgroundSelected: "#CBD5E1",
    textSecondary: "#64748B",
    primary: "#0284C7",
    primaryLight: "#E0F2FE",
    primaryLightTab: "#E0F2FE",
    accent: "#0891B2",
    danger: "#DC2626",
    dangerBg: "#FEF2F2",
    warning: "#D97706",
    warningBg: "#FFFBEB",
    success: "#16A34A",
    successBg: "#F0FDF4",
    card: "#FFFFFF",
    cardBorder: "#CBD5E1",
    surface: "#FFFFFF",
    tint: "#0284C7",
  },
  dark: {
    text: "#edf6ff",
    background: "#030303",
    backgroundElement: "#0b0b0c",
    backgroundSelected: "#090909",
    textSecondary: "#bdc2c8",
    primary: "#28bdf8",
    primaryLight: "rgba(56, 189, 248, 0.15)",
    primaryLightTab: "rgba(0, 179, 255, 0.94)",
    accent: "#22d3ee",
    danger: "#ef4444",
    dangerBg: "rgba(2, 2, 2, 0.18)",
    warning: "#f59e0b",
    warningBg: "rgba(245, 158, 11, 0.18)",
    success: "#22c55e",
    successBg: "rgba(34, 197, 94, 0.15)",
    card: "#0b0b0b",
    cardBorder: "rgba(248, 244, 244, 0.58)",
    surface: "#07111f",
    tint:"#0284C7",
  },
  ocean: {
    text: "#F0FDF4",
    background: "#020B1A",
    backgroundElement: "#133A6B",
    backgroundSelected: "#1C5499",
    textSecondary: "#8EB4DA",
    primary: "#38BDF8",
    primaryLight: "rgba(56, 189, 248, 0.25)",
    primaryLightTab: "rgba(16, 170, 235, 0.87)",
    accent: "#00E5FF",
    danger: "#F87171",
    dangerBg: "rgba(239, 68, 68, 0.25)",
    warning: "#FBBF24",
    warningBg: "rgba(245, 158, 11, 0.25)",
    success: "#34D399",
    successBg: "rgba(16, 185, 129, 0.25)",
    card: "#0C2548",
    cardBorder: "rgba(34, 211, 238, 0.36)",
    surface: "#051630",
    tint: "#38BDF8",
  },
} as const;

export type AppTheme = "system" | "dark" | "light" | "ocean";
export type ResolvedTheme = "dark" | "light" | "ocean";
export type ThemeColor =
  | "text"
  | "background"
  | "backgroundElement"
  | "backgroundSelected"
  | "textSecondary"
  | "primary"
  | "primaryLight"
  | "primaryLightTab"
  | "accent"
  | "danger"
  | "dangerBg"
  | "warning"
  | "warningBg"
  | "success"
  | "successBg"
  | "card"
  | "cardBorder"
  | "surface"
  | "tint";

export type ColorPalette = Record<ThemeColor, string>;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
