import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    50: '#eef4ff',
                    100: '#d9e6ff',
                    200: '#bcd2ff',
                    300: '#8fb3ff',
                    400: '#5c8aff',
                    500: '#3b6bfa',
                    600: '#2650e0',
                    700: '#1f3fb3',
                    800: '#1c368c',
                    900: '#1b306f',
                },
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'spin-slow': {
                    to: { transform: 'rotate(360deg)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.25s ease-out',
                'spin-slow': 'spin-slow 1.4s linear infinite',
            },
        },
    },
    plugins: [],
};
