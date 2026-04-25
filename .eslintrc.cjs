module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    "vue/setup-compiler-macros": true,
  },
  extends: ["eslint:recommended", "plugin:vue/vue3-essential"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@babel/eslint-parser",
    ecmaVersion: 2021,
    requireConfigFile: false,
    sourceType: "module",
  },
  globals: {
    __APP_RELEASE_DATE__: "readonly",
    __APP_VERSION__: "readonly",
    defineEmits: "readonly",
    defineModel: "readonly",
    defineOptions: "readonly",
    defineProps: "readonly",
  },
  overrides: [
    {
      files: ["src/tests/**/*.js"],
      env: {
        node: true,
      },
      globals: {
        afterEach: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        vi: "readonly",
      },
    },
  ],
};
