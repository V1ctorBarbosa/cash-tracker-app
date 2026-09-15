/**
 * Design tokens for the app's "ink on paper" visual identity (Cash Track design, direction 1a).
 * Colors are centralized here, keyed by light/dark, and read through useTheme() (@/hooks/use-theme)
 * for a value that switches at runtime with the system color scheme -- nothing should hardcode a
 * hex value inline. There is no dark variant of this design yet, so Colors.dark currently mirrors
 * Colors.light (same placeholder pattern food-track used before its own dark palette existed).
 * The actual values live in palette.json, the one source both this file and tailwind.config.js
 * read from -- see the comment there for why NativeWind's `ct-*` utility classes need that
 * indirection instead of importing this file.
 */

import palette from '@/constants/palette.json';

export const Colors = {
  light: palette.light,
  dark: palette.dark,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Ordered color sequence for chart categories (spend by tag, spend by payment method) — cycles if there are more categories than colors. */
export const CategoricalChartColors = ['#3f4a35', '#6c7f57', '#7f9165', '#9fb2bb', '#c9b99a', '#b9b3a1'] as const;

export function categoricalColorAt(index: number): string {
  return CategoricalChartColors[index % CategoricalChartColors.length];
}

/** The fixed set of colors a user can assign to a tag (nova tag's color picker). */
export const TagColorSwatches = ['#3f4a35', '#6c7f57', '#8aa07f', '#9fb2bb', '#4a5f6b', '#c9b99a', '#8c4a33', '#b9b3a1'] as const;

/** Font family names as registered with useFonts() in the root layout — match @expo-google-fonts export names exactly. */
export const FontFamily = {
  displayWordmark: 'Michroma_400Regular',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  body: 'Saira_400Regular',
  bodyMedium: 'Saira_500Medium',
  bodySemiBold: 'Saira_600SemiBold',
  bodyBold: 'Saira_700Bold',
  bodyExtraBold: 'Saira_800ExtraBold',
} as const;

/** The three loader sizes drawn in the design -- large for a whole page, medium inline with a label, small for a tight space. */
export const LoaderSize = {
  large: 52,
  medium: 30,
  small: 16,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;
