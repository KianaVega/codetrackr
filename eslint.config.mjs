import eslintPkg from 'eslint';
const { defineConfig } = eslintPkg;

export default defineConfig({
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // General ESLint Rules
    'indent': ['error', 2],
    'eqeqeq': ['error', 'always'],
    'no-console': 'warn',
    'camelcase': ['error', { 'properties': 'always' }],
    'no-var': 'error',
    'space-before-function-paren': ['error', 'always'],
    'no-unused-vars': 'warn',
    'function-paren-newline': ['error', 'consistent'],
    'array-callback-return': 'error',
    'no-duplicate-imports': 'error',
    '@typescript-eslint/no-explicit-any': ['warn', { 'ignoreRestArgs': true }],
    'object-curly-spacing': ['error', 'always'],
    'no-else-return': 'error',
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/interface-name-prefix': ['error', 'always'],
        '@typescript-eslint/consistent-type-assertions': 'warn',
        '@typescript-eslint/no-explicit-any': ['warn'],
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/p
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.d.ts'],
      },
    },
  },
});
