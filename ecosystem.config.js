module.exports = {
  apps: [
    {
      name: "main",
      script: "./src/main.js",
      watch: true,
      watch_delay: 1000,
      ignore_watch: ["node_modules", "images"],
    },
  ],
};
