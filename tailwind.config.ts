import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#05070D',
          2: '#0B0F1A',
        },
        metal: {
          100: '#EDEFF2',
          400: '#B7BEC9',
          800: '#4A4F58',
        },
        accent: {
          blue: '#4FC3F7',
          violet: '#8B6BF2',
          gold: '#FFC857',
        },
        'text-dim': '#8A93A3',
      },
      fontFamily: {
        display: ['var(--font-display)', 'cursive'],
        body: ['var(--font-body)', 'sans-serif'],
        hud: ['var(--font-hud)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
