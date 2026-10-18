/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eff9fb',
                    100: '#d6f0f5',
                    200: '#aee0ea',
                    300: '#7ac9da',
                    400: '#41abbf',
                    500: '#1f8da5', // primary
                    600: '#177087',
                    700: '#165b6e',
                    800: '#164a5b',
                    900: '#173e4d',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
            },
            boxShadow: {
                card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
                soft: '0 4px 16px -4px rgb(15 42 51 / 0.08)',
            },
            borderRadius: {
                xl: '0.875rem',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: 0, transform: 'translateY(4px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.2s ease-out',
            },
        },
    },
    plugins: [],
};
