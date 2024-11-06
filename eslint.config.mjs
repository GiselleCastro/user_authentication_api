import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      quotes: ["error", "single"],
      semi: ["error", "always"],
      "comma-dangle": ["error", "never"],
      "no-console": "off",
    },
  },
  eslintConfigPrettier,
];
