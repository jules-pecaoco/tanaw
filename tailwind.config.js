/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./views/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'primary': "#F47C25",
        'secondary': "#3C454C",
        'tertiary': "#E84E4C",
        'white': "#ffffff",
      },
      fontFamily: {
        rthin: ["RobotoCondensed-Thin", "sans-serif"],
        rextralight: ["RobotoCondensed-ExtraLight", "sans-serif"],
        rlight: ["RobotoCondensed-Light", "sans-serif"],
        rregular: ["RobotoCondensed-Regular", "sans-serif"],
        rmedium: ["RobotoCondensed-Medium", "sans-serif"],
        rsemibold: ["RobotoCondensed-SemiBold", "sans-serif"],
        rbold: ["RobotoCondensed-Bold", "sans-serif"],
        rextrabold: ["RobotoCondensed-ExtraBold", "sans-serif"],
        rblack: ["RobotoCondensed-Black", "sans-serif"],
        ritalic: ["RobotoCondensed-Italic", "sans-serif"],
        rextralightitalic: ["RobotoCondensed-ExtraLightItalic", "sans-serif"],
        rbolditalic: ["RobotoCondensed-BoldItalic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
