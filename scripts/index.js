require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// 今日の日付を取得（JST）
function getTodayDate() {
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const jstTime = new Date(now.getTime() + jstOffset * 60000);

  jstTime.setDate(jstTime.getDate() - 1);
  
  const year = jstTime.getFullYear();
  const month = String(jstTime.getMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day-1}`;
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
  // 環境変数で保存場所を指定、未設定の場合はデフォルト
  const logDir = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');
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

// Difyの返答を解析してブログ記事構成案を作成
function createBlogStructure(date, difyResponse) {
  const answer = difyResponse.answer || difyResponse.message || '';
  
  // Difyの返答をより詳細に解析
  const sections = [
    {
      heading: "はじめに",
      content: "こんにちは！Ryuseiです。"
    },
    {
      heading: "Difyからの提案",
      content: answer  // 生のDify返答
    },
    {
      heading: "技術的なポイント",
      content: extractTechnicalPoints(answer)  // 技術的な部分を抽出
    },
    {
      heading: "ブログ記事のアイデア",
      content: extractBlogIdeas(answer)  // ブログアイデアを抽出
    }
  ];
  
  return {
    title: `【学習記録】${date}の学びと考察`,
    sections: sections
  };
}

// ブログ記事構成案を保存
function saveBlogStructure(date, blogStructure) {
  // 環境変数で保存場所を指定、未設定の場合はデフォルト
  const memoToBlogsDir = process.env.BLOG_STRUCTURE_DIR || path.join(__dirname, '..', 'blogs', 'memoToBlogs');
  const blogStructurePath = path.join(memoToBlogsDir, `${date}.md`);
  
  // memoToBlogsディレクトリが存在しない場合は作成
  if (!fs.existsSync(memoToBlogsDir)) {
    fs.mkdirSync(memoToBlogsDir, { recursive: true });
  }
  
  // Markdown形式でブログ記事構成案を作成
  let markdownContent = `# ブログ記事構成案（${date}）\n\n`;
  markdownContent += `## タイトル案\n`;
  markdownContent += `1. ${blogStructure.title}\n\n`;
  markdownContent += `---\n\n`;
  markdownContent += `## 記事構成\n\n`;
  
  blogStructure.sections.forEach(section => {
    markdownContent += `### ${section.heading}\n`;
    markdownContent += `- ${section.content}\n\n`;
  });
  
  try {
    fs.writeFileSync(blogStructurePath, markdownContent, 'utf8');
    console.log(`Blog structure saved to: ${blogStructurePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving blog structure: ${error.message}`);
    return false;
  }
}

// 完成したブログ記事をMarkdown形式で保存
function saveCompletedBlogMD(date, blogStructure) {
  const createdBlogsMDDir = process.env.CREATED_BLOGS_MD_DIR || path.join(__dirname, '..', 'blogs', 'created_blogs_md');
  const blogMDPath = path.join(createdBlogsMDDir, `${date}-script.md`);
  
  // created_blogs_mdディレクトリが存在しない場合は作成
  if (!fs.existsSync(createdBlogsMDDir)) {
    fs.mkdirSync(createdBlogsMDDir, { recursive: true });
  }
  
  // SEO対策済みのMarkdownブログ記事を作成
  let markdownContent = `---
title: "${blogStructure.title}"
description: "Dify APIから生成されたブログ記事です。"
keywords: ["Dify", "AI", "ブログ", "学習記録"]
date: "${date}"
author: "Ryusei"
tags: ["Dify", "AI", "学習記録"]
---

# ${blogStructure.title}

`;
  
  blogStructure.sections.forEach(section => {
    markdownContent += `## ${section.heading}\n\n`;
    markdownContent += `${section.content}\n\n`;
  });
  
  try {
    fs.writeFileSync(blogMDPath, markdownContent, 'utf8');
    console.log(`Completed blog MD saved to: ${blogMDPath}`);
    return true;
  } catch (error) {
    console.error(`Error saving completed blog MD: ${error.message}`);
    return false;
  }
}

