import globals from "globals";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "seeders/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
    },
  },
];
