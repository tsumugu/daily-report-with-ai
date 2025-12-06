# 機能開発フロー

1機能を開発する際の標準的な流れを定義します。

**各ロールの詳細ルールは `docs/rules/jobs/*.md` を参照**

---

## 全体フロー

```
Phase 1: 設計
├── [PdM] PRD作成
├── [Eng] Tech Spec作成
├── [Des] UI Design作成
└── クロスレビュー

Phase 2: 実装
├── [Eng] BE実装（TDD）
└── [Des] FE実装（Storybookファースト）

Phase 3: 検証
├── 結合テスト
└── E2Eテスト

Phase 4: 完了
├── [PdM] 受け入れ確認
└── 振り返り（Retro）
```

---

## Phase 1: 設計

### 成果物

| ロール | 成果物                             | 詳細ルール                 |
| ------ | ---------------------------------- | -------------------------- |
| PdM    | `prd.md`                           | → `docs/rules/jobs/pdm.md` |
| Eng    | `tech_research.md`, `tech_spec.md` | → `docs/rules/jobs/eng.md` |
| Des    | `des_research.md`, `ui_design.md`  | → `docs/rules/jobs/des.md` |

### クロスレビュー

Eng/Des間で `tech_spec.md` と `ui_design.md` の整合性を確認：

- UIが必要とするデータがAPIで提供されるか
- 齟齬があれば協議・調整

---

## Phase 2: 実装

### Eng（BE実装）

```bash
# TDDで実装
cd apps/api && npm run test:watch

# カバレッジ確認
npm run test:coverage
```

→ 詳細は `docs/rules/jobs/eng.md` を参照

### Des（FE実装）

```bash
# Storybookを起動しながら実装
npm run storybook
```

→ 詳細は `docs/rules/jobs/des.md` を参照

---

## Phase 3: 検証

```bash
# FE/BE起動
cd apps/api && npm run dev   # ターミナル1
cd apps/web && npm run dev   # ターミナル2

# E2Eテスト
cd apps/web && npm run e2e
```

---

## Phase 4: 完了

### 受け入れ確認

PdMがPRDの要件充足を確認

### 品質チェックリスト

- [ ] `npm run lint` パス
- [ ] `npm run test` パス（カバレッジ100%）
- [ ] `npm run e2e` パス
- [ ] Storybook に全コンポーネント反映

> ⚠️ **カバレッジ100%は必須**
> 詳細は `docs/general/test_rules.md` の「カバレッジ100%必須ルール」を参照

### 振り返り

`docs/retro/{feature_name}/` に以下を作成：

- `retro.md` - 全体まとめ
- 学びを `docs/rules/jobs/*.md` に反映

---

## クイックリファレンス

### コマンド一覧

| 目的            | コマンド                     |
| --------------- | ---------------------------- |
| API開発サーバー | `cd apps/api && npm run dev` |
| Web開発サーバー | `cd apps/web && npm run dev` |
| Storybook       | `npm run storybook`          |
| Lint            | `npm run lint`               |
| ユニットテスト  | `npm run test`               |
| カバレッジ      | `npm run test:coverage`      |
| E2Eテスト       | `cd apps/web && npm run e2e` |

### 参照ドキュメント

| ドキュメント                    | 内容                                       |
| ------------------------------- | ------------------------------------------ |
| `docs/rules/jobs/pdm.md`        | PdMルール（PRD作成方法等）                 |
| `docs/rules/jobs/eng.md`        | Engルール（TDD、コンポーネント設計等）     |
| `docs/rules/jobs/des.md`        | Desルール（Storybook、デザイントークン等） |
| `docs/general/test_rules.md`    | テストスニペット集                         |
| `docs/general/design_system.md` | デザインシステム                           |
