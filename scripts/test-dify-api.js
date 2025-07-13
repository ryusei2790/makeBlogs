const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// テスト用のサンプルメモ内容
const SAMPLE_MEMO_CONTENT = `今日はReactのuseStateについて学習しました。

## 学んだこと
- useStateは関数コンポーネントで状態を管理するためのフック
- 配列の分割代入を使って状態と更新関数を取得
- 状態更新は非同期で行われる

## 気づいたこと
- 状態更新時は新しいオブジェクトを作成する必要がある
- 依存配列の重要性を理解した

## 次回の課題
- useEffectの使い方を詳しく学習する
- カスタムフックの作成方法を試してみる`;

// 環境変数の確認
function checkEnvironmentVariables() {
  console.log('🔍 環境変数の確認中...\n');
  
  const requiredVars = {
    'DIFY_API_URL': process.env.DIFY_API_URL,
    'DIFY_API_KEY': process.env.DIFY_API_KEY
  };
  
  const optionalVars = {
    'BLOG_STYLE': process.env.BLOG_STYLE || '学習記録',
    'TARGET_AUDIENCE': process.env.TARGET_AUDIENCE || '初心者',
    'TECHNICAL_FOCUS': process.env.TECHNICAL_FOCUS || '',
    'BLOG_LENGTH': process.env.BLOG_LENGTH || '標準',
    'INCLUDE_CODE_EXAMPLES': process.env.INCLUDE_CODE_EXAMPLES || 'true',
    'SEO_KEYWORDS': process.env.SEO_KEYWORDS || ''
  };
  
  let allRequiredVarsSet = true;
  
  console.log('📋 必須環境変数:');
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (value) {
      console.log(`   ✅ ${key}: ${key.includes('KEY') ? '***' + value.slice(-4) : value}`);
    } else {
      console.log(`   ❌ ${key}: 未設定`);
      allRequiredVarsSet = false;
    }
  });
  
  console.log('\n📋 オプション環境変数:');
  Object.entries(optionalVars).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '⚠️'} ${key}: ${value || '未設定'}`);
  });
  
  console.log('');
  return allRequiredVarsSet;
}

// Dify APIへの接続テスト
async function testDifyConnection() {
  console.log('🔗 Dify API接続テスト中...\n');
  
  try {
    const response = await fetch(process.env.DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          memo_content: 'テスト接続',
          blog_style: process.env.BLOG_STYLE || "学習記録",
          target_audience: process.env.TARGET_AUDIENCE || "初心者",
          technical_focus: process.env.TECHNICAL_FOCUS || "",
          blog_length: process.env.BLOG_LENGTH || "標準",
          include_code_examples: process.env.INCLUDE_CODE_EXAMPLES !== "false",
          seo_keywords: process.env.SEO_KEYWORDS || ""
        },
        query: 'これは接続テストです。簡単な応答を返してください。',
        response_mode: "blocking",
        user: "test-connection"
      })
    });
    
    console.log(`📡 HTTP Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API接続エラー: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API接続成功！');
    console.log(`📝 レスポンスID: ${data.message_id || 'N/A'}`);
    console.log(`💬 応答: ${data.answer ? data.answer.substring(0, 100) + '...' : 'N/A'}`);
    
    return true;
  } catch (error) {
    console.error(`❌ 接続エラー: ${error.message}`);
    return false;
  }
}

