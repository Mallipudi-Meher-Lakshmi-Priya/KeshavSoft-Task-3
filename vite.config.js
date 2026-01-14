import { defineConfig, normalizePath, build } from 'vite'
import fs from 'fs'
import path, { resolve } from 'path'
import { fileURLToPath } from 'url';
import nunjucks from 'vite-plugin-nunjucks'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import sidebarItems from "./src/sidebar-items.json"
import horizontalMenuItems from "./src/horizontal-menu-items.json"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FIX 1: Change root to __dirname so it finds index.html in the main folder
const root = __dirname 

const getFiles = () => {
    let files = {}
    // We only look for html files in the main folder now
    fs.readdirSync(root)
        .filter(filename => filename.endsWith('.html'))
        .forEach(filename => {
            files[filename.slice(0, -5)] = resolve(root, filename)
        })
    return files
}

const files = getFiles()

const getVariables = (mode) => {
    const variables = {}
    Object.keys(files).forEach((filename) => {
        if (filename.includes('layouts')) filename = `layouts/${filename}`
        variables[filename + '.html'] = {
            web_title: "KeshavSoft Admin Dashboard",
            sidebarItems,
            horizontalMenuItems,
            isDev: mode === 'development'
        }
    })
    return variables
}

const modulesToCopy = {
    "@icon/dripicons": false,
    "@fortawesome/fontawesome-free": false,
    "rater-js": false,
    "bootstrap-icons": false,
    apexcharts: true,
    "perfect-scrollbar": true,
    flatpickr: true,
    filepond: true,
    "filepond-plugin-file-validate-size": true,
    "filepond-plugin-file-validate-type": true, 
    "filepond-plugin-image-crop": true,
    "filepond-plugin-image-exif-orientation": true, 
    "filepond-plugin-image-filter": true,
    "filepond-plugin-image-preview": true,
    "filepond-plugin-image-resize": true,
    "feather-icons": true,
    dragula: true,
    dayjs: false,
    "chart.js": true,
    "choices.js": false,
    parsleyjs: true,
    sweetalert2: true,
    summernote: true,
    jquery: true,
    quill: true,
    tinymce: false,
    "toastify-js": false,
    "datatables.net": false,
    "datatables.net-bs5": false,
    "simple-datatables": true, 
    jsvectormap: true,
}

const copyModules = Object.keys(modulesToCopy).map(moduleName => {
    const withDist = modulesToCopy[moduleName]
    return {
        src: normalizePath(resolve(__dirname, `./node_modules/${moduleName}${withDist ? '/dist' : ''}`)),
        dest: 'assets/extensions',
        rename: moduleName
    }
})

export default defineConfig((env) => ({
    publicDir: 'static',
    // FIX 2: Change base to './' for Surge/Netlify compatibility
    base: './', 
    root,
    plugins: [
        viteStaticCopy({
            targets: [
                { src: normalizePath(resolve(__dirname, './src/assets/static')), dest: 'assets' },
                // Use a safer path for fonts
                { src: normalizePath(resolve(__dirname, './src/assets/compiled/fonts')), dest: 'assets/compiled/css', optional: true },
                { src: normalizePath(resolve(__dirname, "./node_modules/bootstrap-icons/bootstrap-icons.svg")), dest: 'assets/static/images' },
                ...copyModules
            ],
            watch: {
                reloadPageOnChange: true
            }
        }),
        nunjucks({
            // FIX 3: Point templatesDir to where your components/layouts are (usually src)
            templatesDir: resolve(__dirname, 'src'), 
            variables: getVariables(env.mode),
            nunjucksEnvironment: {
                filters: {
                    containString: (str, containStr) => {
                        if (!str || !str.length) return false
                        return str.indexOf(containStr) >= 0
                    },
                    startsWith: (str, targetStr) => {
                        if (!str || !str.length) return false
                        return str.startsWith(targetStr)
                    }
                }
            }
        })
    ],
    resolve: {
        alias: {
            '@': normalizePath(resolve(__dirname, 'src')),
            '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
            '~bootstrap-icons': resolve(__dirname, 'node_modules/bootstrap-icons'),
            '~perfect-scrollbar': resolve(__dirname, 'node_modules/perfect-scrollbar'), 
            '~@fontsource': resolve(__dirname, 'node_modules/@fontsource'),
            '~@fortawesome': resolve(__dirname, 'node_modules/@fortawesome'), 
            '~rater-js': resolve(__dirname, 'node_modules/rater-js'), 
    }},
    build: {
        emptyOutDir: true,
        manifest: true,
        target: "chrome58",
        outDir: resolve(__dirname, 'dist'),
        rollupOptions: {
            input: files,
            output: {
                entryFileNames: `assets/compiled/js/[name].js`,
                chunkFileNames: `assets/compiled/js/[name].js`,
                assetFileNames: (a) => {
                    const extname = a.name.split('.').pop()
                    let folder = extname ? `${extname}/` : ''
                    if (['woff', 'woff2', 'ttf'].includes(extname))
                        folder = 'fonts/'
                    return `assets/compiled/${folder}[name][extname]`
                }
            }
        }
    }
}))