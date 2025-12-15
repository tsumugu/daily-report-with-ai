---
description: "Discovery専用フロー。問題の構造化、仮説立案、Decision-ready artifactsの作成からロードマップへのQueueまで"
alwaysApply: true
---

# Discovery フロー

Discovery は、機能開発フロー（Development Flow）とは独立したフローです。

**重要**: Discovery の成果物は、必ずしも直線的に機能開発フロー（Phase 1: 設計）につながるわけではありません。PdM が判断した結果、ロードマップに Queue される場合もあります。

---

## Discovery フローと Development フローの関係

```
Discovery Flow
├── [PDL] 問題の構造化・仮説立案
├── [PDL] Decision-ready artifacts 作成
└── [PdM] 判断（Adopt / Defer / Reject）
    │
    ├─→ Adopt → バックログに Queue
    │              │
    │              └─→ [PdM] バックログ管理
    │                      │
    │                      └─→ 適切なタイミングで Development Flow に進める
    │
    ├─→ Defer → ロードマップに Queue（中長期的にやりたいこと）
    │              │
    │              └─→ [PdM] ロードマップ管理
    │
    └─→ Reject → アーカイブ
```

**PdM の責務**:

- Discovery の成果物を判断し、Adopt したものはバックログに Queue する
- Defer したものはロードマップに Queue する（中長期的にやりたいこととして管理）
- バックログとロードマップを適切に管理し、優先順位を決定する
- 適切なタイミングで、バックログからアイテムを選択して Development Flow（Phase 1: 設計）に進める
- 定期的にバックログとロードマップの棚卸しを実施する

---

## 全体フロー

```
Phase 0: Discovery（PDL）
├── [Human] .discovery/inbox/ に悩み・違和感・思考ログを記述
├── [PDL] problem_statements.md 作成（問題の構造化）
├── [PDL] value_hypotheses.md 作成（仮説立案）
├── [PDL] requirements.md 作成（要求定義）
├── [PDL] handoff.md 作成（PdM への判断要約）
├── [PDL] critical_review.md 作成（批判的レビューとリサーチ）
├── [PDL] 批判的レビュー結果を成果物に反映
├── [Human] PDL の成果物に合意（Agreed between Human and PDL）
├── [Driver] フロー監視：Discovery 完了を確認
└── [PdM] handoff.md を起点に判断（Adopt / Defer / Reject）
    │
    ├─→ Adopt → バックログに Queue → [PdM] バックログ管理
    ├─→ Defer → ロードマップに Queue（中長期的にやりたいこと） → [PdM] ロードマップ管理
    └─→ Reject → .discovery/archived/ に移動
```

---

## 責務境界（最重要）

**PDL は `.discovery/` ディレクトリにのみ関与し、`docs/` や `src/` には一切関与しない。**

---

## 成果物

| ロール | 成果物                                                                                                | 詳細ルール              |
| ------ | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| PDL    | `problem_statements.md`, `value_hypotheses.md`, `requirements.md`, `handoff.md`, `critical_review.md` | → `.claude/jobs/pdl.md` |

---

## Discovery の開始

Human が `.discovery/inbox/` に悩み・違和感・思考ログを記述することで、Discovery が開始される。

---

## Problem Statements 作成

PDL が `.discovery/inbox/` の内容を起点に、`problem_statements.md` を作成：

- 生の悩みを、比較可能な「問題定義（P-xx）」に変換する
- 問題は行動や状態の変化として記述する
- feature を前提に考えない（Problem-First 原則）
- 問題は 3〜7 個程度に整理する

---

## Value Hypotheses 作成

PDL が `value_hypotheses.md` を作成：

- 問題が解決された場合に起きる行動変化を仮説（H-xx）として記述する
- 各仮説は対応する問題（P-xx）を明記する
- 仮説は検証可能な形で記述する

---

## Requirements 作成

PDL が `requirements.md` を作成：

- PdM が判断可能な粒度の要求（R-xx）を定義する
- 各要求は対応する問題（P-xx）を明記する
- 実装方法・UI詳細には踏み込まない
- 要求はすべて特定の問題に紐づいている

---

## Handoff 作成

PDL が `handoff.md` を作成：

- 今回のサイクルで PdM が判断すべき点のみを要約する
- 問題の優先順位とその理由を説明する
- 推奨される判断（Adopt / Defer / Reject）を提示する

**重要**: `handoff.md` は一時的・使い捨ての成果物である。次のサイクルには引き継がれない。

---

## 批判的レビューとリサーチ

PDL が `critical_review.md` を作成し、以下の観点から成果物を批判的に検証する：

### 批判的レビューの観点

1. **設計の妥当性**
   - 問題定義が適切か
   - 仮説が検証可能か
   - 要求が実現可能か
   - 設計に矛盾や不整合がないか

2. **一般的なアプローチとの整合性**
   - 業界標準やベストプラクティスとの整合性
   - 類似プロダクトやフレームワーク（OKR、MBO、SMART目標など）との比較
   - 一般的なアプローチとの差異とその理由

3. **潜在的な問題点**
   - 設計の複雑さや実装の難易度
   - ユーザーの負担やハードル
   - スケーラビリティや拡張性
   - エッジケースや例外処理

### リサーチの実施

- 一般的なアプローチやフレームワークをリサーチ
- 類似プロダクトや事例を調査
- ベストプラクティスを確認
- リサーチ結果を `critical_review.md` に記録

