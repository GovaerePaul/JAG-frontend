const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'android/**',
      'coverage/**',
      'electron/**',
      '*.config.js',
      '*.config.mjs',
      'jest.setup.js',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/**/*'
    ]
  }
];
