#!/usr/bin/env node
/* eslint-env node */

/**
 * 開発フロー遵守の検証スクリプト
 * 
 * 使用方法:
 *   node scripts/verify-workflow.js --check-docs
 *   node scripts/verify-workflow.js --check-implementation
 *   node scripts/verify-workflow.js --all
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const checkDocs = args.includes('--check-docs');
const checkImplementation = args.includes('--check-implementation');
const checkAll = args.includes('--all') || (!checkDocs && !checkImplementation);

/**
 * 変更されたファイルを取得
 */
function getChangedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      cwd: rootDir
    });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    // ステージングされていない場合、変更されたファイルを取得
    try {
      const output = execSync('git diff --name-only --diff-filter=ACM', {
        encoding: 'utf-8',
        cwd: rootDir
      });
      return output.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }
}

/**
 * 実装コードが変更されているかチェック
 */
function hasImplementationChanges(changedFiles) {
  return changedFiles.some(file => 
    file.startsWith('apps/api/src/') || 
    file.startsWith('apps/web/src/')
  );
}

/**
 * 機能名をファイルパスから抽出
 */
function extractFeatureName(filePath) {
  const match = filePath.match(/docs\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * ドキュメントのステータスを取得
 */
function getDocumentStatus(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const statusMatch = content.match(/\*\*ステータス\*\*:\s*(Pending|Approved)/i);
    return statusMatch ? statusMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * 機能が実装済みかチェック（実装コードの存在確認）
 */
function isFeatureImplemented(featureName) {
  // 機能名のマッピング（ドキュメント名と実装ディレクトリ名が異なる場合）
  const featureMapping = {
    'daily-report-input': 'daily-report',
    'daily-report-list': 'daily-report',
    'followup-history-view': 'followup',
    'weekly-focus-management': 'weekly-focus'
  };
  
  const implName = featureMapping[featureName] || featureName;
  
  // 実装コードの存在を確認
  const webFeaturesDir = join(rootDir, 'apps/web/src/app/features');
  const apiRoutesDir = join(rootDir, 'apps/api/src/routes');
  
  try {
    // Web側の実装を確認
    if (existsSync(webFeaturesDir)) {
      const webFeatures = readdirSync(webFeaturesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      if (webFeatures.some(name => name === implName || name.includes(implName))) {
        return true;
      }
    }
    
    // API側の実装を確認
    if (existsSync(apiRoutesDir)) {
      const apiRoutes = readdirSync(apiRoutesDir, { withFileTypes: true })
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);
      
      if (apiRoutes.some(name => name.includes(implName) || name.includes(featureName))) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * ドキュメントステータスの検証
 */
function verifyDocumentStatus() {
  console.log('📄 ドキュメントステータスを検証中...\n');

  const featuresDir = join(rootDir, 'docs/features');
  if (!existsSync(featuresDir)) {
    console.log('✅ 機能ディレクトリが存在しません（新規プロジェクト）');
    return true;
  }

  const features = readdirSync(featuresDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let hasErrors = false;

  for (const feature of features) {
    // 実装済みの機能は検証対象外（後方互換性のため）
    if (isFeatureImplemented(feature)) {
      console.log(`⏭️  ${feature}: 実装済み機能のため検証をスキップ`);
      continue;
    }

    const prdPath = join(featuresDir, feature, 'prd.md');
    const techSpecPath = join(featuresDir, feature, 'tech_spec.md');
    const uiDesignPath = join(featuresDir, feature, 'ui_design.md');

    const docs = [
      { name: 'prd.md', path: prdPath },
      { name: 'tech_spec.md', path: techSpecPath },
      { name: 'ui_design.md', path: uiDesignPath }
    ];

    for (const doc of docs) {
      if (existsSync(doc.path)) {
        const status = getDocumentStatus(doc.path);
        if (!status) {
          console.error(`❌ ${feature}/${doc.name}: ステータスが記載されていません`);
          console.error(`   ドキュメント先頭に「**ステータス**: Pending / Approved」を追加してください\n`);
          hasErrors = true;
        } else if (!['Pending', 'Approved'].includes(status)) {
          console.error(`❌ ${feature}/${doc.name}: 無効なステータス「${status}」`);
          console.error(`   ステータスは「Pending」または「Approved」である必要があります\n`);
          hasErrors = true;
        } else {
          console.log(`✅ ${feature}/${doc.name}: ${status}`);
        }
      }
    }
  }

  return !hasErrors;
}

/**
 * 実装開始前の必須チェック
 */
function verifyImplementationReady() {
  console.log('🔍 実装開始前の必須チェックを実行中...\n');

  const changedFiles = getChangedFiles();
  const hasImplChanges = hasImplementationChanges(changedFiles);

  if (!hasImplChanges) {
    console.log('✅ 実装コードの変更はありません');
    return true;
  }

  console.log('⚠️  実装コードの変更が検出されました\n');

  // 変更されたファイルから機能名を抽出
  const featureNames = new Set();
  changedFiles.forEach(file => {
    const featureName = extractFeatureName(file);
    if (featureName) {
      featureNames.add(featureName);
    }
  });

  // 機能名が特定できない場合、すべての機能をチェック
  if (featureNames.size === 0) {
    const featuresDir = join(rootDir, 'docs/features');
    if (existsSync(featuresDir)) {
      const features = readdirSync(featuresDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      features.forEach(f => featureNames.add(f));
    }
  }

  let hasErrors = false;

  for (const featureName of featureNames) {
    const prdPath = join(rootDir, 'docs/features', featureName, 'prd.md');
    const techSpecPath = join(rootDir, 'docs/features', featureName, 'tech_spec.md');
    const uiDesignPath = join(rootDir, 'docs/features', featureName, 'ui_design.md');

    const requiredDocs = [
      { name: 'prd.md', path: prdPath },
      { name: 'tech_spec.md', path: techSpecPath },
      { name: 'ui_design.md', path: uiDesignPath }
    ];

    console.log(`📋 ${featureName} の設計ドキュメントを確認中...`);

    for (const doc of requiredDocs) {
      if (!existsSync(doc.path)) {
        console.error(`❌ ${featureName}/${doc.name} が存在しません`);
        hasErrors = true;
        continue;
      }

      const status = getDocumentStatus(doc.path);
      if (!status) {
        console.error(`❌ ${featureName}/${doc.name}: ステータスが記載されていません`);
        hasErrors = true;
      } else if (status !== 'Approved') {
        console.error(`❌ ${featureName}/${doc.name}: ステータスが「${status}」です（Approvedである必要があります）`);
        console.error(`   実装を開始するには、すべての設計ドキュメントが「Approved」ステータスである必要があります`);
        hasErrors = true;
      } else {
        console.log(`✅ ${featureName}/${doc.name}: Approved`);
      }
    }

    // プロトタイプの存在確認（オプション）
    const prototypePath = join(rootDir, 'apps/web/src/stories/prototypes', featureName);
    if (existsSync(prototypePath)) {
      console.log(`✅ ${featureName}: プロトタイプが存在します`);
    } else {
      console.warn(`⚠️  ${featureName}: プロトタイプが見つかりません（推奨）`);
    }

    console.log('');
  }

  if (hasErrors) {
    console.error('\n❌ 実装開始前の必須チェックに失敗しました');
    console.error('   すべての設計ドキュメントを「Approved」ステータスに更新してください');
    console.error('   詳細は docs/rules/development-flow.md を参照してください\n');
    return false;
  }

  console.log('✅ 実装開始前の必須チェックに合格しました\n');
  return true;
}

/**
 * メイン処理
 */
function main() {
  let allPassed = true;

  if (checkAll || checkDocs) {
    allPassed = verifyDocumentStatus() && allPassed;
  }

  if (checkAll || checkImplementation) {
    allPassed = verifyImplementationReady() && allPassed;
  }

  if (!allPassed) {
    process.exit(1);
  }
}

main();