### 成果物への反映

批判的レビューとリサーチ結果を以下の成果物に反映：

- `problem_statements.md`: 問題定義の見直し（必要に応じて）
- `value_hypotheses.md`: 仮説の見直し（必要に応じて）
- `requirements.md`: 要求の見直し（改善点の反映）
- `handoff.md`: 批判的レビュー結果の要約を追加

**重要**: 批判的レビューは必須のステップであり、Human との合意前に実施する。

---

## Human との合意

PDL の成果物は、Human と合意されることがある。

しかしそれは **Decision（意思決定）ではない**。

PDL の成果物は常に以下の状態に留まる。

```markdown
## Status

Agreed between Human and Product Discovery Lead.

Not yet adopted by PdM.
```

---

## PdM の判断

PdM が `.discovery/handoff.md` を起点に判断する：

- **Adopt**: 採択したものはバックログに Queue する。すぐに開発する予定のものとして管理し、適切なタイミングで Development Flow（Phase 1: 設計）に進める
- **Defer**: 保留するものはロードマップに Queue する。中長期的にやりたいこととして管理し、将来の検討対象とする
- **Reject**: 却下するものは `.discovery/archived/` に移動する

**重要**:

- PDL は判断に介入しない
- PdM の判断が行われた時点で、現在の `handoff.md` を `.discovery/archived/` に移動する
- 新しい Discovery サイクルでは必ず空の `handoff.md` を新規作成する

### バックログとロードマップへの Queue

PdM が判断した結果、以下のように分離して管理する：

#### バックログ（Adopt したもの）

- **バックログの管理**: `docs/general/backlog.md` で管理する
- **目的**: すぐに開発する予定のアイテムを管理
- **優先順位の決定**: PdM がバックログを適切に管理し、優先順位を決定する
- **Development Flow への移行**: 適切なタイミングで、バックログからアイテムを選択して Development Flow（Phase 1: 設計）に進める

#### ロードマップ（Defer したもの）

- **ロードマップの管理**: `docs/general/roadmap.md` で管理する
- **目的**: 中長期的にやりたいこととして管理し、忘れないようにする
- **優先順位の決定**: PdM がロードマップを適切に管理し、優先順位を決定する
- **バックログへの移行**: 適切なタイミングで、ロードマップからバックログに移動する場合もある

**重要**: Discovery の成果物が Development Flow に進むのは、PdM がバックログから選択し、Development Flow を開始したときのみである。

---

## Discovery Cycle Rule

**Discovery は連続しない。**

PDL は、PdM の判断後に同じ Discovery を続行してはならない。

Discovery は以下の流れで進む。

```
Discovery → Decision → New Question → New Discovery
```

**新しい Discovery が始まる条件**:

- PdM が保留・却下した
- 実装・検証を通じて新しい疑問が生まれた
- Human が新たな悩みを書いた

---

## Exit Criteria

PDL は以下をすべて満たした時点で、Discovery を完了とみなす。

- [ ] 問題が 3〜7 個程度に整理されている
- [ ] 各問題に対応する仮説が存在する
- [ ] 要求がすべて特定の問題に紐づいている
- [ ] `handoff.md` を読めば PdM が判断できる
- [ ] 優先順位の理由を説明できる
- [ ] 批判的レビューとリサーチが完了している
- [ ] 批判的レビュー結果が成果物に反映されている

これ以上踏み込まず、判断を PdM に委ねる。

---

## Discovery 完了の確認

Discovery の最後に、**Driver**が以下を確認：

- [ ] `problem_statements.md` が作成されている
- [ ] `value_hypotheses.md` が作成されている
- [ ] `requirements.md` が作成されている
- [ ] `handoff.md` が作成されている
- [ ] `critical_review.md` が作成されている
- [ ] 批判的レビュー結果が成果物に反映されている
- [ ] Human との合意が得られている（Status: Agreed between Human and PDL）
- [ ] PdM の判断が完了している（Adopt / Defer / Reject）

**重要**:

- Discovery の完了は、PdM の判断が完了した時点で成立する
- Adopt されたものはバックログに Queue され、適切なタイミングで Development Flow に進む
- Defer されたものはロードマップに Queue され、中長期的に管理される
- Development Flow への移行は、PdM がバックログから選択したときに行われる

---

## Development Flow への移行

Discovery の成果物が Development Flow に進む条件：

1. **PdM の判断**: Adopt と判断されている
2. **バックログへの Queue**: バックログに Queue されている
3. **PdM の選択**: PdM がバックログから適切なタイミングで選択する
4. **Development Flow 開始**: Phase 1: 設計から開始する

**重要**: Discovery の成果物は、必ずしも直線的に Development Flow につながるわけではない。バックログを経由し、PdM が適切なタイミングで選択することで、Development Flow に進む。

---

## 関連ドキュメント

| ドキュメント                  | 内容                                              |
| ----------------------------- | ------------------------------------------------- |
| `.claude/jobs/pdl.md`         | PDLルール（Discovery、問題構造化等）              |
| `.claude/jobs/pdm.md`         | PdMルール（バックログ・ロードマップ管理、判断等） |
| `.claude/development-flow.md` | 機能開発フロー（Phase 1〜4）                      |
| `docs/general/backlog.md`     | バックログ（Adopt されたアイテムの管理）          |
| `docs/general/roadmap.md`     | ロードマップ（Defer されたアイテムの管理）        |
