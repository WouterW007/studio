import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["lib/**/*"], // Ignore compiled files.
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        // project: ['tsconfig.json', 'tsconfig.dev.json'], // Temporarily removed for deployment
        sourceType: 'module',
        module: "nodenext"
      },
    },
    // Add any specific rules you want to override here.
    rules: {
      // For example, to require double quotes:
      // "quotes": ["error", "double"],
      // To allow unused variables (if needed, though not recommended):
      // "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "error" // Re-enable this rule
    },
  },
];