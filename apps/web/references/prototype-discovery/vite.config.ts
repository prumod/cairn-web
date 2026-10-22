// PROTOTYPE (throwaway): lets Tailscale Serve reach the dev server under its MagicDNS name.
import { defineConfig } from "vite";

export default defineConfig({
  server: { allowedHosts: [".ts.net"] },
});
