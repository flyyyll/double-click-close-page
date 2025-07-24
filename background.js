// background.js

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // 检查收到的消息是否是 "close-this-tab"
    if (request.action === "close-this-tab") {
      // sender.tab 包含了发送消息的标签页信息
      // 使用 chrome.tabs.remove 来关闭该标签页
      if (sender.tab && sender.tab.id) {
        chrome.tabs.remove(sender.tab.id);
      }
    }
  }
);