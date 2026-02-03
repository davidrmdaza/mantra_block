/**
 * Content script
 * Displays overlay on blocked websites with mantra form
 */

// Load overlay HTML + CSS when needed (cached on window)
async function ensureOverlayResources() {
  if (window.__mantraOverlayTemplate && window.__mantraOverlayCss) return;
  const [html, css] = await Promise.all([
    fetch(chrome.runtime.getURL('src/overlay.html')).then(r => r.text()),
    fetch(chrome.runtime.getURL('src/styles/overlay.css')).then(r => r.text())
  ]);
  window.__mantraOverlayTemplate = html;
  window.__mantraOverlayCss = css;
}


let overlayActive = false;

/**
 * Create and display the blocking overlay
 */
async function displayBlockOverlay() {
  if (overlayActive) return;
  overlayActive = true;

  const mantras = await chrome.runtime.sendMessage({ action: 'getMantras' }).then(response => response.mantras);  
  
  // Ensure overlay HTML/CSS are loaded
  await ensureOverlayResources();

  // Create host and Shadow DOM to isolate styles from page
  const host = document.createElement('div');
  host.id = 'mantra-block-overlay-host';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${window.__mantraOverlayCss}</style>${window.__mantraOverlayTemplate}`;
  document.documentElement.appendChild(host);

  // Populate suggestions list from fetched mantras
  const suggestionsList = shadow.querySelector('.suggestions-list');
  if (suggestionsList) {
    suggestionsList.innerHTML = mantras.map((mantra) => `
      <button type="button" class="suggestion-btn" data-mantra="${mantra}">${mantra}</button>
    `).join('');
  }

  // Prevent scrolling
  // document.documentElement?.style.overflow = 'hidden';
  // document.body?.style.overflow = 'hidden';

  // Set up event listeners
  setupFormListeners(shadow, mantras);
}

/**
 * Set up form event listeners
 */
function setupFormListeners(overlay, mantras) {
  const form = overlay.querySelector('#mantra-form');
  const input = overlay.querySelector('#mantra-input');
  const suggestionBtns = overlay.querySelectorAll('.suggestion-btn');
  const settingsLink = overlay.querySelector('#mantra-settings');
  
  // Prevent pasting
  input.addEventListener('paste', (e) => {
    e.preventDefault();
  });
  
  // Suggestion buttons
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mantra = btn.getAttribute('data-mantra');
      input.value = mantra;
      form.dispatchEvent(new Event('submit'));
    });
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredMantra = input.value.trim();
    
    if (enteredMantra.length === 0) {
      alert('Please enter or select a mantra to continue.');
      return;
    }
    
    // Check if entered mantra matches one of the user's mantras
    const mantraMatch = mantras.some(m =>
      m.toLowerCase() === enteredMantra.toLowerCase()
    );
    
    if (mantraMatch) {
      removeBlockOverlay();
    } else {
      alert('That mantra is not recognized. Please enter one of your mantras.');
      input.value = '';
      input.focus();
    }
  });
  
  // Settings link
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  
  input.focus();
}

/**
 * Remove the blocking overlay
 */
function removeBlockOverlay() {
  const host = document.getElementById('mantra-block-overlay-host');
  if (host) {
    host.remove();
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    overlayActive = false;
  }
}

/**
 * Check if current page should be blocked and display overlay
 */
async function checkAndBlock() {
  const blocked = await chrome.runtime.sendMessage({ action: 'checkBlocked', url: window.location.href }).then(response => response.blocked);
  if (blocked) {
    displayBlockOverlay();
  }
}

// Check on document start
checkAndBlock();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'blockSite') {
    displayBlockOverlay();
    sendResponse({ success: true });
  }
});
