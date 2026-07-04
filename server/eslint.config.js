import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginJest from 'eslint-plugin-jest';

export default [
    {
        ignores: ['node_modules/', 'dist/', '.vscode/', 'eslint.config.js', 'jest.config.js'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',

            'prettier/prettier': ['error', { endOfLine: 'auto' }],
        },
    },

    {
        files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],
        ...pluginJest.configs['flat/recommended'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
];
