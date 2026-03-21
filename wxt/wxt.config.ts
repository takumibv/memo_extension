import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  runner: {
    disabled: true,
  },
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'en',
    permissions: ['storage', 'scripting', 'tabs', 'notifications', 'contextMenus'],
    host_permissions: ['<all_urls>'],
    action: {
      default_popup: 'popup.html',
      default_icon: { '34': 'icon-34.png' },
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    icons: {
      '16': 'icon-16.png',
      '128': 'icon-128.png',
    },
    web_accessible_resources: [
      {
        resources: ['*.js', '*.css', '*.svg', 'icon-128.png', 'icon-34.png'],
        matches: ['*://*/*'],
      },
    ],
  },
});
