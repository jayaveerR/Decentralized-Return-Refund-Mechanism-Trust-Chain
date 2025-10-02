import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/Decentralized-Return-RefundMechanism-Trust-Chain',   // ✅ just repo name with slashes
})
