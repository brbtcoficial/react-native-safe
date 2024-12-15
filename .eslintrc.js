module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    ignorePatterns: ['scripts', 'lib', 'docs', 'example', 'app.plugin.js', '.eslintrc.js', "*.js"],
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended', '@react-native', 'plugin:prettier/recommended'],
    rules: {
      "import/prefer-default-export": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "no-promise-executor-return": "off",
      "no-bitwise": "off",
      "no-param-reassign": "off",
      "react/require-default-props": "off",
      "no-continue": "off",
      "no-constant-condition": "off",
      "no-await-in-loop": "off",
      "react-native/no-inline-styles": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "react/jsx-props-no-spreading": "off",
      "class-methods-use-this": "off",
      "eslint-comments/no-unused-disable": "off",
      "no-console": ["error", { "allow": ["info", "warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    },
    env: {
      node: true,
    },
  }