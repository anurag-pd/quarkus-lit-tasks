import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    open: true,
  },
  base: "/quarkus-lit-tasks/frontend-lit/",
});
