import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

const browserGlobals = {
    AbortController: 'readonly',
    Blob: 'readonly',
    console: 'readonly',
    CustomEvent: 'readonly',
    document: 'readonly',
    Event: 'readonly',
    fetch: 'readonly',
    FormData: 'readonly',
    HTMLButtonElement: 'readonly',
    HTMLElement: 'readonly',
    HTMLFormElement: 'readonly',
    HTMLInputElement: 'readonly',
    localStorage: 'readonly',
    location: 'readonly',
    MouseEvent: 'readonly',
    navigator: 'readonly',
    Node: 'readonly',
    Request: 'readonly',
    Response: 'readonly',
    setInterval: 'readonly',
    setTimeout: 'readonly',
    URL: 'readonly',
    URLSearchParams: 'readonly',
    window: 'readonly',
};

const sharedRules = {
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    indent: ['error', 4, { SwitchCase: 1 }],
    curly: ['error', 'all'],
    'no-console': ['error', { allow: ['error'] }],
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-in-parens': ['error', 'never'],
    'keyword-spacing': 'error',
    'comma-spacing': ['error', { before: false, after: true }],
    'arrow-spacing': ['error', { before: true, after: true }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'no-await-in-loop': 'error',
    'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
};

const sharedTypeScriptRules = {
    ...sharedRules,
    indent: 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
        'error',
        {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        },
    ],
};

const sharedTypeScriptLanguageOptions = {
    parser: tseslint.parser,
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: browserGlobals,
};

export default [
    {
        ignores: ['dist/**', 'public/build/**', 'node_modules/**', 'coverage/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.{ts,tsx,d.ts}'],
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        languageOptions: {
            ...sharedTypeScriptLanguageOptions,
        },
        rules: {
            ...sharedTypeScriptRules,
        },
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
            globals: browserGlobals,
        },
        rules: {
            ...sharedTypeScriptRules,
            'vue/html-indent': ['error', 4],
            'vue/script-indent': ['error', 4, { baseIndent: 0, switchCase: 1 }],
            'vue/max-attributes-per-line': [
                'error',
                {
                    singleline: 3,
                    multiline: 1,
                },
            ],
            'vue/html-closing-bracket-newline': [
                'error',
                {
                    singleline: 'never',
                    multiline: 'always',
                },
            ],
            'vue/component-name-in-template-casing': [
                'error',
                'PascalCase',
                {
                    registeredComponentsOnly: false,
                },
            ],
            'vue/block-order': [
                'error',
                {
                    order: ['template', 'script', 'style'],
                },
            ],
            'vue/multi-word-component-names': 'off',
        },
    },
];
