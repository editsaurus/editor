import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import mdx from "@mdx-js/rollup";
import {defineConfig} from "vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [mdx(), react(), tailwindcss()],
    css: {
        postcss: "./postcss.config.cjs",
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        minify: false, // Disable minification (obfuscation)
        sourcemap: true, // Generate source maps
        lib: {
            entry: "src/index.tsx", // Library's entry point
            name: "editsaurus", // Global variable for the UMD bundle
            formats: ["iife"], // ESM only
            fileName: () => `editsaurus.js` // Single file output
        },
        rollupOptions: {}
    },
    server: {
        open: false, // Prevent auto-opening the browser
        cors: true,  // Enable CORS for cross-origin requests
        host: "0.0.0.0" // Allow access from other devices
    }
})
