/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0D12',
        surface: '#151822',
        surface2: '#1D212C',
        surface3: '#262B38',
        accent: {
          DEFAULT: '#F2A93B',
          dim: '#8A6A2E',
          soft: 'rgba(242, 169, 59, 0.14)',
        },
        good: {
          DEFAULT: '#3FC97A',
          soft: 'rgba(63, 201, 122, 0.14)',
        },
        bad: {
          DEFAULT: '#E5484D',
          soft: 'rgba(229, 72, 77, 0.14)',
        },
        ink: {
          DEFAULT: '#F4F5F7',
          muted: '#8A93A6',
          faint: '#525A6B',
        },
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(242,169,59,0.4), 0 0 24px -4px rgba(242,169,59,0.5)',
      },
      backgroundImage: {
        'dash-noise':
          'radial-gradient(120% 100% at 50% -10%, rgba(242,169,59,0.08) 0%, rgba(11,13,18,0) 55%)',
      },
    },
  },
  plugins: [],
};
