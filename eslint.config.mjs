import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  // Ignore generated and vendored directories
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "*.config.{js,mjs,cjs}",
      "next-env.d.ts",   // Next.js-generated, uses triple-slash references
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
