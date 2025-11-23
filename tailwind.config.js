/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float-particle': 'float-particle 2s ease-out forwards',
        'burst-particle': 'burst-particle 1.5s ease-out forwards',
        'pulse-ring-simple': 'pulse-ring-simple 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'ping-slow': 'ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin-slow 15s linear infinite',
        'spin-fast': 'spin-slow 4s linear infinite',
      },
      dropShadow: {
        'glow-cyan': [
          '0 0 10px rgba(6, 182, 212, 0.8)',
          '0 0 20px rgba(6, 182, 212, 0.5)',
        ],
        'glow-emerald': [
          '0 0 10px rgba(16, 185, 129, 0.8)',
          '0 0 20px rgba(16, 185, 129, 0.5)',
        ],
        'glow-rose': [
          '0 0 10px rgba(244, 63, 94, 0.8)',
          '0 0 20px rgba(244, 63, 94, 0.5)',
        ],
      },
    },
  },
  plugins: [],
}
