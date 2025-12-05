import baseConfig from '../../eslint.config.js';

/**
 * API固有のESLint設定
 * ベース設定を継承し、Node.js/Express環境に特化したルールを追加
 */
export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    rules: {
      // Node.js環境ではconsoleを許可
      'no-console': 'off',

      // サーバーサイドでは明示的なanyも許容
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
