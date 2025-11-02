declare module 'vite-plugin-node-polyfills' {
  import type { Plugin } from 'vite';

  export interface NodePolyfillsOptions {
    include?: string[];
    exclude?: string[];
    globals?: {
      Buffer?: boolean;
      global?: boolean;
      process?: boolean;
    };
    overrides?: Record<string, string>;
    protocolImports?: boolean;
  }

  export function nodePolyfills(options?: NodePolyfillsOptions): Plugin;
}
