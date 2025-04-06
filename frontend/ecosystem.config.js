module.exports = {
  apps: [{
    name: 'auth-system',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    // הגדרות ניטור
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    // הגדרות ביצועים
    node_args: '--max-old-space-size=1024',
    // הגדרות בריאות
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    // הגדרות אבטחה
    kill_timeout: 3000,
    wait_ready: true,
    listen_timeout: 10000,
  }]
} 