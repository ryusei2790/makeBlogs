const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// 今日の日付を取得（JST）
function getTodayDate() {
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const jstTime = new Date(now.getTime() + jstOffset * 60000);
  
  const year = jstTime.getFullYear();
  const month = String(jstTime.getMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// memoファイルを読み込む
function readMemoFile(date) {
  const memoPath = path.join(__dirname, '..', 'memo', `${date}-topic.md`);
  
  try {
    if (fs.existsSync(memoPath)) {
      const content = fs.readFileSync(memoPath, 'utf8');
      return content;
    } else {
      console.log(`Memo file not found: ${memoPath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error reading memo file: ${error.message}`);
    return null;
  }
}

// Dify APIにPOSTリクエストを送信
async function postToDify(memoContent) {
  const DIFY_API_URL = process.env.DIFY_API_URL;
  const DIFY_API_KEY = process.env.DIFY_API_KEY;
  
  if (!DIFY_API_URL || !DIFY_API_KEY) {
    console.error('Dify API credentials not found in environment variables');
    return null;
  }
  
  try {
    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {},
        query: `以下のメモ内容を分析して、ブログ記事のアイデアや技術的な考察を提案してください：\n\n${memoContent}`,
        response_mode: "blocking",
        user: "github-actions"
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error posting to Dify API: ${error.message}`);
    return null;
  }
}

// 結果をログファイルに保存
function saveResult(date, memoContent, difyResponse) {
  const logDir = path.join(__dirname, '..', 'logs');
  const logPath = path.join(logDir, `${date}-dify-response.json`);
  
  // logsディレクトリが存在しない場合は作成
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logData = {
    date: date,
    timestamp: new Date().toISOString(),
    memoContent: memoContent,
    difyResponse: difyResponse
  };
  
  try {
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf8');
    console.log(`Response saved to: ${logPath}`);
  } catch (error) {
    console.error(`Error saving log file: ${error.message}`);
  }
}

// メイン処理
async function main() {
  console.log('Starting Dify API integration...');
  
  const today = getTodayDate();
  console.log(`Processing memo for date: ${today}`);
  
  // memoファイルを読み込み
  const memoContent = readMemoFile(today);
  
  if (!memoContent) {
    console.log('No memo content found, skipping Dify API call');
    return;
  }
  
  console.log('Memo content loaded successfully');
  
  // Dify APIにPOST
  console.log('Sending request to Dify API...');
  const difyResponse = await postToDify(memoContent);
  
  if (difyResponse) {
    console.log('Dify API response received successfully');
    console.log('Response:', JSON.stringify(difyResponse, null, 2));
    
    // 結果をログファイルに保存
    saveResult(today, memoContent, difyResponse);
  } else {
    console.log('Failed to get response from Dify API');
  }
  
  console.log('Dify API integration completed');
}

// スクリプトが直接実行された場合のみmain()を実行
if (require.main === module) {
  main().catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = { main, getTodayDate, readMemoFile, postToDify };
