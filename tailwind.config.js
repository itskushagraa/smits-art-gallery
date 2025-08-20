/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          sans: ["var(--font-sans)", "system-ui", "sans-serif"],
          serif: ["var(--font-serif)", "Georgia", "serif"],
        },
      },
    },
    plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
  };