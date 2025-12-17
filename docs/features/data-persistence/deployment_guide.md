# データ永続化機能 デプロイガイド

**作成日**: 2025-12-17  
**作成者**: Driver  
**目的**: デプロイ時のデータ消失を防ぐためのガイド

---

## ⚠️ 重要な注意事項

**デプロイ時にデータベースファイルとAPIサーバーが同じ場所にある場合、データが失われる可能性があります。**

### 問題の原因

1. **コンテナベースのデプロイ**
   - コンテナが再作成されると、コンテナ内のファイルが失われる
   - データベースファイルがコンテナ内に保存されている場合、再デプロイ時にデータが消える

2. **サーバーの再デプロイ**
   - サーバーの再起動や更新時に、一時的なストレージに保存されているデータが失われる
   - データベースファイルが永続化されていないストレージに保存されている場合、データが消える

3. **デフォルトの保存場所**
   - 現在の実装では、デフォルトで `apps/api/data/daily-report.db` に保存される
   - この場所は通常、アプリケーションコードと同じディレクトリにあり、デプロイ時に上書きされる可能性がある

---

## ✅ 解決策

### 1. 環境変数でデータベースパスを指定（推奨）

**既に実装済み**: 環境変数 `DB_PATH` でデータベースファイルのパスを指定できます。

#### 開発環境

```bash
# .env ファイル
DB_PATH=./data/daily-report.db
```

#### 本番環境（推奨）

```bash
# 永続化されたストレージに保存
DB_PATH=/var/lib/daily-report/daily-report.db
```

または

```bash
# マウントされたボリュームに保存
DB_PATH=/mnt/data/daily-report.db
```

---

### 2. Dockerを使用する場合

#### docker-compose.yml の例

```yaml
version: "3.8"

services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - DB_PATH=/data/daily-report.db
    volumes:
      # 永続化されたボリュームにマウント
      - daily-report-data:/data
    restart: unless-stopped

volumes:
  daily-report-data:
    # 名前付きボリュームを使用（推奨）
    # または、ホストのディレクトリをマウント
    # driver: local
    # driver_opts:
    #   type: none
    #   o: bind
    #   device: /var/lib/daily-report
```

#### Dockerfile の例

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードのコピー
COPY . .

# データディレクトリの作成（ボリュームマウント用）
RUN mkdir -p /data

# ビルド
RUN npm run build

# データベースファイルは /data に保存される（ボリュームマウント）
ENV DB_PATH=/data/daily-report.db

EXPOSE 3000

CMD ["npm", "start"]
```

---

### 3. クラウドサービスを使用する場合

#### AWS ECS / Fargate

```bash
# EFS（Elastic File System）をマウント
DB_PATH=/mnt/efs/daily-report.db
```

#### Google Cloud Run

```bash
# Cloud Storage FUSEを使用
DB_PATH=/mnt/gcs/daily-report.db
```

#### Azure Container Instances

```bash
# Azure Filesをマウント
DB_PATH=/mnt/azure/daily-report.db
```

---

### 4. バックアップ戦略

#### 定期的なバックアップ

```bash
# バックアップスクリプトの例
#!/bin/bash
BACKUP_DIR="/backup/daily-report"
DB_PATH="/var/lib/daily-report/daily-report.db"
DATE=$(date +%Y%m%d_%H%M%S)

# データベースファイルのコピー
cp "$DB_PATH" "$BACKUP_DIR/daily-report_$DATE.db"

# 古いバックアップの削除（30日以上）
find "$BACKUP_DIR" -name "daily-report_*.db" -mtime +30 -delete
```

#### cronジョブの設定

```bash
# 毎日午前2時にバックアップ
0 2 * * * /path/to/backup-script.sh
```

---

## 📋 デプロイチェックリスト

### デプロイ前の確認

- [ ] 環境変数 `DB_PATH` が永続化されたストレージを指しているか確認
- [ ] データベースファイルが永続化されたストレージに保存されることを確認
- [ ] バックアップ戦略が確立されているか確認
- [ ] データベースファイルの権限が適切に設定されているか確認

### デプロイ時の確認

- [ ] データベースファイルが既存の場所に存在するか確認
- [ ] データベースファイルが正しくマウントされているか確認
- [ ] アプリケーションがデータベースファイルにアクセスできるか確認

### デプロイ後の確認

- [ ] 既存のデータが保持されているか確認
- [ ] 新しいデータが正しく保存されるか確認
- [ ] バックアップが正常に動作しているか確認

---

## 🔄 移行手順（既存データがある場合）

### 1. データベースファイルのバックアップ

```bash
# 現在のデータベースファイルをバックアップ
cp apps/api/data/daily-report.db /backup/daily-report.db
```

### 2. 新しい場所への移動

```bash
# 永続化されたストレージに移動
mkdir -p /var/lib/daily-report
mv apps/api/data/daily-report.db /var/lib/daily-report/daily-report.db
```

### 3. 環境変数の設定

```bash
# .env ファイルに追加
DB_PATH=/var/lib/daily-report/daily-report.db
```

### 4. アプリケーションの再起動

```bash
# アプリケーションを再起動
npm run restart
```

---

## 🚨 トラブルシューティング

### 問題: デプロイ後にデータが消えた

**原因**: データベースファイルが永続化されていないストレージに保存されている

**解決策**:

1. バックアップからデータベースファイルを復元
2. 環境変数 `DB_PATH` を永続化されたストレージに変更
3. データベースファイルを新しい場所に移動
4. アプリケーションを再起動

### 問題: データベースファイルにアクセスできない

**原因**: 権限の問題

**解決策**:

```bash
# データベースファイルの権限を確認
ls -l /var/lib/daily-report/daily-report.db

# 権限を修正（必要に応じて）
chmod 644 /var/lib/daily-report/daily-report.db
chown app-user:app-user /var/lib/daily-report/daily-report.db
```

### 問題: データベースファイルがロックされている

**原因**: 別のプロセスがデータベースファイルを使用している

**解決策**:

```bash
# プロセスを確認
lsof /var/lib/daily-report/daily-report.db

# プロセスを終了（必要に応じて）
kill <PID>
```

---

## 📚 参考資料

- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
- [データ永続化機能 Tech Spec](./tech_spec.md)

---

**最終更新日**: 2025-12-17
