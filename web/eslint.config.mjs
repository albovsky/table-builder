import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import checkFile from "eslint-plugin-check-file";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
        "check-file": checkFile,
    },
    rules: {
        "check-file/folder-naming-convention": [
            "error",
            {
                "web/features/*/": "kebab-case",
                "web/components/*/": "kebab-case",
                "web/services/*/": "kebab-case",
            }
        ],
        "check-file/filename-naming-convention": [
            "error",
            {
                "web/components/**/*.{tsx,jsx}": "PASCAL_CASE",
                "web/features/**/components/**/*.{tsx,jsx}": "PASCAL_CASE",
                "web/hooks/**/*.{ts,tsx}": "CAMEL_CASE",
                "web/lib/**/*.{ts,tsx}": "CAMEL_CASE",
                "web/services/**/*.{ts,tsx}": "CAMEL_CASE",
                "web/features/**/hooks/**/*.{ts,tsx}": "CAMEL_CASE",
            },
            {
                "ignoreMiddleExtensions": true,
            }
        ],
    }
  },
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
