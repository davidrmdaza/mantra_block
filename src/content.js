/**
 * Content script
 * Displays overlay on blocked websites with mantra form
 */

// Inject overlay styles
const styleElement = document.createElement('style');
styleElement.textContent = `
#mantra-block-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(75, 0, 130, 0.85) 0%, rgba(0, 0, 139, 0.85) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

.mantra-block-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  padding: 40px;
  text-align: center;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mantra-block-header {
  margin-bottom: 30px;
}

.mantra-block-header h1 {
  margin: 0;
  font-size: 32px;
  color: #4b0082;
  font-weight: 700;
}

.mantra-block-subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.mantra-block-content {
  text-align: left;
}

.mantra-block-message {
  font-size: 16px;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.mantra-block-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.mantra-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.mantra-input:focus {
  outline: none;
  border-color: #4b0082;
  background-color: #f9f7ff;
}

.form-hint {
  display: block;
  color: #999;
  font-size: 12px;
  margin-top: 6px;
}

.mantra-suggestions {
  margin-bottom: 20px;
}

.mantra-suggestions label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-btn {
  padding: 10px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  color: #333;
  font-family: inherit;
}

.suggestion-btn:hover {
  background: #e8e8ff;
  border-color: #4b0082;
}

.suggestion-btn:active {
  background: #d8d0ff;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4b0082 0%, #000080 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(75, 0, 130, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.settings-link {
  display: block;
  text-align: center;
  color: #4b0082;
  text-decoration: none;
  font-size: 12px;
  margin-top: 20px;
  cursor: pointer;
  transition: color 0.2s;
}

.settings-link:hover {
  color: #000080;
  text-decoration: underline;
}
`;
document.documentElement.appendChild(styleElement);

let overlayActive = false;

/**
 * Create and display the blocking overlay
 */
async function displayBlockOverlay() {
  if (overlayActive) return;
  overlayActive = true;

  const mantras = await getMantras();
  
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'mantra-block-overlay';
  overlay.innerHTML = `
    <div class="mantra-block-card">
      <div class="mantra-block-header">
        <h1>Mantra Block</h1>
        <p class="mantra-block-subtitle">Take a moment for yourself</p>
      </div>
      
      <div class="mantra-block-content">
        <p class="mantra-block-message">This site is blocked. Before you continue, enter one of your mantras:</p>
        
        <form id="mantra-form" class="mantra-block-form">
          <div class="form-group">
            <label for="mantra-input">Your Mantra:</label>
            <textarea
              id="mantra-input"
              class="mantra-input"
              placeholder="Enter your mantra here..."
              rows="3"
              spellcheck="true"
            ></textarea>
            <small class="form-hint">You cannot paste. Please type your mantra to continue.</small>
          </div>
          
          <div class="mantra-suggestions">
            <label>Or select one:</label>
            <div class="suggestions-list">
              ${mantras.map((mantra, index) => `
                <button
                  type="button"
                  class="suggestion-btn"
                  data-mantra="${mantra}"
                >
                  ${mantra}
                </button>
              `).join('')}
            </div>
          </div>
          
          <button type="submit" class="submit-btn">Continue</button>
        </form>
        
        <a href="#" id="mantra-settings" class="settings-link">Edit Mantras & Blacklist</a>
      </div>
    </div>
  `;
  
  document.documentElement.appendChild(overlay);
  
  // Prevent scrolling
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  
  // Set up event listeners
  setupFormListeners(overlay, mantras);
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
  const overlay = document.getElementById('mantra-block-overlay');
  if (overlay) {
    overlay.remove();
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    overlayActive = false;
  }
}

/**
 * Check if current page should be blocked and display overlay
 */
async function checkAndBlock() {
  const blocked = await isBlocked(window.location.href);
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
