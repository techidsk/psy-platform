/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',

        // Or if using `src` directory:
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            height: {
                'screen-96px': 'calc(100vh - 96px)',
            },
        },
    },
    daisyui: {
        themes: ['light'],
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
    // darkMode:'media' -- 如果要做深色模式适配再添加 https://esinger.gitee.io/tailwindcss/docs/dark-mode
};
