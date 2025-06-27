import {defineConfig} from "tsup";


export default defineConfig({
    entry: ["src/cli.ts"],
    banner: {
        js: '#!/usr/bin/env node',
    },
    target: 'es2020',
    format: ["esm"], // Build for commonJS and ESmodules
    dts: false, // Generate declaration file (.d.ts)
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: false,
    external: [
        "@types/string-similarity",
        "chokidar",
        "body-parser",
        "cors",
        "express",
        "http-proxy-middleware",
        "launch-editor",
        "magic-string",
        "mdast-util-to-string",
        "node-pty",
        "open",
        "p-queue",
        "portfinder",
        "remark",
        "remark-directive",
        "remark-frontmatter",
        "remark-gfm",
        "remark-mdx",
        "remark-mdx-frontmatter",
        "remark-parse",
        "string-similarity",
        "unified",
        "unist-util-remove-position",
    ],
});
