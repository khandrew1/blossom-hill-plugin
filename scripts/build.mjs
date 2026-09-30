import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });
const app = await build({
  entryPoints: ["src/app/main.tsx"],
  bundle: true,
  format: "esm",
  target: "es2022",
  outdir: "dist",
  write: false,
  loader: { ".png": "dataurl" },
  define: { "process.env.NODE_ENV": '"production"' },
});
const javascript = app.outputFiles.find((file) => file.path.endsWith(".js")).text;
const css = app.outputFiles.find((file) => file.path.endsWith(".css")).text;
await writeFile("dist/home.html", `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blossom Hill</title><style>${css}</style></head>
<body><div id="root"></div><script type="module">${javascript.replaceAll("</script", "<\\/script")}</script></body></html>`);
await build({
  entryPoints: ["src/server.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  outfile: "dist/server.js",
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
});
console.log("Built dist/home.html and dist/server.js (self-contained plugin runtime).");
