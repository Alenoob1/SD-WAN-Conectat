import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log("----------------------------------------");
  console.log("VITE_OPENAI_API_KEY LOADED:", env.VITE_OPENAI_API_KEY ? "YES" : "NO");
  console.log("VITE_API_URL LOADED:", env.VITE_API_URL ? "YES" : "NO");
  console.log("PROCESS CWD:", process.cwd());
  console.log("----------------------------------------");
  return {
    plugins: [react(), tailwindcss()],
  }
})
