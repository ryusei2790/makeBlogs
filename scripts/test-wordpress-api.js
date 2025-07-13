const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// テスト用のサンプル記事内容
const SAMPLE_POST_CONTENT = `# WordPress API テスト記事

これはWordPress APIのテスト用記事です。

## テスト内容
- WordPress REST APIへの接続テスト
- 記事投稿機能のテスト
- 認証機能の確認

## 技術的なポイント
- REST APIを使用した投稿
- Basic認証による認証
- JSON形式でのデータ送信

## まとめ
このテストにより、WordPressへの自動投稿機能が正常に動作することを確認できます。`;

// 環境変数の確認
function checkWordPressEnvironmentVariables() {
  console.log('🔍 WordPress環境変数の確認中...\n');
  
  const requiredVars = {
    'WP_URL': process.env.WP_URL,
    'WP_USER': process.env.WP_USER,
    'WP_APP_PASSWORD': process.env.WP_APP_PASSWORD
  };
  
  let allRequiredVarsSet = true;
  
  console.log('📋 WordPress必須環境変数:');
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (value) {
      if (key === 'WP_APP_PASSWORD') {
        console.log(`   ✅ ${key}: ***${value.slice(-4)}`);
      } else {
        console.log(`   ✅ ${key}: ${value}`);
      }
    } else {
      console.log(`   ❌ ${key}: 未設定`);
      allRequiredVarsSet = false;
    }
  });
  
  console.log('');
  return allRequiredVarsSet;
}

// WordPress APIへの接続テスト
async function testWordPressConnection() {
  console.log('🔗 WordPress API接続テスト中...\n');
  
  try {
    // WordPressのサイト情報を取得（認証不要）
    const siteInfoUrl = process.env.WP_URL.replace('/wp-json/wp/v2/posts', '/wp-json');
    
    console.log(`📡 WordPressサイト情報取得: ${siteInfoUrl}`);
    
    const siteResponse = await fetch(siteInfoUrl);
    
    if (!siteResponse.ok) {
      console.error(`❌ WordPressサイト接続エラー: ${siteResponse.status} ${siteResponse.statusText}`);
      return false;
    }
    
    const siteInfo = await siteResponse.json();
    console.log('✅ WordPressサイト接続成功！');
    console.log(`📝 サイト名: ${siteInfo.name || 'N/A'}`);
    console.log(`🌐 サイトURL: ${siteInfo.url || 'N/A'}`);
    console.log(`📅 WordPress バージョン: ${siteInfo.version || 'N/A'}\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ WordPress接続エラー: ${error.message}`);
    return false;
  }
}

// WordPress API認証テスト
async function testWordPressAuthentication() {
  console.log('🔐 WordPress API認証テスト中...\n');
  
  try {
    // 現在のユーザー情報を取得して認証をテスト
    const userInfoUrl = process.env.WP_URL.replace('/wp-json/wp/v2/posts', '/wp-json/wp/v2/users/me');
    
    console.log(`📡 ユーザー認証テスト: ${userInfoUrl}`);
    
    const authString = Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
    
    const userResponse = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!userResponse.ok) {
      console.error(`❌ WordPress認証エラー: ${userResponse.status} ${userResponse.statusText}`);
      if (userResponse.status === 401) {
        console.error('   認証情報（ユーザー名またはアプリケーションパスワード）が正しくありません。');
      }
      return false;
    }
    
    const userInfo = await userResponse.json();
    console.log('✅ WordPress認証成功！');
    console.log(`👤 ユーザー名: ${userInfo.name || 'N/A'}`);
    console.log(`📧 メール: ${userInfo.email || 'N/A'}`);
    console.log(`🆔 ユーザーID: ${userInfo.id || 'N/A'}`);
    console.log(`📝 投稿権限: ${userInfo.capabilities?.edit_posts ? 'あり' : 'なし'}\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ WordPress認証エラー: ${error.message}`);
    return false;
  }
}

