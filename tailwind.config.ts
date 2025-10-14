import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Enable dark mode using a class
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light Theme
        primary: '#007AFF',
        'primary-hover': '#0056b3',
        'sent-bg': '#007AFF',
        'received-bg': '#F2F2F7',
        'bg-main': '#FFFFFF',
        'bg-light': '#F5F5F7',
        'text-dark': '#1c1c1e',
        'text-light': '#ffffff',
        'text-secondary': '#8A8A8E',
        'border-color': '#E5E5E5',

        // Dark Theme
        dark: {
          primary: '#0b84ff',
          'primary-hover': '#2563eb',
          'sent-bg': '#0b84ff',
          'received-bg': '#2c2c2e',
          'bg-main': '#121212',
          'bg-light': '#1c1c1e',
          'text-dark': '#e1e1e1',
          'text-light': '#ffffff',
          'text-secondary': '#8d8d92',
          'border-color': '#3a3a3c',
        },
      },
      borderRadius: {
        small: '8px',
        medium: '12px',
        large: '20px',
      },
      boxShadow: {
        light: '0 2px 12px rgba(0, 0, 0, 0.08)',
        medium: '0 4px 20px rgba(0, 0, 0, 0.12)',
        heavy: '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config
