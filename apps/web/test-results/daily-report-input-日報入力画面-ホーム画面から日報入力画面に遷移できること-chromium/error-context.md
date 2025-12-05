# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - heading "Daily Report" [level=1] [ref=e7]
    - paragraph [ref=e8]: アカウント作成
  - generic [ref=e9]:
    - generic [ref=e11]:
      - generic [ref=e12]: メールアドレス
      - textbox "your@email.com" [ref=e14]
    - generic [ref=e16]:
      - generic [ref=e17]: パスワード
      - generic [ref=e18]:
        - textbox "8文字以上" [ref=e19]
        - button "パスワードを表示" [ref=e20] [cursor=pointer]:
          - img [ref=e21]
    - generic [ref=e27]:
      - generic [ref=e28]: パスワード（確認）
      - generic [ref=e29]:
        - textbox "もう一度入力してください" [ref=e30]
        - button "パスワードを表示" [ref=e31] [cursor=pointer]:
          - img [ref=e32]
    - button "アカウントを作成" [ref=e38] [cursor=pointer]:
      - generic [ref=e39]: アカウントを作成
  - generic [ref=e40]:
    - text: すでにアカウントをお持ちの方は
    - link "ログイン" [ref=e41] [cursor=pointer]:
      - /url: /login
```