#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 環境変数ファイルの読み込み
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !key.startsWith('#')) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  }
  return {};
}

// メイン処理
async function main() {
  console.log('🚀 ローカル環境でDify API統合を開始します...\n');
  
  // 環境変数を読み込み
  const envVars = loadEnvFile();
  
  // 必要な環境変数のチェック
  const requiredVars = ['DIFY_API_URL', 'DIFY_API_KEY'];
  const missingVars = requiredVars.filter(varName => !envVars[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 必要な環境変数が設定されていません:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 .envファイルを作成して環境変数を設定してください。');
    console.error('   例: cp env.example .env');
    process.exit(1);
  }
  
  console.log('✅ 環境変数の設定を確認しました');
  console.log(`   Dify API URL: ${envVars.DIFY_API_URL}`);
  console.log(`   Auto Post: ${envVars.AUTO_POST || 'false'}\n`);
  
  // index.jsを実行
  const child = spawn('node', ['scripts/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, ...envVars }
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ 処理が正常に完了しました！');
      console.log('\n📁 生成されたファイル:');
      console.log('   - logs/yyyy-mm-dd-dify-response.json');
      console.log('   - blogs/memoToBlogs/yyyy-mm-dd.md');
      console.log('   - blogs/created_blogs_md/yyyy-mm-dd-script.md');
      console.log('   - blogs/created_blogs_json/yyyy-mm-dd-script.json');
    } else {
      console.error(`\n❌ 処理がエラーで終了しました (コード: ${code})`);
      process.exit(code);
    }
  });
  
  child.on('error', (error) => {
    console.error('❌ スクリプト実行エラー:', error);
    process.exit(1);
  });
}

// スクリプトが直接実行された場合のみmain()を実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 実行エラー:', error);
    process.exit(1);
  });
}

module.exports = { main, loadEnvFile }; 