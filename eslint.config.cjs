const { fixupConfigRules } = require("@eslint/compat");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = fixupConfigRules([
  ...compat.extends("airbnb-base", "prettier"),
  ...compat.extends("plugin:jest/recommended"),
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        console: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        global: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      indent: "off",
      "linebreak-style": ["off", "unix"],
      camelcase: "off",
      "no-console": "off",
      semi: ["error", "always"],
      "no-var": "error",
      "no-unused-vars": "error",
      eqeqeq: ["error", "always"],
      "object-curly-spacing": "off",
      "jest/no-conditional-expect": "off",
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
      "no-param-reassign": ["error", { props: false }],
      "no-restricted-syntax": "off",
      "no-await-in-loop": "off",
      radix: "off",
      "class-methods-use-this": "off",
      "no-continue": "off",
      "import/extensions": "off",
      "import/no-unresolved": "off",
      "no-promise-executor-return": "off",
    },
  },
]);
