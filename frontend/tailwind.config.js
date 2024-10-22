/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./sidepanel.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#3777FF",
          "secondary": "#FFBE86",
          "accent": "#FFB5C2",
          "neutral": "#FFE156",
          "base-100": "#FFE9CE",
          "info": "#56c3ff",
          "success": "#41f200",
          "warning": "#ff9000",
          "error": "#fa0051",
        },
        dark: {
          "primary": "#3777FF",
          "secondary": "#FFBE86",
          "accent": "#FFB5C2",
          "neutral": "#FFE156",
          "base-100": "#1f2937",
          "info": "#56c3ff",
          "success": "#41f200",
          "warning": "#ff9000",
          "error": "#fa0051",
        },
      },
    ],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  theme: {
    extend: {
      textColor: {
        'text': 'var(--text)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
    typography: (theme) => ({
      DEFAULT: {
        css: {
          color: theme('colors.gray.900'),
          a: {
            color: theme('colors.blue.600'),
            '&:hover': {
              color: theme('colors.blue.800'),
            },
          },
        },
      },
      dark: {
        css: {
          color: theme('colors.gray.100'),
          a: {
            color: theme('colors.blue.400'),
            '&:hover': {
              color: theme('colors.blue.300'),
            },
          },
        },
      },
    }),
  },
};
