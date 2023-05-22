import { defineConfig } from "vite";
import type { Plugin, PluginOption } from "vite";
// import preact from '@preact/preset-vite'
import path from "node:path";
import url from "node:url";
import fs from "fs";
import { createRequire } from "node:module";
import react from "@vitejs/plugin-react";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const srcDir = path.join(__dirname, ".", "src");

const manifest = defineManifest({
  manifest_version: 3,
  name: "__MSG_appName__",
  short_name: "__MSG_appShortName__",
  description: "__MSG_appDescription__",
  version: "0.4.0",
  default_locale: "en",
  icons: {
    16: "images/icon_16.png",
    128: "images/icon_128.png",
  },
  background: {
    service_worker: "src/pages/background/index.ts",
    type: "module",
  },
  options_page: "memos.html",
  action: {
    default_popup: "popup.html",
  },
  permissions: ["tabs", "contextMenus", "storage", "scripting", "webNavigation"],
  host_permissions: ["*://*/*"],
});

export default defineConfig({
  plugins: [
    react(),
    reactVirtualized(),
    crx({
      manifest,
      contentScripts: {
        preambleCode: false,
      },
    }),
  ],
});

// defineConfig({
//   build: {
//     rollupOptions: {
//       input: {
//         popup: path.join(srcDir, "pages/Popup/index.tsx"),
//         options: path.join(srcDir, "pages/Options/index.tsx"),
//         background: path.join(srcDir, "pages/background/index.ts"),
//         contentScript: path.join(srcDir, "pages/contentScript/index.tsx"),
//       },
//       output: {
//         dir: path.join(__dirname, "./dist"),
//         entryFileNames: "[name].js",
//       },
//       manualChunks(id) {
//         if (id.includes("node_modules")) {
//           return "vendor";
//         }
//       },
//       plugins: [
//         copy({
//           targets: [{ src: "public/**/*", dest: "dist" }],
//         }),
//       ],
//     },
//   },
//   resolve: {
//     alias: {
//       "@mui/styled-engine": "@mui/styled-engine-sc",
//     },
//   },
// });

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;
function reactVirtualized(): Plugin {
  return {
    name: "flat:react-virtualized",
    // Note: we cannot use the `transform` hook here
    //       because libraries are pre-bundled in vite directly,
    //       plugins aren't able to hack that step currently.
    //       so instead we manually edit the file in node_modules.
    //       all we need is to find the timing before pre-bundling.
    configResolved() {
      const file = require
        .resolve("react-virtualized")
        .replace(
          path.join("dist", "commonjs", "index.js"),
          path.join("dist", "es", "WindowScroller", "utils", "onScroll.js")
        );
      const code = fs.readFileSync(file, "utf-8");
      const modified = code.replace(WRONG_CODE, "");
      fs.writeFileSync(file, modified);
    },
  };
}
