/**
 * Options page script
 * Handles settings management for mantras and blacklist
 */

let isFirstLoad = true;

document.addEventListener('DOMContentLoaded', async () => {
  await loadMantras();
  await loadBlacklist();
  setupEventListeners();
  isFirstLoad = false;
});

/**
 * Load and display mantras
 */
async function loadMantras() {
  const mantras = await getMantras();
  const mantrasList = document.getElementById('mantrasList');

  if (mantras.length === 0) {
    mantrasList.innerHTML = '<div class="empty-state">No mantras yet. Add one to get started!</div>';
  } else {
    mantrasList.innerHTML = mantras
      .map((mantra, index) => {
        return `
        <div class="list-item">
          <div class="list-item-text">${escapeHtml(mantra)}</div>
          <button class="delete-mantra" data-mantra="${index}">Delete</button>
        </div>
      `;
      })
      .join('');

    // Add delete listeners
    document.querySelectorAll('.delete-mantra').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const index = parseInt(e.target.getAttribute('data-mantra'));
        const mantras = await getMantras();
        await removeMantra(mantras[index]);
        await loadMantras();
      });
    });
  }
}

/**
 * Load and display blacklist
 */
async function loadBlacklist() {
  const blacklist = await getBlacklist();
  const blacklistList = document.getElementById('blacklistList');

  if (blacklist.length === 0) {
    blacklistList.innerHTML = '<div class="empty-state">No blocked sites.</div>';
  } else {
    blacklistList.innerHTML = blacklist
      .map((domain, index) => {
        return `
        <div class="list-item">
          <div class="list-item-text">${escapeHtml(domain)}</div>
          <button class="delete-domain" data-domain="${index}">Delete</button>
        </div>
      `;
      })
      .join('');

    // Add delete listeners
    document.querySelectorAll('.delete-domain').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const index = parseInt(e.target.getAttribute('data-domain'));
        const blacklist = await getBlacklist();
        await removeFromBlacklist(blacklist[index]);
        await loadBlacklist();
      });
    });
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const addMantraBtn = document.getElementById('addMantraBtn');
  const addBlacklistBtn = document.getElementById('addBlacklistBtn');
  const resetBtn = document.getElementById('resetBtn');
  const mantraInput = document.getElementById('mantraInput');
  const blacklistInput = document.getElementById('blacklistInput');

  addMantraBtn.addEventListener('click', async () => {
    const mantra = mantraInput.value.trim();

    if (!mantra) {
      showStatus('Please enter a mantra', 'error');
      return;
    }

    await addMantra(mantra);
    mantraInput.value = '';
    await loadMantras();
    showStatus('Mantra added successfully!', 'success');
  });

  addBlacklistBtn.addEventListener('click', async () => {
    let domain = blacklistInput.value.trim();

    if (!domain) {
      showStatus('Please enter a domain', 'error');
      return;
    }

    // Remove protocol if present
    domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      showStatus('Please enter a valid domain (e.g., example.com)', 'error');
      return;
    }

    const blacklist = await getBlacklist();
    if (blacklist.includes(domain)) {
      showStatus('This domain is already blocked', 'error');
      return;
    }

    await addToBlacklist(domain);
    blacklistInput.value = '';
    await loadBlacklist();
    showStatus('Site added to blocklist!', 'success');
  });

  resetBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset to default mantras and blocklist? This cannot be undone.')) {
      await chrome.storage.local.set({
        blacklist: DEFAULT_BLACKLIST,
        mantras: DEFAULT_MANTRAS
      });
      await loadMantras();
      await loadBlacklist();
      showStatus('Reset to defaults!', 'success');
    }
  });

  // Enter key support
  mantraInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addMantraBtn.click();
  });

  blacklistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBlacklistBtn.click();
  });
}

/**
 * Show status message
 */
function showStatus(message, type) {
  const statusMsg = document.getElementById('statusMessage');
  statusMsg.textContent = message;
  statusMsg.className = `status-message ${type}`;

  setTimeout(() => {
    statusMsg.className = 'status-message';
  }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
