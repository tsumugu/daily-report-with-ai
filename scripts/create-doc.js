#!/usr/bin/env node
/* eslint-env node */

/**
 * ドキュメントテンプレートから新規ドキュメントを作成するスクリプト
 * 
 * 使用方法:
 *   node scripts/create-doc.js prd {feature_name}
 *   node scripts/create-doc.js tech-spec {feature_name}
 *   node scripts/create-doc.js ui-design {feature_name}
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const docTypes = {
  'prd': {
    template: 'prd.template.md',
    output: 'prd.md',
    description: 'PRD'
  },
  'tech-spec': {
    template: 'tech_spec.template.md',
    output: 'tech_spec.md',
    description: 'Tech Spec'
  },
  'ui-design': {
    template: 'ui_design.template.md',
    output: 'ui_design.md',
    description: 'UI Design'
  }
};

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('使用方法: node scripts/create-doc.js {doc_type} {feature_name}');
    console.error('  doc_type: prd, tech-spec, ui-design');
    console.error('  feature_name: 機能名（例: auth, daily-report-input）');
    process.exit(1);
  }

  const [docType, featureName] = args;
  const docConfig = docTypes[docType];

  if (!docConfig) {
    console.error(`❌ 無効なドキュメントタイプ: ${docType}`);
    console.error(`   有効なタイプ: ${Object.keys(docTypes).join(', ')}`);
    process.exit(1);
  }

  const templatePath = join(rootDir, 'docs/templates', docConfig.template);
  const featureDir = join(rootDir, 'docs/features', featureName);
  const outputPath = join(featureDir, docConfig.output);

  // テンプレートの存在確認
  if (!existsSync(templatePath)) {
    console.error(`❌ テンプレートが見つかりません: ${templatePath}`);
    process.exit(1);
  }

  // 既にドキュメントが存在する場合
  if (existsSync(outputPath)) {
    console.error(`❌ 既にドキュメントが存在します: ${outputPath}`);
    console.error('   既存のドキュメントを上書きする場合は削除してください');
    process.exit(1);
  }

  // テンプレートを読み込む
  let template = readFileSync(templatePath, 'utf-8');

  // プレースホルダーを置換
  const today = new Date().toISOString().split('T')[0];
  template = template
    .replace(/{機能名}/g, featureName)
    .replace(/{作成日}/g, today)
    .replace(/{機能名}/g, featureName);

  // ディレクトリを作成
  if (!existsSync(featureDir)) {
    mkdirSync(featureDir, { recursive: true });
    console.log(`📁 ディレクトリを作成しました: ${featureDir}`);
  }

  // ドキュメントを書き込む
  writeFileSync(outputPath, template, 'utf-8');
  console.log(`✅ ${docConfig.description}を作成しました: ${outputPath}`);
  console.log(`   ステータスを「Pending」から「Approved」に更新する前に、内容を記入してください`);
}

main();

