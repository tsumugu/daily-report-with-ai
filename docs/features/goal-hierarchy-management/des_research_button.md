# ボタンデザインリサーチ：Secondary Buttonの改善

**作成日**: 2025-01-XX  
**作成者**: Des  
**目的**: Secondary Buttonの「浮いている」問題を解決するためのリサーチ

---

## リサーチ結果

### 1. 一般的なベストプラクティス

#### Secondary Buttonのスタイル

**推奨されるスタイル**:

- **アウトラインボタン**: ボタンの枠線のみを表示し、背景は透明にする
- **フラットデザイン**: 影（box-shadow）を最小限に抑え、フラットな見た目にする

**理由**:

- プライマリボタンとの視覚的な差別化が明確
- フラットデザインのトレンドに合致
- デジタル庁のデザインシステムでも推奨されている

#### ボタンの視覚的階層

- **プライマリボタン**: 塗りつぶしスタイル（背景色あり、影あり）
- **セカンダリボタン**: アウトラインスタイル（枠線のみ、背景透明、影なし）

### 2. 現在の実装の問題点

#### Secondary Button（現在）

- 背景色が塗りつぶし（`var(--color-secondary-600)`）
- hover時に`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)`が追加される（浮いている感じ）
- `transform: scale(1.02)`で拡大する

#### Outline Button（現在）

- 枠線のみ（`border: 1px solid var(--color-primary-600)`）
- 背景透明
- hover時に`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)`が追加される

#### Add Button（現在）

- 破線の枠線（`border: 2px dashed var(--color-primary-300)`）
- 背景透明
- 影なし（フラット）

### 3. 推奨される解決策

#### オプション1: Secondary ButtonをOutlineスタイルに変更（推奨）

**メリット**:

- 一般的なベストプラクティスに合致
- プライマリボタンとの差別化が明確
- フラットデザインで「浮いている」問題を解決

**変更内容**:

- 背景色を透明に
- 枠線を追加
- hover時の`box-shadow`を削除または最小限に
- `transform: scale()`を削除

#### オプション2: Secondary Buttonをフラットにする

**メリット**:

- 既存のsecondary buttonの色を維持
- 影を削除することで「浮いている」問題を解決

**変更内容**:

- hover時の`box-shadow`を削除
- `transform: scale()`を削除または最小限に

### 4. 結論

**推奨**: オプション1（Secondary ButtonをOutlineスタイルに変更）

**理由**:

1. 一般的なデザインシステムのベストプラクティスに合致
2. プライマリボタンとの視覚的な差別化が明確
3. フラットデザインで「浮いている」問題を解決
4. デジタル庁のデザインシステムでも推奨されている

**実装方針**:

- Secondary ButtonをOutlineスタイルに変更
- 色は`var(--color-primary-600)`を使用（プライマリ色のアウトラインで統一）
- hover時の`box-shadow`を削除
- `transform: scale()`を削除
- Outline variantを削除し、Secondaryに統合

---

## 参考資料

- [デジタル庁 デザインシステム - ボタン](https://design.digital.go.jp/dads/components/button/)
- [Button Design Tips for UI Design](https://coliss.com/articles/build-websites/operation/work/button-design-tips-for-ui-design.html)
- [Buttons in UI Design: The Evolution of Style and Best Practices](https://postd.cc/buttons-in-ui-design-the-evolution-of-style-and-best-practices/)
