const chokidar = require('chokidar');
const path = require('path');
const { postToMicroCMS } = require('./postToMicroCMS');

// 監視するディレクトリ
const targetDir = path.join(process.cwd(), 'blogs/created_blogs');

// .mdファイルの作成を監視
const watcher = chokidar.watch(targetDir, {
  persistent: true,
  ignoreInitial: true,
  depth: 0,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
});

watcher.on('add', (filePath) => {
  if (filePath.endsWith('.md')) {
    console.log(`新しいMarkdownファイル検出: ${filePath}`);
    postToMicroCMS(filePath)
      .then(() => console.log('microCMSへの投稿完了'))
      .catch((err) => console.error('microCMS投稿エラー:', err));
  }
});

console.log('blogs/created_blogsディレクトリの.mdファイル作成を監視中...'); 