// 実際のメモ内容でのテスト
async function testWithSampleMemo() {
  console.log('\n📝 サンプルメモでのテスト実行中...\n');
  
  try {
    const response = await fetch(process.env.DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          memo_content: SAMPLE_MEMO_CONTENT,
          blog_style: process.env.BLOG_STYLE || "学習記録",
          target_audience: process.env.TARGET_AUDIENCE || "初心者",
          technical_focus: process.env.TECHNICAL_FOCUS || "",
          blog_length: process.env.BLOG_LENGTH || "標準",
          include_code_examples: process.env.INCLUDE_CODE_EXAMPLES !== "false",
          seo_keywords: process.env.SEO_KEYWORDS || ""
        },
        query: `以下のメモ内容を分析して、ブログ記事のアイデアや技術的な考察を提案してください：\n\n${SAMPLE_MEMO_CONTENT}`,
        response_mode: "blocking",
        user: "test-sample-memo"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API呼び出しエラー: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    
    console.log('✅ サンプルメモテスト成功！');
    console.log(`📝 レスポンスID: ${data.message_id || 'N/A'}`);
    console.log(`💬 応答長: ${data.answer ? data.answer.length : 0} 文字`);
    
    if (data.metadata && data.metadata.usage) {
      console.log(`📊 使用量:`, data.metadata.usage);
    }
    
    // レスポンスをファイルに保存
    const testDir = path.join(__dirname, '..', 'logs', 'test');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testResult = {
      timestamp: new Date().toISOString(),
      testType: 'sample-memo',
      request: {
        memoContent: SAMPLE_MEMO_CONTENT,
        inputs: {
          blog_style: process.env.BLOG_STYLE || "学習記録",
          target_audience: process.env.TARGET_AUDIENCE || "初心者",
          technical_focus: process.env.TECHNICAL_FOCUS || "",
          blog_length: process.env.BLOG_LENGTH || "標準",
          include_code_examples: process.env.INCLUDE_CODE_EXAMPLES !== "false",
          seo_keywords: process.env.SEO_KEYWORDS || ""
        }
      },
      response: data
    };
    
    const testFilePath = path.join(testDir, `test-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(testFilePath, JSON.stringify(testResult, null, 2), 'utf8');
    console.log(`💾 テスト結果を保存: ${testFilePath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ サンプルメモテストエラー: ${error.message}`);
    return false;
  }
}

// 実際のmemoファイルでのテスト
async function testWithRealMemo(date = null) {
  if (!date) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    date = `${year}-${month}-${day}`;
  }
  
  console.log(`\n📄 実際のmemoファイルでのテスト実行中... (${date})\n`);
  
  const memoPath = path.join(__dirname, '..', 'memo', `${date}-topic.md`);
  
  if (!fs.existsSync(memoPath)) {
    console.log(`⚠️  memoファイルが見つかりません: ${memoPath}`);
    console.log('   サンプルメモでのテストのみ実行します。');
    return false;
  }
  
  try {
    const memoContent = fs.readFileSync(memoPath, 'utf8');
    console.log(`📖 memoファイル読み込み成功: ${memoPath}`);
    console.log(`📝 内容長: ${memoContent.length} 文字\n`);
    
    const response = await fetch(process.env.DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          memo_content: memoContent,
          blog_style: process.env.BLOG_STYLE || "学習記録",
          target_audience: process.env.TARGET_AUDIENCE || "初心者",
          technical_focus: process.env.TECHNICAL_FOCUS || "",
          blog_length: process.env.BLOG_LENGTH || "標準",
          include_code_examples: process.env.INCLUDE_CODE_EXAMPLES !== "false",
          seo_keywords: process.env.SEO_KEYWORDS || ""
        },
        query: `以下のメモ内容を分析して、ブログ記事のアイデアや技術的な考察を提案してください：\n\n${memoContent}`,
        response_mode: "blocking",
        user: "test-real-memo"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API呼び出しエラー: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    
    console.log('✅ 実際のmemoテスト成功！');
    console.log(`📝 レスポンスID: ${data.message_id || 'N/A'}`);
    console.log(`💬 応答長: ${data.answer ? data.answer.length : 0} 文字`);
    
    if (data.metadata && data.metadata.usage) {
      console.log(`📊 使用量:`, data.metadata.usage);
    }
    
    // レスポンスをファイルに保存
    const testDir = path.join(__dirname, '..', 'logs', 'test');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testResult = {
      timestamp: new Date().toISOString(),
      testType: 'real-memo',
      date: date,
      request: {
        memoContent: memoContent,
        inputs: {
          blog_style: process.env.BLOG_STYLE || "学習記録",
          target_audience: process.env.TARGET_AUDIENCE || "初心者",
          technical_focus: process.env.TECHNICAL_FOCUS || "",
          blog_length: process.env.BLOG_LENGTH || "標準",
          include_code_examples: process.env.INCLUDE_CODE_EXAMPLES !== "false",
          seo_keywords: process.env.SEO_KEYWORDS || ""
        }
      },
      response: data
    };
    
    const testFilePath = path.join(testDir, `test-real-${date}.json`);
    fs.writeFileSync(testFilePath, JSON.stringify(testResult, null, 2), 'utf8');
    console.log(`💾 テスト結果を保存: ${testFilePath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ 実際のmemoテストエラー: ${error.message}`);
    return false;
  }
}

// メイン処理
async function main() {
  console.log('🧪 Dify API テストスクリプト開始\n');
  console.log('=' * 50);
  
  // 環境変数の確認
  const envVarsOk = checkEnvironmentVariables();
  
  if (!envVarsOk) {
    console.error('❌ 必須環境変数が設定されていません。');
    console.error('📝 .envファイルを作成して環境変数を設定してください。');
    process.exit(1);
  }
  
  // 接続テスト
  const connectionOk = await testDifyConnection();
  
  if (!connectionOk) {
    console.error('❌ Dify APIへの接続に失敗しました。');
    console.error('📝 API URLとAPI Keyを確認してください。');
    process.exit(1);
  }
  
  // サンプルメモでのテスト
  const sampleTestOk = await testWithSampleMemo();
  
  // 実際のmemoファイルでのテスト
  const realTestOk = await testWithRealMemo();
  
  console.log('\n' + '=' * 50);
  console.log('📊 テスト結果サマリー:');
  console.log(`   ✅ 環境変数: ${envVarsOk ? 'OK' : 'NG'}`);
  console.log(`   ✅ API接続: ${connectionOk ? 'OK' : 'NG'}`);
  console.log(`   ✅ サンプルメモテスト: ${sampleTestOk ? 'OK' : 'NG'}`);
  console.log(`   ✅ 実際のmemoテスト: ${realTestOk ? 'OK' : 'NG'}`);
  
  if (envVarsOk && connectionOk && sampleTestOk) {
    console.log('\n🎉 すべてのテストが成功しました！');
    console.log('📁 テスト結果は logs/test/ ディレクトリに保存されています。');
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
🧪 Dify API テストスクリプト

使用方法:
  node scripts/test-dify-api.js [オプション]

オプション:
  -d, --date <YYYY-MM-DD>  指定した日付のmemoファイルでテスト
  -h, --help                このヘルプを表示

例:
  node scripts/test-dify-api.js                    # 今日のmemoファイルでテスト
  node scripts/test-dify-api.js --date 2024-01-15  # 指定日付のmemoファイルでテスト

注意:
  - .envファイルにDIFY_API_URLとDIFY_API_KEYが設定されている必要があります
  - テスト結果は logs/test/ ディレクトリに保存されます
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
      testWithRealMemo(options.date);
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
  checkEnvironmentVariables,
  testDifyConnection,
  testWithSampleMemo,
  testWithRealMemo
}; 