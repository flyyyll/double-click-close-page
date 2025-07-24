// options.js (最终完整版)

// 在页面DOM加载完成后，立即执行两个核心操作：国际化和恢复设置
document.addEventListener('DOMContentLoaded', function() {
  // 1. 国际化页面上的所有文本
  localizeHtml();
  
  // 2. 从Chrome存储中读取并恢复用户已保存的选项
  restore_options();
});

/**
 * 查找所有带 data-i18n 属性的元素，并用对应语言的文本填充它们
 */
function localizeHtml() {
  // 国际化页面上所有可见的元素
  document.querySelectorAll('[data-i18n]').forEach(function(element) {
    const messageKey = element.getAttribute('data-i18n');
    if (messageKey) {
      const message = chrome.i18n.getMessage(messageKey);
      if (message) {
        element.textContent = message;
      }
    }
  });

  // ---  这里是修改的部分 ---
  // 单独获取 <title> 元素本身
  const titleElement = document.querySelector('title');
  if (titleElement) {
    const titleKey = titleElement.getAttribute('data-i18n');
    if (titleKey) {
      // 修改 title 元素的 textContent，这会自动更新浏览器标签页上的标题
      titleElement.textContent = chrome.i18n.getMessage(titleKey);
    }
  }
}

/**
 * 将当前选项页面上的设置保存到 chrome.storage
 */
function save_options() {
  const preventOnTextSelection = document.getElementById('textSelectionToggle').checked;
  const dblClickOnImage = document.getElementById('imageToggle').checked;
  const unconditionalRightClickClose = document.getElementById('rightClickToggle').checked;

  chrome.storage.sync.set({
    preventOnTextSelection: preventOnTextSelection,
    dblClickOnImage: dblClickOnImage,
    unconditionalRightClickClose: unconditionalRightClickClose
  }, function() {
    // 保存成功后，显示一个短暂的状态提示
    const status = document.getElementById('status');
    status.textContent = chrome.i18n.getMessage("statusSaved"); // 提示也使用国际化
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

/**
 * 从 chrome.storage 读取设置，并更新页面上复选框的选中状态
 */
function restore_options() {
  // 从存储中获取设置，并为每个设置提供一个安全的默认值
  chrome.storage.sync.get({
    preventOnTextSelection: true,   // 默认开启文本保护
    dblClickOnImage: false,         // 默认不允许在图片上关闭
    unconditionalRightClickClose: false // 默认关闭右键无条件关闭
  }, function(items) {
    // 根据读取到的值，更新复选框的状态
    document.getElementById('textSelectionToggle').checked = items.preventOnTextSelection;
    document.getElementById('imageToggle').checked = items.dblClickOnImage;
    document.getElementById('rightClickToggle').checked = items.unconditionalRightClickClose;
  });
}

// 为页面上的每一个复选框绑定 "change" 事件监听器
// 当用户点击任何一个复选框时，都会自动调用 save_options 函数来保存所有设置
document.getElementById('textSelectionToggle').addEventListener('change', save_options);
document.getElementById('imageToggle').addEventListener('change', save_options);
document.getElementById('rightClickToggle').addEventListener('change', save_options);