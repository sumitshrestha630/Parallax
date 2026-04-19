import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/** Same rules as legacy `extends: "next/core-web-vitals"` — works with ESLint 9 flat config. */
const eslintConfig = [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/*.config.js.timestamp-*",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
