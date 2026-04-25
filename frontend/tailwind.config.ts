import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // Custom breakpoints matching useBreakpoint hook
        'xs': '0px',      // mobile: < 400px
        'sm': '400px',    // tablet: 400px - 767px
        'lg': '768px',    // desktop: >= 768px
      },
      spacing: {
        'pt-14': '3.5rem',  // 56px for navbar padding
        'pt-18': '4.5rem',  // 72px for tablet
      },
    },
  },
  plugins: [],
} satisfies Config;
