module.exports = {
  apps: [
    {
      name: 'veloce-backend',
      cwd: './backend',
      script: 'uvicorn',
      args: 'app.main:asgi_app --host 0.0.0.0 --port 8000 --reload',
      interpreter: 'python',
      env: {
        PYTHONUNBUFFERED: '1',
      },
    },
    {
      name: 'veloce-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/vite',
      args: '--host',
      env: {
        VITE_API_URL: 'http://localhost:8000/api/v1',
      },
    },
  ],
};