module.exports = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/Components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			screens: {
				xs: '319px',
				xm: '390px'
			},
			brightness: {
				'30': '.30'
			},
			colors: {
				primary: {
					'100': 'rgb(var(--color-primary-100) / <alpha-value>)',
					'150': 'rgb(var(--color-primary-150) / <alpha-value>)',
					'200': 'rgb(var(--color-primary-200) / <alpha-value>)',
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					'100': 'rgb(var(--color-secondary-100) / <alpha-value>)',
					'200': 'rgb(var(--color-secondary-200) / <alpha-value>)',
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				typography: {
					'100': 'rgb(var(--color-typography-100) / <alpha-value>)',
					'200': 'rgb(var(--color-typography-200) / <alpha-value>)',
					'300': 'rgb(var(--color-typography-300) / <alpha-value>)',
					'400': 'rgb(var(--color-typography-400) / <alpha-value>)',
					'500': 'rgb(var(--color-typography-500) / <alpha-value>)',
					'600': 'rgb(var(--color-typography-600) / <alpha-value>)',
					'700': 'rgb(var(--color-typography-700) / <alpha-value>)',
					'800': 'rgb(var(--color-typography-800) / <alpha-value>)',
					'900': 'rgb(var(--color-typography-900) / <alpha-value>)'
				},
				surface: {
					'100': 'rgb(var(--color-surface-100) / <alpha-value>)',
					'200': 'rgb(var(--color-surface-200) / <alpha-value>)',
					'300': 'rgb(var(--color-surface-300) / <alpha-value>)'
				},
				success: {
					'100': 'rgb(var(--color-typography-900) / <alpha-value>)'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	variants: {
		fill: ['hover', 'focus'], // this line does the trick
	},
	plugins: [require("tailwindcss-animate")]
}
