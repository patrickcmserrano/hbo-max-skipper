// Service worker — relay de mensagens entre popup e content script.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Popup → content script
  if (msg.type === "CONFIG_UPDATE" || msg.type === "REQUEST_HEALTH") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
        if (chrome.runtime.lastError) return;   // tab may not have content script
        sendResponse(response);
      });
    });
    return true;   // keep sendResponse alive
  }

  // Content script → popup (health updates): forward to all extension views
  if (msg.type === "HEALTH_UPDATE") {
    chrome.runtime.sendMessage(msg).catch(() => {});
  }
});
