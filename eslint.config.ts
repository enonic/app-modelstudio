import baseConfig from '@enonic/eslint-config';
import globals from 'globals';
import {plugin as tsPlugin} from 'typescript-eslint';

export default [
    ...baseConfig,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.es2023,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            'no-control-regex': 'off',
            'constructor-super': 'error',
            'prefer-const': 'off',
            'no-plusplus': 'off',
            'no-extra-boolean-cast': 'off',
            'no-prototype-builtins': 'off',
            'no-useless-escape': 'off',
            'no-empty-pattern': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/restrict-plus-operands': 'off',
            '@typescript-eslint/no-implied-eval': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            'comma-dangle': 'off',
            '@typescript-eslint/member-ordering': 'off',
            'spaced-comment': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-base-to-string': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/consistent-type-assertions': 'off',
            '@typescript-eslint/no-wrapper-object-types': 'off',
            '@typescript-eslint/only-throw-error': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/array-type': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/consistent-generic-constructors': 'off',
            '@typescript-eslint/consistent-indexed-object-style': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            '@typescript-eslint/prefer-function-type': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
        },
    },
    {
        ignores: [
            "vite.config.ts",
            "eslint.config.ts",
            "build/**/*",
            "dist/**/*",
            "node_modules/**/*",
            "**/.xp/**/*",
            "**/*.js",
            "**/*.d.ts",
        ]
    }
];
