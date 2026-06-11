/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4f46e5', // Indigo for active states and icons
          secondary: '#1e1b4b', // Dark navy/indigo for bold text
          accent: '#6366f1', // Indigo-500
          discount: '#3b82f6', // Accent blue for discount labels
          trybuy: '#4f46e5', // Try-n-Buy text blue
          headerBg: '#f8fafc', // Very light grey/slate background
          lightBg: '#f1f5f9', // Slate-100
        }
      }
    },
  },
  plugins: [],
}