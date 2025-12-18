# ビルドステージ
FROM node:18-slim AS builder

# ビルドツールをインストール
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY apps/api/package*.json ./
COPY apps/api/tsconfig.json ./

# 依存関係をインストール（dev dependenciesも含む、ビルドに必要）
RUN npm install

# アプリケーションコードをコピー
COPY apps/api/src ./src

# TypeScriptをビルド
RUN npm run build

# 本番環境の依存関係のみをインストール
RUN npm install --only=production

# 実行ステージ
FROM node:18-slim

# 非rootユーザーの作成
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# 本番環境の依存関係のみをコピー
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# /tmpディレクトリの権限を設定（SQLiteファイルの保存用）
RUN chown -R appuser:appuser /tmp

# 非rootユーザーに切り替え
USER appuser

# ポート8080を公開（Cloud Run用）
EXPOSE 8080

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# アプリケーションを起動
CMD ["node", "dist/index.js"]
