/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
    root: true,
    extends: ["plugin:vue/essential", "eslint:recommended"],
    rules: {
        "arrow-body-style": ["error", "as-needed"],
        "arrow-parens": ["error", "as-needed"],
        "camelcase": "off",
        "indent": ["error", 4, {SwitchCase: 1}],
        "linebreak-style": ["error", "unix"],
        "max-len": "off",
        "new-cap": "off",
        "no-console": ["error", {allow: ["error"]}],
        "object-curly-spacing": ["error", "never"],
        "quotes": ["error", "double"],
        "semi": ["error", "never"],
        "space-before-function-paren": ["error", "never"],
        "vue/valid-v-slot": ["error", {allowModifiers: true}]
    },
}
