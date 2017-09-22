module.exports = {
  "env": {
    "node": true,
    "es6": true,
    "browser": true,
  },
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
  },
  "extends": "eslint:recommended",
  "rules": {
    // "no-console": 0,
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-unused-vars": [
      "error",
      {
        "args": "after-used",
        "argsIgnorePattern": "^_\\w+"
      }
    ]
  }
};
