#!/usr/bin/env node

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

class BlogDaemon {
  constructor() {
    this.isRunning = false;
    this.lastRunDate = null;
    this.checkInterval = 60000; // 1分ごとにチェック
  }

  // 現在時刻を取得（JST）
  getCurrentTime() {
    const now = new Date();
    const jstOffset = 9 * 60; // JST = UTC+9
    const jstTime = new Date(now.getTime() + jstOffset * 60000);
    return jstTime;
  }

  // 今日の日付を取得（YYYY-MM-DD形式）
  getTodayDate() {
    const jstTime = this.getCurrentTime();
    const year = jstTime.getFullYear();
    const month = String(jstTime.getMonth() + 1).padStart(2, '0');
    const day = String(jstTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 夜1時になったかチェック
  shouldRun() {
    const now = this.getCurrentTime();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const today = this.getTodayDate();

    // 夜1時（01:00-01:59）で、まだ今日実行していない場合
    return hour === 1 && minute >= 0 && minute < 60 && this.lastRunDate !== today;
  }

  // メイン処理を実行
  async runMainProcess() {
    if (this.isRunning) {
      console.log('⚠️  前回の処理がまだ実行中です。スキップします。');
      return;
    }

    this.isRunning = true;
    const today = this.getTodayDate();
    
    console.log(`🚀 ${today} の処理を開始します...`);
    console.log(`⏰ 実行時刻: ${this.getCurrentTime().toLocaleString('ja-JP')}`);

    try {
      // index.jsを実行
      const child = spawn('node', ['scripts/index.js'], {
        stdio: 'inherit',
        env: { ...process.env }
      });

      return new Promise((resolve, reject) => {
        child.on('close', (code) => {
          this.isRunning = false;
          
          if (code === 0) {
            console.log(`✅ ${today} の処理が正常に完了しました！`);
            this.lastRunDate = today;
            resolve(true);
          } else {
            console.error(`❌ ${today} の処理がエラーで終了しました (コード: ${code})`);
            reject(new Error(`Process exited with code ${code}`));
          }
        });

        child.on('error', (error) => {
          this.isRunning = false;
          console.error(`❌ スクリプト実行エラー:`, error);
          reject(error);
        });
      });
    } catch (error) {
      this.isRunning = false;
      console.error(`❌ 実行エラー:`, error);
      throw error;
    }
  }

  // デーモンのメインループ
  async start() {
    console.log('🔄 ブログ記事自動生成デーモンを開始します...');
    console.log(`📅 現在時刻: ${this.getCurrentTime().toLocaleString('ja-JP')}`);
    console.log(`⏰ 実行スケジュール: 毎日深夜1時`);
    console.log(`🔍 チェック間隔: ${this.checkInterval / 1000}秒`);
    console.log('💤 待機中...\n');

    // 初回起動時に即座に実行するかチェック
    if (this.shouldRun()) {
      await this.runMainProcess();
    }

    // 定期的にチェック
    setInterval(async () => {
      if (this.shouldRun()) {
        try {
          await this.runMainProcess();
        } catch (error) {
          console.error('❌ 処理実行中にエラーが発生しました:', error);
        }
      }
    }, this.checkInterval);

    // プロセス終了時の処理
    process.on('SIGINT', () => {
      console.log('\n🛑 デーモンを停止します...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 デーモンを停止します...');
      process.exit(0);
    });
  }

  // ステータス表示
  showStatus() {
    const now = this.getCurrentTime();
    console.log('\n📊 デーモンステータス:');
    console.log(`   現在時刻: ${now.toLocaleString('ja-JP')}`);
    console.log(`   実行中: ${this.isRunning ? 'はい' : 'いいえ'}`);
    console.log(`   最終実行日: ${this.lastRunDate || 'なし'}`);
    console.log(`   次回実行予定: 毎日深夜1時`);
  }
}

// メイン実行
async function main() {
  const daemon = new BlogDaemon();
  
  // コマンドライン引数の処理
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    daemon.showStatus();
    return;
  }
  
  if (args.includes('--run-now')) {
    console.log('🚀 即座に実行します...');
    await daemon.runMainProcess();
    return;
  }

  // デーモンを開始
  await daemon.start();
}

// スクリプトが直接実行された場合のみmain()を実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ デーモン実行エラー:', error);
    process.exit(1);
  });
}

module.exports = BlogDaemon; 