/**
 * Storage utility module for managing blacklist and mantras
 */

const DEFAULT_BLACKLIST = [
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
  'youtube.com',
  'twitter.com',
  'x.com',
  'twitch.tv'
];

const DEFAULT_MANTRAS = [
  'I am focused on my goals.',
  'This moment is precious.',
  'I choose productivity.',
  'My time is valuable.',
  'I am in control of my actions.'
];

/**
 * Initialize storage with default values if not already set
 */
async function initializeStorage() {
  const { blacklist, mantras } = await chrome.storage.local.get(['blacklist', 'mantras']);
  
  if (!blacklist) {
    await chrome.storage.local.set({ blacklist: DEFAULT_BLACKLIST });
  }
  
  if (!mantras) {
    await chrome.storage.local.set({ mantras: DEFAULT_MANTRAS });
  }
}

/**
 * Get the current blacklist
 * @returns {Promise<string[]>} Array of blocked domains
 */
async function getBlacklist() {
  const { blacklist } = await chrome.storage.local.get('blacklist');
  return blacklist || DEFAULT_BLACKLIST;
}

/**
 * Add a site to the blacklist
 * @param {string} domain - Domain to add (e.g., 'example.com')
 */
async function addToBlacklist(domain) {
  const blacklist = await getBlacklist();
  if (!blacklist.includes(domain)) {
    blacklist.push(domain);
    await chrome.storage.local.set({ blacklist });
  }
}

/**
 * Remove a site from the blacklist
 * @param {string} domain - Domain to remove
 */
async function removeFromBlacklist(domain) {
  const blacklist = await getBlacklist();
  const filtered = blacklist.filter(d => d !== domain);
  await chrome.storage.local.set({ blacklist: filtered });
}

/**
 * Get the current mantras list
 * @returns {Promise<string[]>} Array of mantras
 */
async function getMantras() {
  const { mantras } = await chrome.storage.local.get('mantras');
  return mantras || DEFAULT_MANTRAS;
}

/**
 * Set the mantras list
 * @param {string[]} mantrasArray - Array of mantras
 */
async function setMantras(mantrasArray) {
  await chrome.storage.local.set({ mantras: mantrasArray });
}

/**
 * Add a mantra
 * @param {string} mantra - Mantra text to add
 */
async function addMantra(mantra) {
  const mantras = await getMantras();
  if (!mantras.includes(mantra)) {
    mantras.push(mantra);
    await chrome.storage.local.set({ mantras });
  }
}

/**
 * Remove a mantra
 * @param {string} mantra - Mantra text to remove
 */
async function removeMantra(mantra) {
  const mantras = await getMantras();
  const filtered = mantras.filter(m => m !== mantra);
  await chrome.storage.local.set({ mantras: filtered });
}

/**
 * Check if a URL is on the blacklist
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} True if URL is blocked
 */
async function isBlocked(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const blacklist = await getBlacklist();
    
    // Check for exact match and subdomain match
    return blacklist.some(blockedDomain => {
      return domain === blockedDomain || domain.endsWith('.' + blockedDomain);
    });
  } catch (e) {
    return false;
  }
}
