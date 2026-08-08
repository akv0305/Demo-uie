module.exports = {
  apps: [
    {
      name: 'erp-shell',
      script: 'npx',
      args: 'serve out -l 3000',
      cwd: '/home/user/webapp',
      env: { NODE_ENV: 'production' },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
