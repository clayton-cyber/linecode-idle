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
        vscode: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          activitybar: '#333333',
          titlebar: '#323233',
          statusbar: '#007acc',
          tabActive: '#1e1e1e',
          tabInactive: '#2d2d2d',
          border: '#3c3c3c',
          hover: '#2a2d2e',
          input: '#3c3c3c',
          blue: '#007acc',
          blueHover: '#0e639c',
          green: '#4ec9b0',
          yellow: '#dcdcaa',
          orange: '#ce9178',
          purple: '#c586c0',
          text: '#cccccc',
          textBright: '#ffffff',
          textMuted: '#858585',
          lineActive: '#282828',
          editorHover: '#264f78',
        },
        vscodelight: {
          bg: '#ffffff',
          sidebar: '#f3f3f3',
          activitybar: '#2c2c2c',
          titlebar: '#dddddd',
          statusbar: '#007acc',
          tabActive: '#ffffff',
          tabInactive: '#ececec',
          border: '#e4e4e4',
          hover: '#e8e8e8',
          input: '#ffffff',
          blue: '#007acc',
          blueHover: '#005999',
          text: '#3b3b3b',
          textBright: '#1e1e1e',
          textMuted: '#717171',
          lineActive: '#f3f3f3',
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Segoe UI', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        pulseSuccess: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        pulseSuccess: 'pulseSuccess 0.35s ease-in-out',
        slideUp: 'slideUp 0.2s ease-out forwards',
      }
    },
  },
  plugins: [],
}
