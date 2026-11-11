module.exports = {
  apps: [
    {
      name: 'tomtom-web',
      cwd: '/var/www/tomtom-of-gala',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 4075',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'tomtom-api',
      cwd: '/var/www/tomtom-of-gala/server',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
