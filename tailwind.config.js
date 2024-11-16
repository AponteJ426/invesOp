/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Amplía la búsqueda para todos los archivos de componentes
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#93c5fd', // azul claro
          DEFAULT: '#3b82f6', // azul principal
          dark: '#1e3a8a', // azul oscuro
        },
        secondary: {
          light: '#a5b4fc',
          DEFAULT: '#6366f1',
          dark: '#4338ca',
        },
        accent: '#f59e0b', // color de acento
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Ejemplo con la fuente 'Inter'
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        '3xl': '0 10px 15px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Mejora los estilos de formularios
    require('@tailwindcss/typography'), // Mejor tipografía en el texto
    require('@tailwindcss/aspect-ratio'), // Proporciones de aspecto para imágenes o videos
  ],
}
