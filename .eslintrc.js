module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'eslint-config-next',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.base.json']
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Custom project rules can be added here
  }
};
