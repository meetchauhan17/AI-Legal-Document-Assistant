/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'clay-canvas': '#F4F1FA',
        'clay-foreground': '#332F3A',
        'clay-muted': '#635F69',
        'clay-accent': '#7C3AED',
        'clay-accent-alt': '#DB2777',
        'clay-tertiary': '#0EA5E9',
        'clay-success': '#10B981',
        'clay-warning': '#F59E0B',
        'clay-cardBg': '#FFFFFF',
        clay: {
          canvas: '#F4F1FA',
          foreground: '#332F3A',
          muted: '#635F69',
          accent: '#7C3AED',
          'accent-alt': '#DB2777',
          tertiary: '#0EA5E9',
          success: '#10B981',
          warning: '#F59E0B',
          cardBg: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          dark: '#6D28D9',
        },
        accent: {
          DEFAULT: '#DB2777',
          light: '#F472B6',
          dark: '#BE185D',
        },
        background: '#F4F1FA',
        surface: '#FFFFFF',
        'text-primary': '#332F3A',
        'text-secondary': '#635F69',
      },
      boxShadow: {
        shadowDeepClay: '0 24px 48px -12px rgba(51, 47, 58, 0.18), inset 0 2px 4px 0 rgba(255, 255, 255, 0.8), inset 0 -6px 12px 0 rgba(124, 58, 237, 0.12), inset 0 0 0 1.5px rgba(255, 255, 255, 0.6)',
        shadowClayCard: '0 16px 32px -8px rgba(51, 47, 58, 0.10), inset 0 2px 4px 0 rgba(255, 255, 255, 0.9), inset 0 -4px 8px 0 rgba(124, 58, 237, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.8)',
        shadowClayButton: '0 8px 16px -4px rgba(124, 58, 237, 0.35), inset 0 2px 3px 0 rgba(255, 255, 255, 0.6), inset 0 -3px 6px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
        shadowClayButtonHover: '0 12px 24px -4px rgba(124, 58, 237, 0.45), inset 0 2px 4px 0 rgba(255, 255, 255, 0.7), inset 0 -4px 8px 0 rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
        shadowClayPressed: '0 2px 4px 0 rgba(51, 47, 58, 0.10), inset 0 4px 8px 0 rgba(0, 0, 0, 0.15), inset 0 -1px 2px 0 rgba(255, 255, 255, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'deep-clay': '0 24px 48px -12px rgba(51, 47, 58, 0.18), inset 0 2px 4px 0 rgba(255, 255, 255, 0.8), inset 0 -6px 12px 0 rgba(124, 58, 237, 0.12), inset 0 0 0 1.5px rgba(255, 255, 255, 0.6)',
        'clay-card': '0 16px 32px -8px rgba(51, 47, 58, 0.10), inset 0 2px 4px 0 rgba(255, 255, 255, 0.9), inset 0 -4px 8px 0 rgba(124, 58, 237, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.8)',
        'clay-button': '0 8px 16px -4px rgba(124, 58, 237, 0.35), inset 0 2px 3px 0 rgba(255, 255, 255, 0.6), inset 0 -3px 6px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
        'clay-button-hover': '0 12px 24px -4px rgba(124, 58, 237, 0.45), inset 0 2px 4px 0 rgba(255, 255, 255, 0.7), inset 0 -4px 8px 0 rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
        'clay-pressed': '0 2px 4px 0 rgba(51, 47, 58, 0.10), inset 0 4px 8px 0 rgba(0, 0, 0, 0.15), inset 0 -1px 2px 0 rgba(255, 255, 255, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '60px': '60px',
        '48px': '48px',
        '32px': '32px',
        '24px': '24px',
        '20px': '20px',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
        heading: ['var(--font-nunito)', 'sans-serif'],
      },
      animation: {
        'clay-float': 'clay-float 8s ease-in-out infinite',
        'clay-float-delayed': 'clay-float-delayed 10s ease-in-out infinite',
        'clay-float-slow': 'clay-float-slow 12s ease-in-out infinite',
        'clay-breathe': 'clay-breathe 6s ease-in-out infinite',
      },
      keyframes: {
        'clay-float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        'clay-float-delayed': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-25px) rotate(-4deg)' },
        },
        'clay-float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg) scale(1.03)' },
        },
        'clay-breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.10' },
          '50%': { transform: 'scale(1.08)', opacity: '0.14' },
        },
      },
    },
  },
  plugins: [],
};