// WordPressへの投稿テスト（下書き）
async function testWordPressPostDraft() {
  console.log('📝 WordPress投稿テスト（下書き）実行中...\n');
  
  try {
    const authString = Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
    
    const postData = {
      title: `[テスト] WordPress API テスト記事 - ${new Date().toISOString().split('T')[0]}`,
      content: SAMPLE_POST_CONTENT,
      status: 'draft', // 下書きとして投稿
      excerpt: 'WordPress APIのテスト用記事です。',
      categories: [], // カテゴリは空
      tags: ['テスト', 'API', '自動投稿']
    };
    
    console.log('📤 投稿データ:');
    console.log(`   タイトル: ${postData.title}`);
    console.log(`   ステータス: ${postData.status}`);
    console.log(`   内容長: ${postData.content.length} 文字`);
    console.log(`   タグ: ${postData.tags.join(', ')}\n`);
    
    const response = await fetch(process.env.WP_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ WordPress投稿エラー: ${response.status} ${response.statusText}`);
      console.error(`   エラー詳細: ${errorText}`);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ WordPress投稿テスト成功！');
    console.log(`📝 投稿ID: ${result.id || 'N/A'}`);
    console.log(`🔗 投稿URL: ${result.link || 'N/A'}`);
    console.log(`📅 作成日時: ${result.date || 'N/A'}`);
    console.log(`📊 ステータス: ${result.status || 'N/A'}\n`);
    
    return result;
  } catch (error) {
    console.error(`❌ WordPress投稿テストエラー: ${error.message}`);
    return false;
  }
}

// 実際のブログ記事での投稿テスト
async function testWithRealBlogPost(date = null) {
  if (!date) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    date = `${year}-${month}-${day}`;
  }
  
  console.log(`📄 実際のブログ記事での投稿テスト実行中... (${date})\n`);
  
  // 作成済みブログ記事のMarkdownファイルを探す
  const blogMDDir = process.env.CREATED_BLOGS_MD_DIR || path.join(__dirname, '..', 'blogs', 'created_blogs_md');
  const blogMDPath = path.join(blogMDDir, `${date}-script.md`);
  
  if (!fs.existsSync(blogMDPath)) {
    console.log(`⚠️  ブログ記事ファイルが見つかりません: ${blogMDPath}`);
    console.log('   下書きテストのみ実行します。');
    return false;
  }
  
  try {
    const blogContent = fs.readFileSync(blogMDPath, 'utf8');
    console.log(`📖 ブログ記事ファイル読み込み成功: ${blogMDPath}`);
    console.log(`📝 内容長: ${blogContent.length} 文字\n`);
    
    // Front Matterを解析
    const matter = require('gray-matter');
    const parsed = matter(blogContent);
    
    const authString = Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
    
    const postData = {
      title: parsed.data.title || `[自動生成] ${date}の学習記録`,
      content: parsed.content,
      status: 'draft', // 下書きとして投稿
      excerpt: parsed.data.description || 'Dify APIから自動生成されたブログ記事です。',
      categories: [],
      tags: parsed.data.tags || ['学習記録', '自動生成', date]
    };
    
    console.log('📤 投稿データ:');
    console.log(`   タイトル: ${postData.title}`);
    console.log(`   ステータス: ${postData.status}`);
    console.log(`   内容長: ${postData.content.length} 文字`);
    console.log(`   タグ: ${postData.tags.join(', ')}\n`);
    
    const response = await fetch(process.env.WP_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ WordPress投稿エラー: ${response.status} ${response.statusText}`);
      console.error(`   エラー詳細: ${errorText}`);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ 実際のブログ記事投稿テスト成功！');
    console.log(`📝 投稿ID: ${result.id || 'N/A'}`);
    console.log(`🔗 投稿URL: ${result.link || 'N/A'}`);
    console.log(`📅 作成日時: ${result.date || 'N/A'}`);
    console.log(`📊 ステータス: ${result.status || 'N/A'}\n`);
    
    return result;
  } catch (error) {
    console.error(`❌ 実際のブログ記事投稿テストエラー: ${error.message}`);
    return false;
  }
}

