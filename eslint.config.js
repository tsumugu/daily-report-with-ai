import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * 共通ESLint設定
 * すべてのワークスペース（API、Web）で共有される基本ルール
 */
export default tseslint.config(
  // グローバルignore設定
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.angular/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/docs/**/*.js', // プロトタイプファイル（実装コードではない）
    ],
  },

  // JavaScript推奨設定
  js.configs.recommended,

  // TypeScript推奨設定（TypeScriptファイルのみに適用）
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  ...tseslint.configs.stylistic.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),

  // プロジェクト全体の共通ルール（TypeScriptファイルのみ）
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // 未使用変数のエラー（_で始まる変数は除外）
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // anyは警告レベル（完全禁止ではない）
      '@typescript-eslint/no-explicit-any': 'warn',

      // console.logは警告（warn, errorは許可）
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // constを優先
      'prefer-const': 'error',

      // アロー関数の暗黙的returnを許可
      'arrow-body-style': 'off',

      // 不要なコンストラクタを禁止
      '@typescript-eslint/no-useless-constructor': 'error',

      // 空の関数は警告（ControlValueAccessorなど正当な理由がある場合は無効化）
      '@typescript-eslint/no-empty-function': 'warn',
    },
  }
);
