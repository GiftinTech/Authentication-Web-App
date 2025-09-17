// .prettierrc.cjs
/** @type {import("prettier").Config} */
const config = {
  trailingComma: "all",
  singleQuote: true,
  tabWidth: 2,
  semi: true,

  plugins: ["prettier-plugin-tailwindcss"],
};

module.exports = config;