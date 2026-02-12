import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "shared", pattern: "src/shared/*" },
        { type: "module", pattern: "src/modules/*" },
        { type: "app", pattern: "src/app/*" },
      ],
    },
    rules: {
      "boundaries/entry-point": [
        "error",
        {
          default: "allow",
          rules: [
            {
              target: ["module"],
              allow: "index.{ts,tsx,js,jsx}",
            },
          ],
        },
      ],
      "boundaries/no-private": ["error"],
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            { from: ["app"], allow: ["shared", "module", "app"] },
            { from: ["shared"], disallow: ["module"] },
            { from: ["module"], allow: ["shared", "module"] },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;
