/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))',
          accent: 'hsl(var(--sidebar-accent))',
        },
        neon: {
          cyan: 'hsl(180 100% 50%)',
          green: 'hsl(135 100% 50%)',
          purple: 'hsl(265 90% 68%)',
          amber: 'hsl(38 100% 56%)',
          blue: 'hsl(210 100% 56%)',
          rose: 'hsl(340 90% 60%)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Poppins', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px -2px hsl(180 100% 50% / 0.5), 0 0 30px -5px hsl(180 100% 50% / 0.25)',
        'neon-green': '0 0 15px -2px hsl(135 100% 50% / 0.5), 0 0 30px -5px hsl(135 100% 50% / 0.25)',
        'neon-purple': '0 0 15px -2px hsl(265 90% 68% / 0.5), 0 0 30px -5px hsl(265 90% 68% / 0.25)',
        'neon-amber': '0 0 15px -2px hsl(38 100% 56% / 0.5), 0 0 30px -5px hsl(38 100% 56% / 0.25)',
        'neon-glow': '0 0 20px -3px hsl(var(--primary) / 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2.5s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 18px hsl(var(--primary) / 0.8))' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
};
