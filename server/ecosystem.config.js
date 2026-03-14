/**
 * PM2 Ecosystem Configuration
 * Production-ready configuration with automatic restart on crashes and high load
 */

module.exports = {
  apps: [{
    name: 'jobwala-server',
    script: './index.js',
    instances: 1,
    autorestart: true, // Auto-restart on crashes
    watch: false,
    max_memory_restart: '2G', // Restart if memory exceeds 2GB
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
    kill_timeout: 10000, // Increased timeout for graceful shutdown
    listen_timeout: 15000, // Increased timeout for server to start
    shutdown_with_message: true,
    // Restart configuration
    restart_delay: 3000, // Wait 3 seconds before restart
    max_restarts: 50, // Allow up to 50 restarts (unlimited in production)
    min_uptime: '10s', // Minimum uptime before considering it stable
    // Auto-restart if memory exceeds 2GB
    max_memory_restart: '2G',
    // Health check
    health_check_grace_period: 5000,
    // Advanced restart strategies
    exp_backoff_restart_delay: 100, // Exponential backoff starting delay
    // Ignore specific exit codes (0 = normal exit)
    stop_exit_codes: [0],
    // Auto-restart on all other exit codes
    autorestart: true,
    // Log rotation
    log_type: 'json',
    // Process management
    exec_mode: 'fork',
    // Node args for production
    node_args: process.env.NODE_ENV === 'production' ? '--max-old-space-size=2048' : '',
    // Environment variables
    env_file: '.env',
    // Instance variables
    instance_var: 'INSTANCE_ID',
    // Source map support
    source_map_support: true,
    // PM2 will automatically restart on any uncaught exception
    pmx: true,
    // Monitoring
    pm2_plus: false
  }]
};

