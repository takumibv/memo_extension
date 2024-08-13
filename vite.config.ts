import { defineConfig } from "vite";
import type { Plugin } from "vite";
// import preact from '@preact/preset-vite'
import path from "node:path";
import fs from "fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import react from "@vitejs/plugin-react";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "__MSG_appName__",
  short_name: "__MSG_appShortName__",
  description: "__MSG_appDescription__",
  version: process.env.npm_package_version ?? "1.0.0",
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
  permissions: ["tabs", "contextMenus", "storage", "scripting"],
  host_permissions: ["*://*/*"],
});

export default defineConfig({
  plugins: [
    react(),
    reactVirtualized(),
    crx({
      manifest,
      // contentScripts: {
      //   preambleCode: false,
      // },
    }),
  ],
  resolve: {
    alias: {
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
    extensions: [".ts", ".tsx", ".js"],
  },
});

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
