// Bundles the API into dist/app.js for Vercel. Vercel's Express builder
// re-wraps each CommonJS file on its own, and on its runtime our own modules
// that export a function (routers, the app) came back as `{}`. A single
// bundle has no internal module boundaries, so that can't happen.
//
// npm packages stay external (pdf-parse needs its optional native canvas
// binding at runtime). Vercel places dist/app.js at the function root but
// keeps traced packages under backend/node_modules, so the banner adds that
// folder to NODE_PATH (Module.globalPaths is only a copy, so it must be
// re-initialised with _initPaths).
//
// Vercel's runtime also evaluates the entry twice in one process. Registering
// Mongoose models twice throws OverwriteModelError, so the banner returns the
// app cached on globalThis by the footer (top-level `return` is legal in CJS).
const esbuild = require("esbuild");

const banner = [
  "if (globalThis.__learnInsightApp) { module.exports = globalThis.__learnInsightApp; return; }",
  'const __p = require("path"), __M = require("module");',
  'process.env.NODE_PATH = [__p.join(__dirname, "backend", "node_modules"), process.env.NODE_PATH].filter(Boolean).join(__p.delimiter);',
  "__M._initPaths();",
].join("\n");

esbuild
  .build({
    entryPoints: ["src/app.js"],
    outfile: "dist/app.js",
    bundle: true,
    platform: "node",
    target: "node22",
    packages: "external",
    banner: { js: banner },
    footer: { js: "globalThis.__learnInsightApp = module.exports;" },
    logLevel: "info",
  })
  .catch(() => process.exit(1));
