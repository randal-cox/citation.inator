import { createRequire } from "node:module";
import path from "node:path";
import { labRoot } from "./toolchain.mjs";
const require = createRequire(path.join(labRoot, "package.json"));
const js = require("@eslint/js"),
  globals = require("globals");
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/vendor/**",
      "**/dist/**",
      "site/**",
      "demos/drop-in/**",
      ".inator/**",
      "**/* [0-9]*.mjs",
      "**/* [0-9]*.js",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.mjs", "**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.worker,
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          ignoreRestSiblings: true,
        },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-useless-escape": "warn",
      "no-useless-assignment": "warn",
      "no-regex-spaces": "warn",
      complexity: ["warn", 20],
      "max-depth": ["warn", 5],
    },
  },
  {
    files: ["scripts/**/*.mjs", "test/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    files: [
      "src/browser.mjs",
      "src/access-*.mjs",
      "src/access.mjs",
      "src/inspector-*.mjs",
      "learn/**/*.js",
      "learn/**/*.mjs",
      "scripts/*-client.mjs",
    ],
    languageOptions: { globals: globals.browser },
  },
  // Playwright callbacks execute in the page, although the harness itself runs in Node.
  {
    files: ["test/*browser.mjs"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["test/bibliography-workspace-browser.mjs"],
    languageOptions: { globals: { axe: "readonly" } },
  },
  {
    files: ["test/browser.mjs"],
    languageOptions: { globals: { chrome: "readonly" } },
  },
  // This source fragment is inserted in a generated module with these bindings, not loaded on its own.
  {
    files: ["scripts/structured-demo-client.mjs"],
    languageOptions: {
      globals: {
        initializeCitationInspector: "readonly",
        cache: "readonly",
        bindCitationTrigger: "readonly",
        occurrences: "readonly",
        dialogOccurrences: "readonly",
      },
    },
  },
  // These four modules intentionally reject or strip control characters in authored data.
  {
    files: [
      "src/bibliography-export.mjs",
      "src/compiler.mjs",
      "src/records.mjs",
      "src/reference-features.mjs",
    ],
    rules: { "no-control-regex": "off" },
  },
  {
    files: ["src/**/*.mjs"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["node:*"],
              message:
                "Keep Node-only dependencies in CLI/build adapters; public library modules also run in browsers.",
            },
          ],
        },
      ],
    },
  },
];
