import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

const sharedRules = {
    quotes: ['warning', 'single', { avoidEscape: true }],
    semi: ['warning', 'always'],
    'comma-dangle': ['warning', 'always-multiline'],
    indent: ['warning', 4, { SwitchCase: 1 }],
    curly: ['warning', 'all'],
    'no-console': ['error', { allow: ['error'] }],
    'no-multi-spaces': 'warning',
    'no-trailing-spaces': 'warning',
    'eol-last': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-in-parens': ['error', 'never'],
    'keyword-spacing': 'warning',
    'comma-spacing': ['warning', { before: false, after: true }],
    'arrow-spacing': ['warning', { before: true, after: true }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'no-await-in-loop': 'error',
    'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    'simple-import-sort/imports': 'warning',
    'simple-import-sort/exports': 'warning',
};

export default [
    {
        ignores: ['dist/**', 'public/build/**', 'node_modules/**', 'coverage/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.ts'],
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: sharedRules,
    },
    {
        files: ['**/*.vue'],
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tseslint.parser,
                ecmaVersion: 'latest',
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            ...sharedRules,
            indent: 'off',
            'vue/html-indent': ['warning', 4],
            'vue/script-indent': ['warning', 4, { baseIndent: 0, switchCase: 1 }],
            'vue/max-attributes-per-line': [
                'warning',
                {
                    singleline: 3,
                    multiline: 1,
                },
            ],
            'vue/html-closing-bracket-newline': [
                'warning',
                {
                    singleline: 'never',
                    multiline: 'always',
                },
            ],
            'vue/multi-word-component-names': 'off',
        },
    },
];
