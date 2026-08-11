/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'Inter', 'sans-serif'],
      },
      colors: {
        // ── Paleta paciente — pasteles cálidos ──
        sage: {
          50:  '#f0f7f0',
          100: '#dceddc',
          200: '#bbd9bb',
          300: '#8FBC8F',
          400: '#6ba86b',
          500: '#4f8c4f',
          600: '#3d6e3d',
        },
        lavender: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
        },
        peach: {
          50:  '#fff7f0',
          100: '#ffe8d6',
          200: '#ffd0b5',
          300: '#ffb088',
        },
        sky: {
          pastel: '#e0f2fe',
        },
        // ── Paleta psicólogo — profesional ──
        indigo: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4F46E5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // ── Colores de ánimo 1-10 ──
        mood: {
          1:  '#dc2626',
          2:  '#ea580c',
          3:  '#d97706',
          4:  '#ca8a04',
          5:  '#65a30d',
          6:  '#16a34a',
          7:  '#059669',
          8:  '#0d9488',
          9:  '#4f46e5',
          10: '#7c3aed',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'bounce-soft':'bounceSoft 0.4s ease-in-out',
        'scale-in':   'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:   { '0%': { transform: 'translateY(10px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        bounceSoft:{ '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.06)' } },
        scaleIn:   { '0%': { transform: 'scale(0.95)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
