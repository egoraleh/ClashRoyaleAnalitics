export default {
    extends: ['stylelint-config-standard-scss'],
    plugins: ['@stylistic/stylelint-plugin'],
    ignoreFiles: ['dist/**', 'public/build/**', 'node_modules/**'],
    overrides: [
        {
            files: ['**/*.vue', '**/*.scss'],
            customSyntax: 'postcss-html',
        },
    ],
    rules: {
        '@stylistic/indentation': 4,
        '@stylistic/string-quotes': 'single',
        '@stylistic/no-eol-whitespace': true,
        '@stylistic/max-empty-lines': 1,
        'scss/dollar-variable-colon-space-after': 'always-single-line',
        'scss/dollar-variable-colon-space-before': 'never',
        'declaration-empty-line-before': 'never',
    },
};
