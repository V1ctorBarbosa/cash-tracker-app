const palette = require('./src/constants/palette.json');

// Tailwind class colors are static at build time, so they always reflect the light palette for
// now. palette.light and palette.dark are identical until a real dark variant of this design
// exists -- see src/hooks/use-theme.ts for the runtime useTheme() hook that will pick between
// them for anything that must actually switch with the system color scheme. A `ct-*` class alone
// will NOT go dark on its own; pair it with a `dark:` variant, or read the color from useTheme()
// instead of NativeWind when it needs to react to color scheme.
const colors = palette.light;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'ct-ink': colors.ink,
        'ct-paper': colors.paper,
        'ct-card': colors.card,
        'ct-muted': colors.muted,
        'ct-divider': colors.divider,
        'ct-track': colors.track,
        'ct-accent': colors.accent,
        'ct-accent-deep': colors.accentDeep,
        'ct-danger': colors.danger,
      },
    },
  },
  plugins: [],
};
