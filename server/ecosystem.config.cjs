module.exports = {
  apps: [
    {
      name: "dubai-watches-backend",
      script: "server.js",
      cwd: "/var/www/fastuser/data/www/dubaiwatchesgallery.com/server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5002
      }
    }
  ]
};