// テスト結果をファイルに保存
function saveTestResult(testType, result) {
  const testDir = path.join(__dirname, '..', 'logs', 'test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const testResult = {
    timestamp: new Date().toISOString(),
    testType: testType,
    result: result
  };
  
  const testFilePath = path.join(testDir, `wordpress-test-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(testFilePath, JSON.stringify(testResult, null, 2), 'utf8');
  console.log(`💾 テスト結果を保存: ${testFilePath}`);
}

// メイン処理
async function main() {
  console.log('🧪 WordPress API テストスクリプト開始\n');
  console.log('=' * 50);
  
  // 環境変数の確認
  const envVarsOk = checkWordPressEnvironmentVariables();
  
  if (!envVarsOk) {
    console.error('❌ WordPress必須環境変数が設定されていません。');
    console.error('📝 .envファイルに以下の設定を追加してください：');
    console.error('   WP_URL=https://yourdomain.com/wp-json/wp/v2/posts');
    console.error('   WP_USER=your-username');
    console.error('   WP_APP_PASSWORD=your-application-password');
    process.exit(1);
  }
  
  // 接続テスト
  const connectionOk = await testWordPressConnection();
  
  if (!connectionOk) {
    console.error('❌ WordPressサイトへの接続に失敗しました。');
    console.error('📝 WP_URLが正しいか確認してください。');
    process.exit(1);
  }
  
  // 認証テスト
  const authOk = await testWordPressAuthentication();
  
  if (!authOk) {
    console.error('❌ WordPress認証に失敗しました。');
    console.error('📝 WP_USERとWP_APP_PASSWORDを確認してください。');
    process.exit(1);
  }
  
  // 下書き投稿テスト
  const draftTestOk = await testWordPressPostDraft();
  
  if (draftTestOk) {
    saveTestResult('draft-post', draftTestOk);
  }
  
  // 実際のブログ記事での投稿テスト
  const realBlogTestOk = await testWithRealBlogPost();
  
  if (realBlogTestOk) {
    saveTestResult('real-blog-post', realBlogTestOk);
  }
  
  console.log('=' * 50);
  console.log('📊 WordPress APIテスト結果サマリー:');
  console.log(`   ✅ 環境変数: ${envVarsOk ? 'OK' : 'NG'}`);
  console.log(`   ✅ サイト接続: ${connectionOk ? 'OK' : 'NG'}`);
  console.log(`   ✅ 認証: ${authOk ? 'OK' : 'NG'}`);
  console.log(`   ✅ 下書き投稿テスト: ${draftTestOk ? 'OK' : 'NG'}`);
  console.log(`   ✅ 実際のブログ記事投稿テスト: ${realBlogTestOk ? 'OK' : 'NG'}`);
  
  if (envVarsOk && connectionOk && authOk && draftTestOk) {
    console.log('\n🎉 WordPress APIテストが成功しました！');
    console.log('📁 テスト結果は logs/test/ ディレクトリに保存されています。');
    console.log('📝 投稿された記事はWordPressの管理画面で確認できます（下書き状態）。');
  } else {
    console.log('\n⚠️  一部のテストが失敗しました。');
    console.log('📝 エラーメッセージを確認して設定を見直してください。');
    process.exit(1);
  }
}

// コマンドライン引数の処理
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--date':
      case '-d':
        options.date = args[i + 1];
        i++;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }
  
  return options;
}

// ヘルプ表示
function showHelp() {
  console.log(`
🧪 WordPress API テストスクリプト

使用方法:
  node scripts/test-wordpress-api.js [オプション]

オプション:
  -d, --date <YYYY-MM-DD>  指定した日付のブログ記事でテスト
  -h, --help                このヘルプを表示

例:
  node scripts/test-wordpress-api.js                    # 今日のブログ記事でテスト
  node scripts/test-wordpress-api.js --date 2024-01-15  # 指定日付のブログ記事でテスト

注意:
  - .envファイルにWordPress設定が必要です：
    WP_URL=https://yourdomain.com/wp-json/wp/v2/posts
    WP_USER=your-username
    WP_APP_PASSWORD=your-application-password
  - テスト結果は logs/test/ ディレクトリに保存されます
  - 投稿は下書き状態で作成されます
`);
}

// スクリプト実行
if (require.main === module) {
  const options = parseArguments();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  if (options.date) {
    // 指定された日付でテスト実行
    main().then(() => {
      testWithRealBlogPost(options.date);
    }).catch(error => {
      console.error('❌ テスト実行エラー:', error);
      process.exit(1);
    });
  } else {
    // 通常のテスト実行
    main().catch(error => {
      console.error('❌ テスト実行エラー:', error);
      process.exit(1);
    });
  }
}

module.exports = {
  checkWordPressEnvironmentVariables,
  testWordPressConnection,
  testWordPressAuthentication,
  testWordPressPostDraft,
  testWithRealBlogPost
}; 