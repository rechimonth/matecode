module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    project: "./tsconfig.app.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["react", "react-hooks", "react-refresh"],
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  settings: { react: { version: "detect" } },
  env: { browser: true, node: true },
  globals: { React: "readonly" },
  ignorePatterns: ["*.d.ts", "dist"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-unused-vars": "off",
      },
    },
  ],
  rules: { "react/react-in-jsx-scope": "off", "react/prop-types": "off" },
};
