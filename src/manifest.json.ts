import { ManifestV3Export } from "@crxjs/vite-plugin";

export default {
  manifest_version: 3,
  name: process.env.NODE_ENV === "development" ? "どこでもメモ(Dev)" : "__MSG_appName__",
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
} as ManifestV3Export;