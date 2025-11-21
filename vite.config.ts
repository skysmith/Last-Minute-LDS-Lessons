import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // In Vercel, system env vars might be in process.env, local .env in `env` object
  // We check both to ensure the API_KEY is picked up during the build.
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // This exposes the env var to the client-side code
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});