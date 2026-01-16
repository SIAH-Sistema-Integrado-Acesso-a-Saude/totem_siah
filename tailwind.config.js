/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                treenity: {
                    blue: '#2a85ff',
                    dark: '#0a192f',
                }
            },
            fontFamily: {
                tech: ['Michroma', 'sans-serif'], 
                body: ['Montserrat', 'sans-serif'],
                brand: ['Urbanist', 'sans-serif'],
            }
        },
    },
    plugins: [],
}