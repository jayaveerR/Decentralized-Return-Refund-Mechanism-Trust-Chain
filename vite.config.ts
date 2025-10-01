import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: 'https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai',   // 👈 replace with your GitHub repo name
})
