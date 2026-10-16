import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// proxy /api ไปยัง backend เพื่อไม่ต้องตั้งค่า CORS ตอน dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
});
