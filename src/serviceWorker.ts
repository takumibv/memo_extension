// install or Updateして初めて開いた時に呼ばれる。
chrome.runtime.onInstalled.addListener((details) => {
  const previousVersion = details.previousVersion || "x.x.x";
  console.log("previousVersion", previousVersion);

  // バージョンが 0.x.x の場合 localStorage → Storage APIへデータ移行を行う
  // if (previousVersion.match(/^0\./g)) {
  //   const memos = JSON.parse(localStorage["Memos"] || "[]");
  //   const pageInfos = JSON.parse(localStorage["PageInfos"] || "[]");

  //   chrome.storage.local.set({ memos, pageInfos }, function () {
  //     console.log("Value is set to ", memos, pageInfos);
  //   });
  // }
});

chrome.contextMenus.create({
  id: "memo-extension-context-menu-create",
  title: "メモを追加",
  // title: chrome.i18n.getMessage("add_memo_msg"),
});

const newMemo = {
  id: "id",
  page_info_id: "page_info_id",
  title: "title",
  description: "description",
  position_x: 0,
  position_y: 0,
  width: 100,
  height: 100,
  is_open: true,
  is_fixed: true,
  created_at: "created_at",
  updated_at: "updated_at",
};

chrome.contextMenus.onClicked.addListener(function (info) {
  chrome.storage.local.set({ memo: newMemo }, function () {
    console.log("Value is set to ", newMemo);
  });

  chrome.storage.local.get(null, function (data) {
    console.log("Value is get to ", data);
  });

  console.log("onclick ", info);
});

const contentScript = () => {
  console.log("=== contentScript ===");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs) {
      console.log("contentScript: no tabs.id");
      return;
    }

    console.log("contentScript:", tabs[0].id);

    // chrome.tabs.executeScript({ code: "console.log('executeScript')" });

    // chrome.tabs.executeScript({
    //   file: "contentScript.js",
    // });
  });
};

chrome.tabs.onActivated.addListener((activeInfo) => {
  // タブが切り替えられた時に呼ばれる.
  contentScript();
});

// chrome.tabs.executeScript({ code: `tab_url = http://test.com;` }, (result) => {
//   console.log("result=======", result);
//   if (chrome.extension.lastError) {
//     console.log("executeScript::", chrome.extension.lastError);
//     return;
//   }
//   chrome.tabs.executeScript({ file: "contentScript.js" });
// });
