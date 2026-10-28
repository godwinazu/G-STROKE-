import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        obsidian: '#0F0F11',
        charcoal: '#1B1B1E',
        borderDark: '#2C2C32',
        bone: '#FAF9F6',
        graphite: '#111113',
        accentGold: '#E6C280',
        mutedText: '#A1A1AA',
        paper: '#FFFFFF',
      },
      boxShadow: {
        gallery: '0 20px 45px rgba(15, 15, 17, 0.12)',
        gold: '0 18px 46px rgba(230, 194, 128, 0.25)',
      },
      backgroundImage: {
        'grain-soft': 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 40%)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
