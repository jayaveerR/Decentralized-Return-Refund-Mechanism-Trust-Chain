import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/Decentralized-Return-RefundMechanism-Trust-Chai/',   // ✅ just repo name with slashes
})
