const fs = require('fs');
const fetch = require('node-fetch');

async function postToMicroCMS(filePath) {
  const endpoint = process.env.ENDPOINT_URL;
  const apiKey = process.env.API_KEY;

  // ファイルから記事を読み込む
  const content = fs.readFileSync(filePath, 'utf-8');

  // マークダウンファイルの先頭にメタデータを含めている場合パースする
  // 例: FrontMatterからtitle, description, keywordsを抽出
  const matter = require('gray-matter');
  const parsed = matter(content);

  // microCMS スキーマに合わせてJSON構築
  const data = {
    title: parsed.data.title,
    body: parsed.content, // 本文
    description: parsed.data.description,
    keywords: parsed.data.keywords,
    date: parsed.data.date,
    author: parsed.data.author,
    tags: parsed.data.tags,
  };

  // POST
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MICROCMS-API-KEY': apiKey,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('投稿失敗:', error);
  } else {
    console.log('投稿成功:', await res.json());
  }
}

module.exports = { postToMicroCMS }; 