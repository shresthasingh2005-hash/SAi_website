import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/pinecone': {
          target: env.VITE_PINECONE_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pinecone/, '')
        }
      }
    }
  }
})
