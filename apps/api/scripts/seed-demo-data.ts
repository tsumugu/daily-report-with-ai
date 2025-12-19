#!/usr/bin/env tsx
/**
 * デモデータ作成スクリプト
 * 
 * 機能をデモするためのサンプルデータを作成します。
 * 以下のデータを作成します：
 * - ユーザー（1名）
 * - 目標（階層構造：長期→中期→短期）
 * - 日報（過去4週間分、目標と紐付け）
 * - よかったこと・改善点（各日報に複数）
 * - フォローアップ（いくつかのよかったこと・改善点に）
 * - 週次フォーカス（いくつかの週に）
 * 
 * 使用方法:
 *   npm run seed:demo
 *   または
 *   tsx scripts/seed-demo-data.ts
 */

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../src/db/database.js';
import { getUsersDatabase } from '../src/db/users.db.js';
import { getDailyReportsDatabase, getGoodPointsDatabase, getImprovementsDatabase } from '../src/db/daily-reports.db.js';
import { getGoalsDatabase } from '../src/db/goals.db.js';
import { getFollowupsDatabase } from '../src/db/followups.db.js';
import { getWeeklyFocusesDatabase } from '../src/db/weekly-focuses.db.js';
import { getDailyReportGoalsDatabase } from '../src/db/daily-report-goals.db.js';
import type { User } from '../src/models/user.model.js';
import type { DailyReport, GoodPoint, Improvement } from '../src/models/daily-report.model.js';
import type { Goal } from '../src/models/daily-report.model.js';
import type { Followup, WeeklyFocus, DailyReportGoal } from '../src/models/daily-report.model.js';

const SALT_ROUNDS = 10;

/**
 * 日付をYYYY-MM-DD形式で取得
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 日付をn日前に設定
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * 週の開始日（月曜日）を取得
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日に調整
  return new Date(d.setDate(diff));
}

/**
 * ISO文字列を取得
 */
function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * デモデータを作成
 */
