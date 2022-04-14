module.exports = {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        minHeight: {
            '1/2': '50%',
            '7/10': '70%',
            '8/10': '80%',
            '9/10': '90%',
            '10/10': '100%',
        },
        zIndex: {
            100: 100,
        },
        extend: {},
    },
    plugins: [require('daisyui')],
    daisyui: {
        styled: true,
        base: true,
        utils: true,
        logs: true,
        rtl: false,
        prefix: '',
        themes: [
            {
                forest: {
                    ...require('daisyui/src/colors/themes')['[data-theme=forest]'],
                    'base-100': '#1F1F1E',
                    'base-300': '#282828',
                    'neutral-content': '#e8e8e8',
                    success: '#1EB854',
                    primary: '#1EB854',
                    secondary: '#F77F00',
                    error: '#D62828',
                },
            },
        ],
    },
}
