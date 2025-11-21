/**
 * Utility to ensure logs directory exists
 * This is called at startup to create the logs directory if it doesn't exist
 */

const fs = require('fs');
const path = require('path');

const ensureLogsDir = () => {
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('Created logs directory:', logsDir);
  }
};

module.exports = ensureLogsDir;

