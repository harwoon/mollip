import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    // 외부 접속 허용
    host: true,
    allowedHosts: true,

    // Google 로그인용 Referrer Policy
    headers: {
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})