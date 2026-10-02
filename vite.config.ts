import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// In development the admin server (npm run admin, port 3001) is reached through the same address as the site.
const admin = { target: "http://localhost:3001", changeOrigin: false };
export default defineConfig({ plugins: [react()], server: { proxy: { "/api": admin, "/admin": admin, "/uploads": admin } } });
