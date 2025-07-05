import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  // 認証（オプション）
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // ブログ投稿スクリプトを実行
    const { stdout, stderr } = await execAsync('npm start', {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ENDPOINT_URL: process.env.ENDPOINT_URL,
        API_KEY: process.env.API_KEY
      }
    });

    console.log('Blog post script executed successfully:', stdout);
    if (stderr) console.error('Script stderr:', stderr);

    res.status(200).json({ 
      success: true, 
      message: 'Blog post script executed successfully',
      output: stdout 
    });
  } catch (error) {
    console.error('Error executing blog post script:', error);
    res.status(500).json({ 
      error: 'Failed to execute blog post script',
      details: error.message 
    });
  }
}

// Vercel Cron Jobs設定
export const config = {
  schedule: '0 16 * * *'  // 毎日UTC 16:00（JST 01:00）
}; 