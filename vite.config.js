/* global process */

import {fileURLToPath, URL} from "node:url"

import {defineConfig} from "vite"
import vue2 from "@vitejs/plugin-vue2"
import {VuetifyResolver} from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import VitePluginFaviconsInject from "vite-plugin-favicons-inject"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue2(),
        Components({resolvers: [VuetifyResolver()]}),
        VitePluginFaviconsInject(),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        proxy: {
            "/api": {
                target: process.env.API_SERVER,
                secure: false,
                changeOrigin: true,
            },
        },
    }, 
})
