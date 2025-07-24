// content.js (最终完善版)

// ------------------- 配置区域 -------------------
// 核心交互黑名单 (永远生效，保护链接、按钮等)
const coreInteractiveTags = new Set([
  'a', 'button', 'input', 'textarea', 'select', 'option', 'label',
  'video', 'audio'
]);
// 文本容器黑名单 (仅在文本保护开启时生效)
const textContainerTags = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
  'span', 'li', 'strong', 'em', 'code', 'pre',
  'svg', 'path'
]);

// 右键双击计时器
let lastRightClickTime = 0;
const doubleClickThreshold = 400; // ms

// ------------------- 事件监听 -------------------

// 1. 左键双击监听 (dblclick)
document.addEventListener('dblclick', function(event) {
  // 每次点击时都获取最新设置
  chrome.storage.sync.get({
    preventOnTextSelection: true,
    dblClickOnImage: false
  }, function(settings) {
    const targetElement = event.target;
    const targetTagName = targetElement.tagName.toLowerCase();

    // 防御层 1：核心交互元素 (永远保护)
    if (coreInteractiveTags.has(targetTagName)) {
      return;
    }
    
    // 防御层 2：根据用户设置，进行文本相关的保护
    if (settings.preventOnTextSelection) {
      if (window.getSelection().toString().trim() !== '') return;
      if (textContainerTags.has(targetTagName)) return;
      if (targetElement.children.length === 0 && targetElement.textContent.trim() !== '') return;
    }

    // 防御层 3：图片设置
    if (targetTagName === 'img' && !settings.dblClickOnImage) {
      return;
    }
    
    // 所有防御都通过后，执行关闭
    chrome.runtime.sendMessage({ action: "close-this-tab" });
  });
});

// 2. 右键单击/双击监听 (contextmenu)
document.addEventListener('contextmenu', function(event) {
  // 每次点击时都获取最新设置
  chrome.storage.sync.get({ // 修正了这里的语法错误
    unconditionalRightClickClose: false 
  }, function(settings) {
    // 如果用户未开启此功能，则不执行任何操作
    if (!settings.unconditionalRightClickClose) {
      return;
    }

    const currentTime = new Date().getTime();
    if (currentTime - lastRightClickTime < doubleClickThreshold) {
      lastRightClickTime = 0;
      event.preventDefault();
      event.stopPropagation();
      chrome.runtime.sendMessage({ action: "close-this-tab" });
    } else {
      lastRightClickTime = currentTime;
    }
  });
}, true);