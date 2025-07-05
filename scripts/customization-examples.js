// カスタマイズ例テンプレート
// このファイルをコピーして、scripts/index.jsをカスタマイズしてください

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// ========================================
// カスタマイズ例1: より詳細なプロンプト
// ========================================
async function postToDifyDetailed(memoContent) {
  const detailedQuery = `
以下のメモ内容を分析し、ブログ記事の提案を以下の形式で作成してください：

## 分析結果
1. **メインのテーマ**: メモの中心的なテーマを抽出
2. **技術的なポイント**: 技術的な学びや気づき
3. **読者への価値**: 読者が得られる具体的な価値

## ブログ記事提案
1. **タイトル案**（3つ）:
   - 学習記録系
   - 実践メモ系
   - トラブルシュート系

2. **見出し構成**:
   - はじめに
   - 背景・目的
   - 問題の発生
   - 試行錯誤・考察
   - まとめ & 次回予告

3. **技術的なポイント**:
   - 使用技術
   - 学んだこと
   - 次回への課題

メモ内容：
${memoContent}
`;

  // Dify APIに送信
  const response = await fetch(process.env.DIFY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {},
      query: detailedQuery,
      response_mode: "blocking",
      user: "github-actions-detailed"
    })
  });

  return response.json();
}

// ========================================
// カスタマイズ例2: 複数ファイル処理
// ========================================
async function processMultipleMemos() {
  // 過去7日間のmemoファイルを処理
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  const results = [];
  
  for (const date of dates) {
    const memoPath = path.join(__dirname, '..', 'memo', `${date}-topic.md`);
    
    if (fs.existsSync(memoPath)) {
      const memoContent = fs.readFileSync(memoPath, 'utf8');
      const response = await postToDify(memoContent);
      
      results.push({
        date: date,
        memoContent: memoContent,
        difyResponse: response
      });
      
      // 少し待機してAPI制限を避ける
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

// ========================================
// カスタマイズ例3: エラーハンドリング強化
// ========================================
async function postToDifyWithRetry(memoContent, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(process.env.DIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
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
        if (response.status === 429 && attempt < maxRetries) {
          // Rate limit - 待機してリトライ
          const waitTime = Math.pow(2, attempt) * 1000; // 指数バックオフ
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 一般的なエラーの場合は少し待機してリトライ
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// ========================================
// カスタマイズ例4: 結果の後処理
// ========================================
function processDifyResponse(difyResponse) {
  const answer = difyResponse.answer || difyResponse.message || '';
  
  // 回答を構造化
  const analysis = {
    timestamp: new Date().toISOString(),
    rawResponse: difyResponse,
    extractedData: {
      blogIdeas: extractBlogIdeas(answer),
      technicalPoints: extractTechnicalPoints(answer),
      nextSteps: extractNextSteps(answer),
      keywords: extractKeywords(answer)
    }
  };
  
  return analysis;
}

function extractBlogIdeas(text) {
  // ブログアイデアを抽出するロジック
  const ideas = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.includes('タイトル') || line.includes('アイデア') || line.includes('記事')) {
      ideas.push(line.trim());
    }
  }
  
  return ideas;
}

function extractTechnicalPoints(text) {
  // 技術的なポイントを抽出するロジック
  const points = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.includes('技術') || line.includes('コード') || line.includes('API') || line.includes('エラー')) {
      points.push(line.trim());
    }
  }
  
  return points;
}

function extractNextSteps(text) {
  // 次のステップを抽出するロジック
  const steps = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.includes('次回') || line.includes('今後') || line.includes('課題')) {
      steps.push(line.trim());
    }
  }
  
  return steps;
}

function extractKeywords(text) {
  // キーワードを抽出するロジック
  const keywords = [];
  const techKeywords = ['React', 'JavaScript', 'TypeScript', 'API', 'GitHub', 'Node.js', 'npm'];
  
  for (const keyword of techKeywords) {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords;
}

// ========================================
// カスタマイズ例5: 異なる保存形式
// ========================================
function saveResultAsCSV(date, memoContent, difyResponse) {
  const csvDir = path.join(__dirname, '..', 'logs', 'csv');
  const csvPath = path.join(csvDir, `${date}-dify-response.csv`);
  
  // CSVディレクトリが存在しない場合は作成
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
  }
  
  const answer = difyResponse.answer || difyResponse.message || '';
  const csvContent = `Date,Timestamp,MemoContent,DifyResponse\n"${date}","${new Date().toISOString()}","${memoContent.replace(/"/g, '""')}","${answer.replace(/"/g, '""')}"\n`;
  
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`CSV saved to: ${csvPath}`);
}

function saveResultAsMarkdown(date, memoContent, difyResponse) {
  const mdDir = path.join(__dirname, '..', 'logs', 'markdown');
  const mdPath = path.join(mdDir, `${date}-dify-response.md`);
  
  // Markdownディレクトリが存在しない場合は作成
  if (!fs.existsSync(mdDir)) {
    fs.mkdirSync(mdDir, { recursive: true });
  }
  
  const answer = difyResponse.answer || difyResponse.message || '';
  const mdContent = `# Dify API Response - ${date}

## Original Memo
\`\`\`
${memoContent}
\`\`\`

## AI Response
${answer}

## Metadata
- Date: ${date}
- Timestamp: ${new Date().toISOString()}
- Response ID: ${difyResponse.id || 'N/A'}
`;
  
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`Markdown saved to: ${mdPath}`);
}

// ========================================
// 使用例
// ========================================
async function exampleUsage() {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '-');
  const memoPath = path.join(__dirname, '..', 'memo', `${today}-topic.md`);
  
  if (fs.existsSync(memoPath)) {
    const memoContent = fs.readFileSync(memoPath, 'utf8');
    
    // 例1: 詳細なプロンプトで処理
    const detailedResponse = await postToDifyDetailed(memoContent);
    
    // 例2: エラーハンドリング付きで処理
    const retryResponse = await postToDifyWithRetry(memoContent);
    
    // 例3: 結果を後処理
    const processedResponse = processDifyResponse(retryResponse);
    
    // 例4: 異なる形式で保存
    saveResultAsCSV(today, memoContent, retryResponse);
    saveResultAsMarkdown(today, memoContent, retryResponse);
    
    console.log('All processing completed!');
  }
}

// このファイルを直接実行した場合の例
if (require.main === module) {
  exampleUsage().catch(console.error);
}

module.exports = {
  postToDifyDetailed,
  processMultipleMemos,
  postToDifyWithRetry,
  processDifyResponse,
  saveResultAsCSV,
  saveResultAsMarkdown
}; 