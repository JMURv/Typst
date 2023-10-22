/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                "font-poppins": "var(--font-poppins)",
            },
            colors: {
                "pink-pastel": "#945F95",
                "pastel-100": "#d179d2",
                "deep-purple": "#351E4A",
                "light-purple": "#83489F",
                "purple-100": "#351E4A",
                "purple-200": "#402559",
                "purple-300": "#492A66",
                "purple-400": "#522F73",
                "purple-500": "#5B3480",

            }
        },
    },
    plugins: [],
}
