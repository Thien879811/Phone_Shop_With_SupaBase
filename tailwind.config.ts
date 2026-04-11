import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme palette
        'dark-bg': 'var(--bg-body)',
        'dark-sidebar': 'var(--bg-sidebar)',
        'dark-card': 'var(--bg-card)',
        'dark-card-hover': 'var(--bg-card-hover)',
        'dark-input': 'var(--bg-input)',
        
        'primary': 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        'accent': 'var(--accent)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'danger': 'var(--danger)',
        'info': 'var(--info)',
        
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border': 'var(--border)',
      },
      fontSize: {
        'xs': 'clamp(10px, 2vw, 12px)',
        'sm': 'clamp(12px, 2.5vw, 14px)',
        'base': 'clamp(14px, 3vw, 16px)',
        'lg': 'clamp(16px, 3.5vw, 18px)',
        'xl': 'clamp(18px, 4vw, 20px)',
        '2xl': 'clamp(20px, 4.5vw, 24px)',
        '3xl': 'clamp(24px, 5vw, 28px)',
        '4xl': 'clamp(28px, 6vw, 32px)',
      },
      spacing: {
        'safe': 'var(--safe-area)',
      },
      minWidth: {
        'touch': '44px',
        'clamp-search': 'clamp(200px, 80vw, 300px)',
      },
      minHeight: {
        'touch': '44px',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      borderColor: {
        'default': 'var(--border)',
        'light': 'var(--border-light)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'muted': 'var(--text-muted)',
      },
      backgroundColor: {
        'primary-bg': 'var(--primary-bg)',
        'success-bg': 'var(--success-bg)',
        'warning-bg': 'var(--warning-bg)',
        'danger-bg': 'var(--danger-bg)',
        'info-bg': 'var(--info-bg)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.25s ease',
        'slide-in-right': 'slideInRight 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      zIndex: {
        '100': '100',
        '900': '900',
        '1000': '1000',
        '1500': '1500',
        '2000': '2000',
        '3000': '3000',
      },
    },
    fontFamily: {
      'inter': ['Inter', 'sans-serif'],
    },
  },
  plugins: [],
} satisfies Config