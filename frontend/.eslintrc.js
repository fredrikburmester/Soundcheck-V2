module.exports = {
    env: {
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'prettier'],
    rules: {
        // override/add rules settings here, such as:
        // 'vue/no-unused-vars': 'error'
        'vue/require-default-prop': 'off',
        'no-unused-vars': [1],
        'vue/no-unused-components': [1],
        'vue/no-parsing-error': [1],
    },
}
