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
          100: '#83c5be',
          200: '#178582',
        },
        secondary: {
          100: '#edf6f9',
          200: '#e9e9e9'
        },
        success: {
          100: "#07bc0c"
        }
      }
    },
  },
  variants: {
    fill: ['hover', 'focus'], // this line does the trick
  }
})
