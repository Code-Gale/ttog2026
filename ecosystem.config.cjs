module.exports = {
  apps: [
    {
      name: 'tomtom-web',
      cwd: '/var/www/ttog2026',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 4075',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'tomtom-api',
      cwd: '/var/www/ttog2026/server',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