// 完成したブログ記事をJSON形式で保存
function saveCompletedBlogJSON(date, blogStructure) {
  const createdBlogsJSONDir = process.env.CREATED_BLOGS_JSON_DIR || path.join(__dirname, '..', 'blogs', 'created_blogs_json');
  const blogJSONPath = path.join(createdBlogsJSONDir, `${date}-script.json`);
  
  // created_blogs_jsonディレクトリが存在しない場合は作成
  if (!fs.existsSync(createdBlogsJSONDir)) {
    fs.mkdirSync(createdBlogsJSONDir, { recursive: true });
  }
  
  // JSON形式でブログ記事データを作成
  const blogData = {
    metadata: {
      title: blogStructure.title,
      description: "Dify APIから生成されたブログ記事です。",
      keywords: ["Dify", "AI", "ブログ", "学習記録"],
      date: date,
      author: "Ryusei",
      tags: ["Dify", "AI", "学習記録"],
      generatedAt: new Date().toISOString(),
      source: "Dify API"
    },
    content: {
      sections: blogStructure.sections
    },
    raw: blogStructure
  };
  
  try {
    fs.writeFileSync(blogJSONPath, JSON.stringify(blogData, null, 2), 'utf8');
    console.log(`Completed blog JSON saved to: ${blogJSONPath}`);
    return true;
  } catch (error) {
    console.error(`Error saving completed blog JSON: ${error.message}`);
    return false;
  }
}

// 自動ブログ投稿処理（オプション）
async function autoPostToMicroCMS(date, blogStructure) {
  const ENDPOINT_URL = process.env.ENDPOINT_URL;
  const API_KEY = process.env.API_KEY;
  
  if (!ENDPOINT_URL || !API_KEY) {
    console.log('MicroCMS credentials not found, skipping auto post');
    return false;
  }
  
  try {
    // ブログ記事の本文を作成（Markdown形式）
    let blogContent = `# ${blogStructure.title}\n\n`;
    blogStructure.sections.forEach(section => {
      blogContent += `## ${section.heading}\n\n`;
      blogContent += `${section.content}\n\n`;
    });
    
    // 説明文を生成（最初のセクションから抽出）
    const description = blogStructure.sections
      .find(section => section.heading === "今日の学び")?.content
      ?.substring(0, 100) + "..." || "Dify APIから生成されたブログ記事です。";
    
    // タグを生成
    const tags = ["Dify", "AI", "学習記録", date];
    
    // MicroCMSに投稿するデータを構築
    const postData = {
      title: blogStructure.title,
      content: blogContent,
      description: description,
      tags: tags,
      publishedAt: new Date().toISOString(),
      // カスタムフィールドがあれば追加
      category: "学習記録",
      author: "Ryusei",
      source: "Dify API"
    };
    
    console.log('Posting to MicroCMS with data:', JSON.stringify(postData, null, 2));
    
    // MicroCMSに投稿
    const response = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'X-MICROCMS-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Blog post published to MicroCMS successfully:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Failed to post to MicroCMS: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error(`Error posting to MicroCMS: ${error.message}`);
    return false;
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
    
    // ブログ記事構成案を作成
    console.log('Creating blog structure...');
    const blogStructure = createBlogStructure(today, difyResponse);
    
    // ブログ記事構成案を保存
    const structureSaved = saveBlogStructure(today, blogStructure);
    
    if (structureSaved) {
      console.log('Blog structure created successfully');
      
      // 完成したブログ記事をMarkdown形式で保存
      console.log('Saving completed blog MD...');
      const mdSaved = saveCompletedBlogMD(today, blogStructure);
      
      // 完成したブログ記事をJSON形式で保存
      console.log('Saving completed blog JSON...');
      const jsonSaved = saveCompletedBlogJSON(today, blogStructure);
      
      if (mdSaved && jsonSaved) {
        console.log('Completed blog files saved successfully');
        
        // オプション: 自動投稿
        const autoPostEnabled = process.env.AUTO_POST === 'true';
        if (autoPostEnabled) {
          console.log('Auto posting to MicroCMS...');
          await autoPostToMicroCMS(today, blogStructure);
        }
      }
    }
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
