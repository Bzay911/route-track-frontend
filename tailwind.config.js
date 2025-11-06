/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        interBold: ["Inter-Bold"],
        interMedium: ["Inter-Medium"],
        interRegular: ["Inter-Regular"],
      },
    },
  },
  plugins: [],
};
