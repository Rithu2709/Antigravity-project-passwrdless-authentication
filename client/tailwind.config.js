/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neonBlue: '#00f3ff',
                neonGreen: '#00ff9d',
                darkBg: '#050505',
            },
            fontFamily: {
                mono: ['"Courier New"', 'Courier', 'monospace'],
            },
            textShadow: {
                cyan: '0 0 10px #00f3ff',
                red: '0 0 10px #ff0055',
            }
        },
    },
    plugins: [
        function ({ addUtilities }) {
            const newUtilities = {
                '.text-shadow-cyan': {
                    textShadow: '0 0 10px #00f3ff',
                },
                '.text-shadow-red': {
                    textShadow: '0 0 10px #ff0055',
                },
            }
            addUtilities(newUtilities)
        }
    ],
}
