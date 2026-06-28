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
        primary:          { DEFAULT: '#F4B223', hover: '#D89A0D' },
        success:          '#3BAE5A',
        danger:           '#E64C3C',
        border:           '#E8E8E8',
        surface:          '#F8F8F8',
        muted:            '#FAFAFA',
        'text-secondary': '#666666',
      },
      borderRadius: {
        card:   '10px',
        banner: '12px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,.08)',
        md:   '0 8px 24px rgba(0,0,0,.12)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
