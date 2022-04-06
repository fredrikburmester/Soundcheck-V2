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
        themes: ['halloween'],
    },
}
