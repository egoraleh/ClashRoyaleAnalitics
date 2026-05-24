import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            '@stylistic': stylistic,
            react,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            '@stylistic/brace-style': ['error', '1tbs'],
            '@stylistic/comma-dangle': [
                'error',
                {
                    arrays: 'always-multiline',
                    objects: 'always-multiline',
                    imports: 'always-multiline',
                    exports: 'always-multiline',
                    functions: 'always-multiline',
                },
            ],
            '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
            '@stylistic/jsx-indent-props': ['error', 4],
            '@stylistic/jsx-quotes': ['error', 'prefer-single'],
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/semi': ['error', 'always'],
            curly: ['error', 'all'],
            'no-console': ['error', { allow: ['error'] }],
            'react/forbid-dom-props': ['error', { forbid: ['style'] }],
            'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
            'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'always' }],
        },
    },
];
