module.exports = {
  apps: [
    {
      name: "dubai-watches-backend",
      script: "server.js",
      cwd: "/var/www/your-site/data/www/your-domain/server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5002,
        MONGO_URI: "mongodb+srv://developerinspitetech_db_user:IHxmQWUKUSKbIkhu@cluster0.bqn54m2.mongodb.net/t24watches?retryWrites=true&w=majority&appName=Cluster0",
        CLOUDINARY_CLOUD_NAME: "dwqxzzqpn",
        CLOUDINARY_API_KEY: "166385748614328",
        CLOUDINARY_API_SECRET: "Cnc2G4jSlw-XDDvTlu72r1izalQ",
        JWT_SECRET: "t24watches_dubai_luxury_secret_signature_jwt_hash_key_182937",
        REMOVEBG_API_KEY: "ekdSZUTSXLj7MMS46SueWEqC"
      }
    }
  ]
};
