import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

import baseConfig from "@acme/tailwind-config/web";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    container: {
      padding: "2rem",
      center: true,
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        "shine-pulse": {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      fontFamily: {
        sans: [
          "var(--font-opensans)",
          "var(--font-geist-sans)",
          ...fontFamily.sans,
        ],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      typography: (theme: (variable: string) => string) => ({
        DEFAULT: {
          css: {
            maxWidth: "1280px",
            p: {
              fontWeight: "400",
              fontSize: "16px",
              lineHeight: "1.5",
            },
            h1: {
              fontWeight: "500", // 500
              color: theme("colors.blue.800"),
              fontSize: "36px",
            },
            h2: {
              fontWeight: "400",
              color: theme("colors.blue.800"),
              fontSize: "24px",
            },
            h3: {
              fontWeight: "400",
              color: theme("colors.blue.800"),
              fontSize: "18px",
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    addVariablesForColors,
  ],
} satisfies Config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ":root": newVars,
  });
}
