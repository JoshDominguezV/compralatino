import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        muted: '#6b7280',
        subtle: '#9ca3af',
        line: '#e5e7eb',
        paper: '#f9fafb',
        accent: { DEFAULT: '#2563eb', soft: '#eff6ff' },
        success: '#16a34a',
        danger: '#dc2626'
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 12px 32px -12px rgba(17,24,39,.18)' },
      borderRadius: { lg: '12px', xl: '16px' }
    }
  },
  plugins: []
};
export default config;
