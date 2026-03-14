/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          bg: '#FAF8F5',
          surface: '#FFFFFF',
          secondary: '#EFEBE3',
          border: '#E0D9CF',
          primary: '#C2A889',
          hover: '#A68E71',
          accent: '#8B9D83',
          text: '#3A3530',
          muted: '#7C756D',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pulse_ring: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        fade_up: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulse_ring: 'pulse_ring 1.2s ease-out infinite',
        fade_up: 'fade_up 0.4s ease forwards',
        shimmer: 'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [],
}
