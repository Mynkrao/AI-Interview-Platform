/** @type {import('tailwindcss').Config} */
// SAD Section 13.1: "Satisfies SRS NFR: 375px to 1920px responsive requirement."
// Default Tailwind breakpoints (sm/md/lg/xl/2xl) cover this range; no custom
// breakpoints needed until a specific page requires them.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
