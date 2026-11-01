import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: true,
    testTimeout: 30000,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
  },
});
