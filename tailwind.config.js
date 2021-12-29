module.exports = {
  purge: ["./src/**/*.{js,ts,jsx,tsx,css,pcss}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      divideColor: ["group-hover"],
    },
  },
};
