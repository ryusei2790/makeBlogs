#!/bin/bash

# 現在のディレクトリを取得
CURRENT_DIR=$(pwd)

# cronジョブを追加（毎日深夜1時に実行）
(crontab -l 2>/dev/null; echo "0 1 * * * cd $CURRENT_DIR && npm start") | crontab -

echo "Cron job added successfully!"
echo "The script will run every day at 1:00 AM"
echo "To check current cron jobs: crontab -l"
echo "To remove this cron job: crontab -e" 