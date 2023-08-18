const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'home': "url('/images/fotosalao.png')",
        'designacoes': "url('/images/designacoes.png')",
        'cartas': "url('/images/cartas.jpg')",
        'contas': "url('/images/contas.jpg')",
        'limpeza': "url('/images/limpeza.jpg')",
        'campo': "url('/images/campo.png')"
      }),
      brightness: {
        30: '.30',
      },
      height: {
        0.5: '0.10rem'
      },
      colors: {
        cyan: {
          950: '#093e49'
        },
        fontColor: {
          100: '#374151',
          200: '#178582'
        },
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
  },
  plugins: [require("daisyui")],
  colors: {
    button: {
      'hover': '#e62e00',
      'disabled': '#ccc',
      'default': '#90caf9',
      'primary': '#f63e02',
    },
    modals: {
      'primary': '#302F3C',
    },
    principais: {
      'primary': '#ccc',
      'secondary': '#FAFAFA'
    }
  }
})
