import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: change 'choral-ledger' below to your actual GitHub repo name.
// If your repo is https://github.com/yourname/my-repo, base should be '/my-repo/'.
export default defineConfig({
  plugins: [react()],
  base: "/choral-ledger/",
});
