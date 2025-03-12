/** @type {import("eslint").FlatConfig[]} */
module.exports = [
    require("@eslint/js").configs.recommended,
    {
      files: ["src/**/*.ts"],
      languageOptions: {
        parser: require("@typescript-eslint/parser"),
        parserOptions: {
          project: "./tsconfig.json",
        },
      },
      rules: {
        // Add any custom rules here
      },
    },
  ];
  