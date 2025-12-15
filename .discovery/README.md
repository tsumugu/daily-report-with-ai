# Discovery ディレクトリ

このディレクトリは、**PDL（Product Discovery Lead）** が問題を構造化し、仮説を立て、PdM が判断できる形（Decision-ready artifacts）に変換するための専用領域です。

## ディレクトリ構造

```
.discovery/
├── inbox/                      # Human による生の悩み・違和感・思考ログ
├── archived/                   # 過去の handoff や生ログ
├── problem_statements.md       # 問題定義（P-xx）
├── value_hypotheses.md         # 価値仮説（H-xx）
├── requirements.md             # 要求（R-xx）
└── handoff.md                  # PdM への判断要約（一時的・使い捨て）
```

## 使い方

### 1. 悩みを書く

`.discovery/inbox/` ディレクトリに、悩み・違和感・思考ログを記述してください。

詳細は `.discovery/inbox/README.md` を参照してください。

### 2. PDL による問題構造化

PDL が `.discovery/inbox/` の内容を起点に、以下を作成します：

- `problem_statements.md` - 問題定義（P-xx）
- `value_hypotheses.md` - 価値仮説（H-xx）
- `requirements.md` - 要求（R-xx）
- `handoff.md` - PdM への判断要約

### 3. PdM による判断

PdM が `handoff.md` を起点に判断し、以下を行います：

- **Adopt**: バックログに Queue
- **Defer**: ロードマップに Queue
- **Reject**: `.discovery/archived/` に移動

## 重要事項

- **PDL の責務は `.discovery/` に完全に閉じている**
- PDL は `docs/` や `src/` には一切関与しない
- PDL は決定しない。PDL は設計しない。PDL は意味を整えることだけに責任を持つ

## 関連ドキュメント

- `.cursor/rules/jobs/pdl.mdc` - PDL ロール定義
- `.cursor/rules/discovery-flow.mdc` - Discovery フロー詳細
