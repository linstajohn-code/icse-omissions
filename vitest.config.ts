import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["scripts/__tests__/**/*.test.ts", "src/**/*.test.ts"],
    environment: "node",
    globals: false,
    testTimeout: 30000,
  },
});
