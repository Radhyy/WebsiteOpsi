
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-surface": "#191c1e",
        "surface-container": "#eceef0",
        "on-secondary-fixed": "#001f2a",
        "primary-container": "#a7f3d0",
        "background": "#f7f9fb",
        "on-error-container": "#93000a",
        "on-secondary": "#ffffff",
        "tertiary-fixed": "#f2e580",
        "surface-container-highest": "#e0e3e5",
        "on-primary-container": "#247156",
        "on-secondary-container": "#3d687c",
        "on-secondary-fixed-variant": "#1e4c5f",
        "tertiary": "#695f02",
        "primary-fixed-dim": "#8bd6b4",
        "on-background": "#191c1e",
        "tertiary-container": "#f3e580",
        "surface-container-lowest": "#ffffff",
        "on-surface-variant": "#3f4943",
        "primary": "#1b6b4f",
        "on-error": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "on-tertiary-fixed-variant": "#4f4800",
        "on-tertiary-fixed": "#201c00",
        "outline": "#6f7973",
        "error": "#ba1a1a",
        "secondary": "#396477",
        "secondary-container": "#bae6fd",
        "surface-variant": "#e0e3e5",
        "secondary-fixed": "#bee9ff",
        "inverse-primary": "#8bd6b4",
        "surface-bright": "#f7f9fb",
        "on-primary-fixed": "#002115",
        "on-primary-fixed-variant": "#00513a",
        "outline-variant": "#bec9c2",
        "on-primary": "#ffffff",
        "surface": "#f7f9fb",
        "on-tertiary-container": "#6f660a",
        "on-tertiary": "#ffffff",
        "tertiary-fixed-dim": "#d5c867",
        "primary-fixed": "#a6f2cf",
        "surface-tint": "#1b6b4f",
        "inverse-on-surface": "#eff1f3",
        "secondary-fixed-dim": "#a1cde3",
        "inverse-surface": "#2d3133",
        "surface-dim": "#d8dadc",
        "surface-container-high": "#e6e8ea",
        "error-container": "#ffdad6"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "24px",
        "card-gap": "24px",
        "base": "8px",
        "section-margin": "48px",
        "container-padding": "32px"
      },
      fontFamily: {
        "body-lg": ["Nunito Sans", "sans-serif"],
        "body-md": ["Nunito Sans", "sans-serif"],
        "display-lg": ["Quicksand", "sans-serif"],
        "headline-lg": ["Quicksand", "sans-serif"],
        "headline-md": ["Quicksand", "sans-serif"],
        "label-md": ["Nunito Sans", "sans-serif"],
        "label-sm": ["Nunito Sans", "sans-serif"]
      },
      fontSize: {
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "700"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "600"}]
      }
    }
  },
  plugins: [],
};
