/**
 * Background service worker
 * Handles initialization and tab navigation interception
 */

importScripts('./utils/storage.js');
// Initialize storage on extension install/startup
chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
  console.log('Mantra Block: Extension initialized');
});


/**
 * Listen for tab updates to check if the user is accessing a blocked site
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const blocked = await isBlocked(tab.url);
    
    if (blocked) {
      // Notify the content script that this tab is blocked
      try {
        await chrome.tabs.sendMessage(tabId, { action: 'blockSite' });
      } catch (e) {
        // Content script not ready yet, will check on document_start
        console.log('Content script not ready for tab', tabId);
      }
    }
  }
});


/**
 * Listen for messages from other extension contexts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Support both { action: 'openSettings' } and legacy { message: 'openSettings' }
  if (request.action === 'openSettings' || request.message === 'openSettings') {
    chrome.runtime.openOptionsPage();
    sendResponse({ status: 'ok' });
    return true;
  }

  if (request.action === 'checkBlocked') {
    isBlocked(request.url).then(blocked => {
      sendResponse({ blocked });
    });
    return true; // Indicates we'll send response asynchronously
  }
});