async function seedDemoData() {
  console.log('🌱 デモデータの作成を開始します...\n');

  try {
    // データベースを取得
    const db = await getDatabase();
    const usersDb = await getUsersDatabase();
    const dailyReportsDb = await getDailyReportsDatabase();
    const goodPointsDb = await getGoodPointsDatabase();
    const improvementsDb = await getImprovementsDatabase();
    const goalsDb = await getGoalsDatabase();
    const followupsDb = await getFollowupsDatabase();
    const weeklyFocusesDb = await getWeeklyFocusesDatabase();
    const dailyReportGoalsDb = await getDailyReportGoalsDatabase();

    // ============================================
    // 1. ユーザー作成
    // ============================================
    console.log('📝 ユーザーを作成中...');
    const demoUser: User = {
      id: uuidv4(),
      email: 'demo@example.com',
      passwordHash: await bcrypt.hash('password123', SALT_ROUNDS),
      createdAt: toISOString(daysAgo(30)),
      updatedAt: toISOString(daysAgo(30)),
    };
    usersDb.save(demoUser);
    console.log(`✅ ユーザー作成完了: ${demoUser.email} (ID: ${demoUser.id})\n`);

    // ============================================
    // 2. 目標作成（階層構造）
    // ============================================
    console.log('🎯 目標を作成中...');
    
    // 長期目標（半期）
    const longTermGoal: Goal = {
      id: uuidv4(),
      userId: demoUser.id,
      name: 'エンジニアとしての基礎力を身につける',
      description: 'コードレビュー、テスト、ドキュメント作成など、エンジニアとして必要な基礎スキルを習得する',
      startDate: formatDate(daysAgo(90)),
      endDate: formatDate(daysAgo(0)),
      parentId: null,
      goalType: 'skill',
      successCriteria: 'コードレビューで指摘される回数が半減し、テストカバレッジ80%以上を維持できる',
      createdAt: toISOString(daysAgo(90)),
      updatedAt: toISOString(daysAgo(90)),
    };
    goalsDb.save(longTermGoal);
    console.log(`  ✅ 長期目標: ${longTermGoal.name}`);

    // 中期目標1（1ヶ月）
    const midTermGoal1: Goal = {
      id: uuidv4(),
      userId: demoUser.id,
      name: 'テスト駆動開発を実践する',
      description: 'TDDのサイクルを回し、テストを書いてから実装する習慣を身につける',
      startDate: formatDate(daysAgo(30)),
      endDate: formatDate(daysAgo(0)),
      parentId: longTermGoal.id,
      goalType: 'habit',
      successCriteria: '新機能実装時に必ずテストを先に書く。テストカバレッジ80%以上',
      createdAt: toISOString(daysAgo(30)),
      updatedAt: toISOString(daysAgo(30)),
    };
    goalsDb.save(midTermGoal1);
    console.log(`  ✅ 中期目標1: ${midTermGoal1.name}`);

    // 中期目標2（1ヶ月）
    const midTermGoal2: Goal = {
      id: uuidv4(),
      userId: demoUser.id,
      name: 'コードレビューで建設的なフィードバックを提供する',
      description: '単なる指摘ではなく、改善提案を含めたレビューコメントを書けるようになる',
      startDate: formatDate(daysAgo(30)),
      endDate: formatDate(daysAgo(0)),
      parentId: longTermGoal.id,
      goalType: 'skill',
      successCriteria: 'レビューコメントに改善提案を含める割合が80%以上',
      createdAt: toISOString(daysAgo(30)),
      updatedAt: toISOString(daysAgo(30)),
    };
    goalsDb.save(midTermGoal2);
    console.log(`  ✅ 中期目標2: ${midTermGoal2.name}`);

    // 短期目標1（1週間）
    const shortTermGoal1: Goal = {
      id: uuidv4(),
      userId: demoUser.id,
      name: '新機能実装時にテストを先に書く',
      description: '今週実装する新機能について、テストを先に書いてから実装する',
      startDate: formatDate(daysAgo(7)),
      endDate: formatDate(daysAgo(0)),
      parentId: midTermGoal1.id,
      goalType: 'habit',
      successCriteria: '新機能3つすべてでテストを先に書く',
      createdAt: toISOString(daysAgo(7)),
      updatedAt: toISOString(daysAgo(7)),
    };
    goalsDb.save(shortTermGoal1);
    console.log(`  ✅ 短期目標1: ${shortTermGoal1.name}`);

    // 短期目標2（1週間）
    const shortTermGoal2: Goal = {
      id: uuidv4(),
      userId: demoUser.id,
      name: 'コードレビューで改善提案を含める',
      description: '今週レビューするPRについて、指摘だけでなく改善提案も含める',
      startDate: formatDate(daysAgo(7)),
      endDate: formatDate(daysAgo(0)),
      parentId: midTermGoal2.id,
      goalType: 'skill',
      successCriteria: 'レビューコメントの80%以上に改善提案を含める',
      createdAt: toISOString(daysAgo(7)),
      updatedAt: toISOString(daysAgo(7)),
    };
    goalsDb.save(shortTermGoal2);
    console.log(`  ✅ 短期目標2: ${shortTermGoal2.name}\n`);

    // ============================================
    // 3. 日報作成（過去4週間分）
    // ============================================
    console.log('📅 日報を作成中...');
    const reports: DailyReport[] = [];
    const goodPoints: GoodPoint[] = [];
    const improvements: Improvement[] = [];
    const dailyReportGoals: DailyReportGoal[] = [];

    // 過去28日分の日報を作成（週5日勤務を想定）
    for (let day = 0; day < 28; day++) {
      const date = daysAgo(day);
      const dayOfWeek = date.getDay();
      
      // 土日はスキップ
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const reportId = uuidv4();
      const reportDate = formatDate(date);
      const now = toISOString(date);

      // 日報作成
      const report: DailyReport = {
        id: reportId,
        userId: demoUser.id,
        date: reportDate,
        events: `業務日報 ${day + 1}日目\n- 機能開発を進めた\n- コードレビューに参加した\n- チームミーティングに参加した`,
        learnings: day % 3 === 0 ? `新しい技術について学んだ: ${day % 5 === 0 ? 'TypeScriptの型システム' : 'React Hooksのベストプラクティス'}` : null,
        goodPointIds: [],
        improvementIds: [],
        createdAt: now,
        updatedAt: now,
      };
      dailyReportsDb.save(report);
      reports.push(report);

      // よかったこと（2-3個）
      const goodPointCount = 2 + (day % 2);
      for (let i = 0; i < goodPointCount; i++) {
        const goodPointId = uuidv4();
        const goodPoint: GoodPoint = {
          id: goodPointId,
          userId: demoUser.id,
          content: `よかったこと ${i + 1}: ${day % 3 === 0 ? 'テストを先に書いたら実装がスムーズだった' : day % 3 === 1 ? 'コードレビューで建設的なフィードバックをもらえた' : 'チームメンバーと良い議論ができた'}`,
          factors: day % 3 === 0 ? 'テストを書くことで要件が明確になった' : day % 3 === 1 ? 'レビュアーが具体的な改善提案をしてくれた' : '事前に資料を準備していた',
          tags: day % 3 === 0 ? ['TDD', '開発効率'] : day % 3 === 1 ? ['コードレビュー', 'フィードバック'] : ['チームワーク', 'コミュニケーション'],
          status: day % 5 === 0 ? '再現成功' : day % 5 === 1 ? '定着' : '進行中',
          success_count: day % 5 === 0 ? 2 : day % 5 === 1 ? 5 : 1,
          createdAt: now,
          updatedAt: now,
        };
        goodPointsDb.save(goodPoint, reportId);
        goodPoints.push(goodPoint);
        report.goodPointIds.push(goodPointId);
      }

      // 改善点（1-2個）
      const improvementCount = 1 + (day % 2);
      for (let i = 0; i < improvementCount; i++) {
        const improvementId = uuidv4();
        const improvement: Improvement = {
          id: improvementId,
          userId: demoUser.id,
          content: `改善点 ${i + 1}: ${day % 3 === 0 ? 'テストカバレッジがまだ低い' : day % 3 === 1 ? 'コードレビューのコメントが抽象的だった' : 'ドキュメント作成が後回しになった'}`,
          action: day % 3 === 0 ? '次回からはテストを先に書く' : day % 3 === 1 ? '具体的な改善提案を含めるようにする' : '実装と同時にドキュメントも更新する',
          status: day % 5 === 0 ? '完了' : day % 5 === 1 ? '習慣化' : '進行中',
          success_count: day % 5 === 0 ? 3 : day % 5 === 1 ? 7 : 1,
          createdAt: now,
          updatedAt: now,
        };
        improvementsDb.save(improvement, reportId);
        improvements.push(improvement);
        report.improvementIds.push(improvementId);
      }

      // 日報を更新（goodPointIdsとimprovementIdsを反映）
      dailyReportsDb.update(report);

      // 目標との紐付け（週によって異なる目標を紐付け）
      const weekNumber = Math.floor(day / 5);
      if (weekNumber === 0 && day % 2 === 0) {
        // 1週目: 短期目標1を紐付け
        const link: DailyReportGoal = {
          id: uuidv4(),
          dailyReportId: reportId,
          goalId: shortTermGoal1.id,
          createdAt: now,
        };
        dailyReportGoalsDb.save(link);
        dailyReportGoals.push(link);
      } else if (weekNumber === 1 && day % 2 === 1) {
        // 2週目: 短期目標2を紐付け
        const link: DailyReportGoal = {
          id: uuidv4(),
          dailyReportId: reportId,
          goalId: shortTermGoal2.id,
          createdAt: now,
        };
        dailyReportGoalsDb.save(link);
        dailyReportGoals.push(link);
      } else if (weekNumber >= 2) {
        // 3-4週目: 中期目標を紐付け
        const link: DailyReportGoal = {
          id: uuidv4(),
          dailyReportId: reportId,
          goalId: day % 2 === 0 ? midTermGoal1.id : midTermGoal2.id,
          createdAt: now,
        };
        dailyReportGoalsDb.save(link);
        dailyReportGoals.push(link);
      }

      if (day % 5 === 0) {
        console.log(`  ✅ ${reportDate} の日報を作成`);
      }
    }
    console.log(`✅ 日報作成完了: ${reports.length}件\n`);

    // ============================================
    // 4. フォローアップ作成
    // ============================================
    console.log('🔄 フォローアップを作成中...');
    const followups: Followup[] = [];

    // いくつかのよかったことと改善点にフォローアップを追加
    for (let i = 0; i < Math.min(10, goodPoints.length); i += 2) {
      const goodPoint = goodPoints[i];
      const followup: Followup = {
        id: uuidv4(),
        userId: demoUser.id,
        itemType: 'goodPoint',
        itemId: goodPoint.id,
        status: i % 3 === 0 ? '再現成功' : i % 3 === 1 ? '進行中' : '再現できず',
        memo: i % 3 === 0 ? 'うまく再現できた。チームメンバーにも共有した。' : i % 3 === 1 ? 'まだ試行錯誤中。次回も試してみる。' : '今回はうまくいかなかった。要因を再検討する。',
        date: formatDate(daysAgo(Math.max(0, i - 3))),
        createdAt: toISOString(daysAgo(Math.max(0, i - 3))),
        updatedAt: toISOString(daysAgo(Math.max(0, i - 3))),
      };
      followupsDb.save(followup);
      followups.push(followup);
    }

    for (let i = 0; i < Math.min(8, improvements.length); i += 2) {
      const improvement = improvements[i];
      const followup: Followup = {
        id: uuidv4(),
        userId: demoUser.id,
        itemType: 'improvement',
        itemId: improvement.id,
        status: i % 3 === 0 ? '完了' : i % 3 === 1 ? '進行中' : '未達成',
        memo: i % 3 === 0 ? '改善が完了した。継続的に実施する。' : i % 3 === 1 ? '改善を進めている。まだ途中。' : '今回は達成できなかった。次回に持ち越し。',
        date: formatDate(daysAgo(Math.max(0, i - 2))),
        createdAt: toISOString(daysAgo(Math.max(0, i - 2))),
        updatedAt: toISOString(daysAgo(Math.max(0, i - 2))),
      };
      followupsDb.save(followup);
      followups.push(followup);
    }
    console.log(`✅ フォローアップ作成完了: ${followups.length}件\n`);

    // ============================================
    // 5. 週次フォーカス作成
    // ============================================
    console.log('📌 週次フォーカスを作成中...');
    const weeklyFocuses: WeeklyFocus[] = [];

    // 過去4週間分の週次フォーカスを作成
    for (let week = 0; week < 4; week++) {
      const weekStart = getWeekStart(daysAgo(week * 7));
      const weekStartDate = formatDate(weekStart);

      // 各週に2-3個のフォーカスを追加
      const focusCount = 2 + (week % 2);
      for (let i = 0; i < focusCount; i++) {
        // よかったことと改善点を交互に
        const itemType = i % 2 === 0 ? 'goodPoint' : 'improvement';
        const items = itemType === 'goodPoint' ? goodPoints : improvements;
        const itemIndex = week * 5 + i;
        
        if (itemIndex < items.length) {
          const item = items[itemIndex];
          const weeklyFocus: WeeklyFocus = {
            id: uuidv4(),
            userId: demoUser.id,
            itemType,
            itemId: item.id,
            goalId: week < 2 ? shortTermGoal1.id : (week === 2 ? midTermGoal1.id : midTermGoal2.id),
            weekStartDate,
            createdAt: toISOString(weekStart),
          };
          weeklyFocusesDb.save(weeklyFocus);
          weeklyFocuses.push(weeklyFocus);
        }
      }
      console.log(`  ✅ ${weekStartDate} の週次フォーカスを作成`);
    }
    console.log(`✅ 週次フォーカス作成完了: ${weeklyFocuses.length}件\n`);

    // ============================================
    // 完了
    // ============================================
    console.log('✨ デモデータの作成が完了しました！\n');
    console.log('📊 作成されたデータ:');
    console.log(`  - ユーザー: 1名 (${demoUser.email})`);
    console.log(`  - 目標: 5個 (長期1、中期2、短期2)`);
    console.log(`  - 日報: ${reports.length}件`);
    console.log(`  - よかったこと: ${goodPoints.length}件`);
    console.log(`  - 改善点: ${improvements.length}件`);
    console.log(`  - フォローアップ: ${followups.length}件`);
    console.log(`  - 週次フォーカス: ${weeklyFocuses.length}件`);
    console.log(`  - 日報-目標紐付け: ${dailyReportGoals.length}件\n`);
    console.log('🔑 ログイン情報:');
    console.log(`  メールアドレス: ${demoUser.email}`);
    console.log(`  パスワード: password123\n`);

  } catch (error) {
    console.error('❌ デモデータの作成に失敗しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
seedDemoData().then(() => {
  console.log('✅ スクリプトが正常に完了しました');
  process.exit(0);
}).catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});

