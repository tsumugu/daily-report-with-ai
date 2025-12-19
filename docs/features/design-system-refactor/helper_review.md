# Design System Refactor - Helper Review

**レビュー日**: 2025-12-19
**レビュアー**: Helper (Claude Code)

## 総合評価

**評価スコア**: 9/10 (非常に優秀)

提案されている3層Tier分類とディレクトリ構成は、現代のフロントエンド開発のベストプラクティスと高度に整合しており、実装推奨です。

---

## ✅ 優れている点

### 1. Tier 1 (共通UI) の設計

- **Atomic Design との整合性**: Atoms/Molecules 層に相当し、ドメイン非依存の純粋UI部品として定義
- **Dumb Component パターン**: `@Input`/`@Output` のみでデータを受け渡す設計は、Presentational Components のベストプラクティス
- **配置場所**: `shared/ui/` は一般的な命名規則で親和性が高い

### 2. Tier 2 (共通ドメインコンポーネント) の分離

- **Domain Components の明確化**: Separation of Concerns の原則に従い、ドメイン知識を持つコンポーネントを明確に分離
- **実務的なアプローチ**: 純粋な Atomic Design では扱いにくい「ドメイン依存だが再利用可能」なコンポーネントの配置場所を提供

### 3. Tier 3 (機能固有) のカプセル化

- **Feature-Based Structure**: `features/[feature-name]/components/` 構造は業界標準
- **疎結合**: 機能ごとのカプセル化は、Domain-Driven Design のモジュール分割と整合

---

## 📝 改善提案と反映内容

### 1. Storybook カテゴリの階層 ✅ 反映済み

**改善前**:

- Tier 1: `Design System/`
- Tier 2: `Domain/`

**改善後**:

- Tier 1: `Design System/UI Components/`
- Tier 2: `Design System/Domain Components/`

**理由**: Tier 2 も広義のデザインシステムの一部として扱い、Storybook での発見性を向上

### 2. HierarchyCard のリファクタリング方針 ✅ 反映済み

**推奨アプローチ**: ラベル文字を Input prop として受け取る

```typescript
@Input() levelName!: string;  // "長期目標", "中期目標", "短期目標" など外から渡す
```

**理由**:

- より柔軟で、国際化（i18n）にも対応しやすい
- コンポーネントがビジネスロジック（「長期目標」という概念）を持たない
- Pure UI Component のベストプラクティスに従う

### 3. Tier 1 の制約を明確化 ✅ 反映済み

**追加した制約**:

- `features/` のインポート**厳禁**
- ラベルやテキストは props で受け取る（ハードコード禁止）

### 4. 設計根拠の文書化 ✅ 反映済み

以下のベストプラクティスとの整合性を明記:

- Atomic Design（2025年版）
- Domain-Driven Design (DDD)
- Separation of Concerns (SoC)
- Feature-Based Architecture

---

## 🎯 ベストプラクティスとの比較

| 項目                    | 提案内容                            | 一般的なアプローチ            | 評価          |
| ----------------------- | ----------------------------------- | ----------------------------- | ------------- |
| **3層分類**             | Tier 1/2/3                          | Atomic Design + Feature-Based | ✅ 優秀       |
| **純粋UIの分離**        | `shared/ui/` (Dumb Components)      | Presentational Components     | ✅ 完璧       |
| **ドメイン層の定義**    | `shared/domain-components/`         | Domain Components             | ✅ 良好       |
| **機能のカプセル化**    | `features/[feature]/components/`    | Feature-Based Structure       | ✅ 標準的     |
| **Storybookファースト** | 実装と同時に登録                    | 業界標準                      | ✅ 推奨       |
| **制約の明確化**        | features/ のインポート禁止 (Tier 1) | Separation of Concerns        | ✅ 厳格で良い |

---

## 📚 参考文献

- [Atomic Design in 2025: From Rigid Theory to Flexible Practice](https://medium.com/design-bootcamp/atomic-design-in-2025-from-rigid-theory-to-flexible-practice-91f7113b9274)
- [Domain-Driven Design for UI Components](https://coryrylan.com/blog/domain-driven-design-for-ui-components-improving-consistency-and-quality)
- [Domain Driven Design and Functional Pure UI Components](https://dev.to/kmruiz/domain-driven-design-and-functional-pure-ui-components-29a7)
- [Best Practices for Keeping Your React UI and Logic Separate](https://www.dhiwise.com/post/mastering-the-art-of-separating-ui-and-logic-in-react)
- [React Best Practices for Folder Structure & System Design](https://javascript.plainenglish.io/react-best-practices-for-folder-structure-system-design-architecture-8fc2f09e3fff)
- [Domain-driven Design (DDD): File Structure](https://dev.to/stevescruz/domain-driven-design-ddd-file-structure-4pja)

---

## 🚀 次のステップ

1. **ドキュメント承認**: PdM による最終レビューと承認
2. **実装計画**: 移行ステップの詳細化（影響範囲の精査）
3. **段階的移行**: まず Tier 1 から実装し、動作確認後に Tier 2, 3 へ展開
4. **チーム共有**: 開発チーム全体への設計方針の共有と合意形成

---

## 📋 チェックリスト

- [x] 3層Tier分類の妥当性確認
- [x] Storybook カテゴリの改善提案
- [x] HierarchyCard リファクタリング方針の明確化
- [x] ベストプラクティスとの整合性確認
- [x] ドキュメントへの反映
- [ ] PdM レビュー（次のステップ）
- [ ] Eng との実装詳細レビュー（次のステップ）
