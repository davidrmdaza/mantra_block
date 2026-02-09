/**
 * Content script
 * Displays overlay on blocked websites with mantra form
 */

// Load overlay HTML + CSS when needed (cached on window)
async function ensureOverlayResources() {
  if (window.__mantraOverlayTemplate && window.__mantraOverlayCss) {
    console.debug('Overlay resources fetched from cache.');
    return;
  }

  const htmlUrl = chrome.runtime.getURL('src/overlay.html');
  const cssUrl = chrome.runtime.getURL('src/styles/overlay.css');
  console.debug('Fetching overlay resources', { htmlUrl, cssUrl });

  try {
    const [htmlResp, cssResp] = await Promise.all([fetch(htmlUrl), fetch(cssUrl)]);

    if (!htmlResp.ok) {
      console.error('Failed to fetch overlay HTML', htmlUrl, htmlResp.status, htmlResp.statusText);
      throw new Error('Failed to load overlay HTML');
    }
    if (!cssResp.ok) {
      console.error('Failed to fetch overlay CSS', cssUrl, cssResp.status, cssResp.statusText);
      throw new Error('Failed to load overlay CSS');
    }

    const [html, css] = await Promise.all([htmlResp.text(), cssResp.text()]);

    if (!html || !html.trim().length) console.warn('Overlay HTML is empty');
    if (!css || !css.trim().length) console.warn('Overlay CSS is empty');

    window.__mantraOverlayTemplate = html;
    window.__mantraOverlayCss = css;
    console.debug('Overlay resources loaded and cached.');
  } catch (err) {
    console.error('Error loading overlay resources', err);
    throw err;
  }
}


let overlayActive = false;

/**
 * Create and display the blocking overlay
 */
async function displayBlockOverlay() {
  if (overlayActive) return;
  overlayActive = true;

  const mantras = await chrome.runtime.sendMessage({ action: 'getMantras' }).then(response => response.mantras);  
  const suggestedMantra = mantras[Math.floor(Math.random() * mantras.length)] || '';
  // Ensure overlay HTML/CSS are loaded
  try {
    await ensureOverlayResources();
  } catch (err) {
    console.error('Could not load overlay resources, aborting overlay display.', err);
    overlayActive = false;
    return;
  }

  // Create host and Shadow DOM to isolate styles from page
  const host = document.createElement('div');
  host.id = 'mantra-block-overlay-host';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${window.__mantraOverlayCss}</style>${window.__mantraOverlayTemplate}`;
  document.documentElement.appendChild(host);
  console.debug('Injected overlay host and shadow root into document.');

  const inputField = shadow.querySelector('#mantra-input');
  if (inputField) {
    inputField.focus();
    inputField.placeholder = suggestedMantra;
  }

  // Prevent scrolling
  try {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    console.debug('Page scrolling disabled while overlay is active.');
  } catch (err) {
    console.warn('Unable to set overflow styles to disable scrolling', err);
  }

  // Set up event listeners
  setupFormListeners(shadow, mantras);
}

/**
 * Set up form event listeners
 */
function setupFormListeners(overlay, mantras) {
  if (!overlay) {
    console.warn('Overlay root missing — cannot set up form listeners.');
    return;
  }

  const form = overlay.querySelector('#mantra-form');
  const input = overlay.querySelector('#mantra-input');
  const settingsLink = overlay.querySelector('#mantra-settings');

  // Guard against missing elements
  if (!form) {
    console.warn('Mantra form not found in overlay.');
  }
  if (!input) {
    console.warn('Mantra input not found in overlay.');
  }

  // Prevent pasting if input exists
  if (input) {
    input.addEventListener('paste', (e) => {
      e.preventDefault();
    });
  }

  // Use event delegation for suggestion buttons (handles dynamic content)
  overlay.addEventListener('click', (e) => {
    const btn = e.target.closest('.suggestion-btn');
    if (!btn) return;
    e.preventDefault();
    const mantra = btn.getAttribute('data-mantra') || btn.dataset?.mantra;
    if (input) input.value = mantra;

    // Use requestSubmit when available to trigger native validation/submit
    if (form) {
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  });
  console.debug('Attached delegated click handler for .suggestion-btn on overlay root.');

  // Form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      if(mantras.length === 0) {
        alert('No mantras are set up. Please add mantras in the extension settings to continue.');
        return;
        //TODO: direct to settings
      }
      e.preventDefault();

      if (!input) {
        console.warn('Submit attempted but input is missing.');
        return;
      }

      const enteredMantra = input.value.trim();

      if (enteredMantra.length === 0) {
        alert('Please enter a mantra to continue.');
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
        return;
      }
    });
    console.debug('Attached form submit listener.');
  }

  // Settings link
  if (settingsLink) {
    settingsLink.addEventListener('click', async (e) => {
      await chrome.runtime.sendMessage({ action: 'openSettings' });
    });
  }

  if (input) {
    try { input.focus(); } catch (err) { /* ignore focus errors */ }
  }
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
    console.debug('Overlay removed and page scrolling restored.');
  } else {
    console.debug('removeBlockOverlay called but overlay host not found.');
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
