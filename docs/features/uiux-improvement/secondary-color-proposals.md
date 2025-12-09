# Secondary Color 候補提案

## Primary Color（基準色）

- **Amber（オレンジ）**: `#f59e0b`
- **特徴**: エネルギー・活力を表現、若々しく前向きな印象

---

## 候補1: Yellow-Orange（イエローオレンジ）【現在の選択】

### カラーパレット

```scss
--color-secondary-50: #fefce8;
--color-secondary-100: #fef9c3;
--color-secondary-200: #fef08a;
--color-secondary-300: #fde047;
--color-secondary-400: #facc15;
--color-secondary-500: #eab308;  ← メイン
--color-secondary-600: #ca8a04;
--color-secondary-700: #a16207;
--color-secondary-800: #854d0e;
--color-secondary-900: #713f12;
```

### 特徴

- ✅ **隣接配色**: 色相環上でAmberの隣接色（調和が取れる）
- ✅ **明るい印象**: より明るく、ポジティブな印象
- ✅ **コントラスト**: Primaryとの差が適度で、区別しやすい
- ✅ **アクセシビリティ**: 白テキストとのコントラスト比が良好

### 使用シーン

- 補助的なアクション（キャンセル、戻るなど）
- ハイライト表示
- 装飾的な要素

### 視覚的な印象

- 暖色系の統一感
- 明るくエネルギッシュ
- 若々しい印象

---

## 候補2: Red-Orange（レッドオレンジ）

### カラーパレット

```scss
--color-secondary-50: #fff1f2;
--color-secondary-100: #ffe4e6;
--color-secondary-200: #fecdd3;
--color-secondary-300: #fda4af;
--color-secondary-400: #fb7185;
--color-secondary-500: #f43f5e;  ← メイン
--color-secondary-600: #e11d48;
--color-secondary-700: #be123c;
--color-secondary-800: #9f1239;
--color-secondary-900: #881337;
```

### 特徴

- ✅ **隣接配色**: 色相環上でAmberの反対側の隣接色
- ⚠️ **注意**: Errorカラー（Red）と近いため、意味の混同に注意
- ✅ **強いコントラスト**: Primaryとの差が明確
- ✅ **アクセシビリティ**: 白テキストとのコントラスト比が良好

### 使用シーン

- 重要なアクション（削除、警告など）
- 強調表示
- 注意喚起が必要な要素

### 視覚的な印象

- 暖色系の統一感
- 力強く、インパクトがある
- 注意を引く

### 注意点

- Errorカラー（`#ef4444`）と近いため、意味の区別が必要
- 警告や削除アクションとの使い分けに注意

---

## 候補3: Teal（ティール/青緑）

### カラーパレット

```scss
--color-secondary-50: #f0fdfa;
--color-secondary-100: #ccfbf1;
--color-secondary-200: #99f6e4;
--color-secondary-300: #5eead4;
--color-secondary-400: #2dd4bf;
--color-secondary-500: #14b8a6;  ← メイン
--color-secondary-600: #0d9488;
--color-secondary-700: #0f766e;
--color-secondary-800: #115e59;
--color-secondary-900: #134e4a;
```

### 特徴

- ✅ **補色関係**: 色相環上でAmberの補色に近い（対比が美しい）
- ✅ **落ち着いた印象**: クールでプロフェッショナル
- ✅ **明確な区別**: Primaryとの差が大きく、役割が明確
- ✅ **アクセシビリティ**: 白テキストとのコントラスト比が良好

### 使用シーン

- 補助的なアクション
- 情報表示
- 装飾的な要素

### 視覚的な印象

- 暖色と寒色の対比（バランスが良い）
- 落ち着いた印象
- プロフェッショナル

### 注意点

- Successカラー（`#10b981`）と近いため、意味の区別が必要

---

## 候補4: Slate（スレート/グレー系）

### カラーパレット

```scss
--color-secondary-50: #f8fafc;
--color-secondary-100: #f1f5f9;
--color-secondary-200: #e2e8f0;
--color-secondary-300: #cbd5e1;
--color-secondary-400: #94a3b8;
--color-secondary-500: #64748b;  ← メイン
--color-secondary-600: #475569;
--color-secondary-700: #334155;
--color-secondary-800: #1e293b;
--color-secondary-900: #0f172a;
```

### 特徴

- ✅ **ニュートラル**: 色相を持たないため、どの色とも調和
- ✅ **控えめ**: Primaryを引き立てる
- ✅ **汎用性**: 様々なシーンで使用可能
- ✅ **アクセシビリティ**: 白テキストとのコントラスト比が良好（600以上）

### 使用シーン

- 補助的なアクション（キャンセル、戻るなど）
- 背景色
- ボーダー、区切り線

### 視覚的な印象

- シンプルで落ち着いた印象
- Primaryが際立つ
- プロフェッショナル

### 注意点

- 既存のGrayカラーと重複する可能性
- 色相がないため、アクセントとしての役割が弱い

---

## 候補5: Indigo（インディゴ/青紫）

### カラーパレット

```scss
--color-secondary-50: #eef2ff;
--color-secondary-100: #e0e7ff;
--color-secondary-200: #c7d2fe;
--color-secondary-300: #a5b4fc;
--color-secondary-400: #818cf8;
--color-secondary-500: #6366f1;  ← メイン
--color-secondary-600: #4f46e5;
--color-secondary-700: #4338ca;
--color-secondary-800: #3730a3;
--color-secondary-900: #312e81;
```

### 特徴

- ✅ **補色関係**: 色相環上でAmberの補色（対比が美しい）
- ✅ **落ち着いた印象**: クールでプロフェッショナル
- ✅ **明確な区別**: Primaryとの差が大きく、役割が明確
- ✅ **アクセシビリティ**: 白テキストとのコントラスト比が良好

### 使用シーン

- 補助的なアクション
- 情報表示
- 装飾的な要素

### 視覚的な印象

- 暖色と寒色の対比（バランスが良い）
- 落ち着いた印象
- プロフェッショナル

---

## 比較表

| 候補                 | 色相関係     | 印象                         | コントラスト | 注意点              |
| -------------------- | ------------ | ---------------------------- | ------------ | ------------------- |
| **1. Yellow-Orange** | 隣接色       | 明るくエネルギッシュ         | 中           | なし                |
| **2. Red-Orange**    | 隣接色       | 力強くインパクト             | 高           | Errorカラーと近い   |
| **3. Teal**          | 補色         | 落ち着いたプロフェッショナル | 高           | Successカラーと近い |
| **4. Slate**         | ニュートラル | シンプルで控えめ             | 中           | Grayカラーと重複    |
| **5. Indigo**        | 補色         | 落ち着いたプロフェッショナル | 高           | なし                |

---

## 推奨

### 推奨1: Yellow-Orange（現在の選択）

- **理由**: 隣接配色で調和が取れ、明るくポジティブな印象
- **適用**: 補助的なアクション、ハイライト表示

### 推奨2: Teal

- **理由**: 補色関係で対比が美しく、落ち着いた印象
- **適用**: 補助的なアクション、情報表示

### 推奨3: Slate

- **理由**: ニュートラルで汎用性が高く、Primaryを引き立てる
- **適用**: 補助的なアクション、背景色

---

## 実装方法

各候補をStorybookプロトタイプで実装し、以下で比較：

- 実際の画面での見た目
- Primaryとの調和
- アクセシビリティ（コントラスト比）
- 意味の区別（Error/Successカラーとの関係）
