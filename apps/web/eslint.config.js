import baseConfig from '../../eslint.config.js';
import angular from 'angular-eslint';

/**
 * Web (Angular) 固有のESLint設定
 * ベース設定を継承し、Angular環境に特化したルールを追加
 */
export default [
  ...baseConfig,

  // TypeScriptファイル用の設定
  ...angular.configs.tsRecommended.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    processor: angular.processInlineTemplates,
    rules: {
      // Angularディレクティブのセレクター規則
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],

      // Angularコンポーネントのセレクター規則
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      // ControlValueAccessorなどで空関数が必要な場合は無効化コメントを使用
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },

  // HTMLテンプレートファイル用の設定
  ...angular.configs.templateRecommended.map((config) => ({
    ...config,
    files: ['**/*.html'],
  })),
  ...angular.configs.templateAccessibility.map((config) => ({
    ...config,
    files: ['**/*.html'],
  })),
];
