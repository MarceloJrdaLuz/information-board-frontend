const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/Components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '319px',
      'xm': '390px'
    },
    extend: {
      brightness: {
        30: '.30',
      },
      colors: {
        primary: {
          100: "rgb(var(--color-primary-100) / <alpha-value>)",
          150: "rgb(var(--color-primary-150) / <alpha-value>)",
          200: "rgb(var(--color-primary-200) / <alpha-value>)",
        },
        secondary: {
          100: "rgb(var(--color-secondary-100) / <alpha-value>)",
          200: "rgb(var(--color-secondary-200) / <alpha-value>)",
        },
        typography: {
          100: "rgb(var(--color-typography-100) / <alpha-value>)",
          200: "rgb(var(--color-typography-200) / <alpha-value>)",
          300: "rgb(var(--color-typography-300) / <alpha-value>)",
          400: "rgb(var(--color-typography-400) / <alpha-value>)",
          500: "rgb(var(--color-typography-500) / <alpha-value>)",
          600: "rgb(var(--color-typography-600) / <alpha-value>)",
          700: "rgb(var(--color-typography-700) / <alpha-value>)",
          800: "rgb(var(--color-typography-800) / <alpha-value>)",
          900: "rgb(var(--color-typography-900) / <alpha-value>)"
        },
        surface: {
          100: "rgb(var(--color-surface-100) / <alpha-value>)",
          200: "rgb(var(--color-surface-200) / <alpha-value>)",
          300: "rgb(var(--color-surface-300) / <alpha-value>)",
        },
        success: {
          100: "#07bc0c"
        },
      }
    },
  },
  variants: {
    fill: ['hover', 'focus'], // this line does the trick
  }
})
