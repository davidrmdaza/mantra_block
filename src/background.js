/**
 * Background service worker
 * Handles initialization and tab navigation interception
 */

// Initialize storage on extension install/startup
chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
  console.log('Mantra Block: Extension initialized');
});

// Initialize storage when service worker starts
initializeStorage();

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
 * Listen for messages from content script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkBlocked') {
    isBlocked(request.url).then(blocked => {
      sendResponse({ blocked });
    });
    return true; // Indicates we'll send response asynchronously
  }
});
