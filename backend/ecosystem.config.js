module.exports = {
  apps: [
    {
      name: "learninsight-api",
      script: "src/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      // Restart on crash
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: "5s",
      // Logging
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
