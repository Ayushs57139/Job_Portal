/**
 * PM2 Ecosystem Configuration
 * Used for production deployment with automatic restart on crashes
 */

module.exports = {
  apps: [{
    name: 'jobwala-server',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000,
    listen_timeout: 10000,
    shutdown_with_message: true,
    // Restart on error
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    // Auto-restart if memory exceeds 1GB
    max_memory_restart: '1G',
    // Health check
    health_check_grace_period: 3000
  }]
};

