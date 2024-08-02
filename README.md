# どこでもメモ
## Prerequisites

- [node + npm](https://nodejs.org/) (Current Version)

## Option

- [Visual Studio Code](https://code.visualstudio.com/)

## Setup

1. Clone this repository.
2. Run `yarn install` or `npm i` (check your node version >= 16.6, recommended >= 18)
3. Run `yarn dev` or `npm run dev`
4. Load Extension on Chrome
   1. Open - Chrome browser
   2. Access - chrome://extensions
   3. Check - Developer mode
   4. Find - Load unpacked extension
   5. Select - `dist` folder in this project (after dev or build)
5. If you want to build in production, Just run `yarn build` or `npm run build`.

## Build

```sh
npm run build
```

## Test
`npx jest` or `npm run test`

## Features
- [React 17](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [styled-components](https://styled-components.com/)
- [Chrome Extension Manifest Version 3](https://developer.chrome.com/docs/extensions/mv3/intro/)

## Directory Structure

```sh
├── packages/                     # built files
│   ├── memo_extension_0.4.0.zip
│   └── ...
├── public/                       # static files
│   ├── _locales/
│   │   ├── en
│   │   ├── ja
│   │   └── ...
│   ├── images/
│   └── manifest.json             # manifest v3
├── src
│   ├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── pages/                    # Page scripts
│   │   ├── Options/
│   │   ├── Popup/
│   │   ├── background/
│   │   ├── contentScript/
│   │   └── message/
│   ├── storages/                 # Storage
│   ├── types/
│   ├── memos.html
│   ├── popup.html
│   ├── setting.html
│   ├── resetCSS.ts
│   └── utils.ts
├── webpack/
├── README.md                     # This file
├── jest.config.js
├── tsconfig.json
├── package.json
└── yarn.lock
```