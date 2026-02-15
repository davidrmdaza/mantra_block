/**
 * Timer management for mantra-block
 * Handles session timers with weighted randomization
 */

let activeTimer = null;

/**
 * Generate a random duration in seconds with weighted distribution
 * - 80% chance: 10-15 minutes (600-900 seconds)
 * - 18% chance: 15-19 minutes (900-1140 seconds)
 * - 2% chance: 20 minutes (1200 seconds)
 * @returns {number} Duration in seconds
 */
function generateRandomDuration() {
  const random = Math.random();
// Use inverse transform sampling to create a weighted distribution curve
// that clusters probability toward 10 minutes and spreads toward 15 minutes

const bucket = Math.random();
let durationSeconds;

if (bucket < 0.80) {
    // 80% bucket: 10-15 minutes with bias toward 10 minutes
    // Using square root to create a curve that peaks at 10 min
    const t = Math.sqrt(Math.random());
    durationSeconds = 600 + t * 300;
} else if (bucket < 0.98) {
    // 18% bucket: 15-19 minutes
    durationSeconds = 900 + Math.random() * 240;
} else {
    // 2% bucket: 20 minutes
    durationSeconds = 1200;
}

return durationSeconds;
  if (random < 0.80) {
    // 80% - between 10 and 15 minutes
    return 600 + Math.random() * 300; // 600-900 seconds
  } else if (random < 0.98) {
    // 18% - between 15 and 19 minutes
    return 900 + Math.random() * 240; // 900-1140 seconds
  } else {
    // 2% - exactly 20 minutes
    return 1200; // 1200 seconds
  }
}

/**
 * Start a new session timer
 * @param {Function} onExpire - Callback when timer expires
 * @returns {number} Duration in seconds
 */
function startTimer(onExpire) {
  // Clear existing timer if any
  if (activeTimer) {
    clearTimeout(activeTimer.timeoutId);
  }

  const durationSeconds = generateRandomDuration();
  const durationMinutes = (durationSeconds / 60).toFixed(2);
  const expiresAt = Date.now() + (durationSeconds * 1000);

  console.log(`[TIMER] Starting session timer for ${durationMinutes} minutes (${durationSeconds} seconds)`);
  console.log(`[TIMER] Timer will expire at: ${new Date(expiresAt).toLocaleTimeString()}`);

  activeTimer = {
    durationSeconds,
    expiresAt,
    timeoutId: setTimeout(() => {
      console.log(`[TIMER] Session timer expired after ${durationMinutes} minutes`);
      activeTimer = null;
      onExpire();
    }, durationSeconds * 1000)
  };

  return durationSeconds;
}

/**
 * Stop the active timer
 */
function stopTimer() {
  if (activeTimer) {
    clearTimeout(activeTimer.timeoutId);
    const remainingSeconds = ((activeTimer.expiresAt - Date.now()) / 1000).toFixed(2);
    console.log(`[TIMER] Timer stopped with ${remainingSeconds} seconds remaining`);
    activeTimer = null;
  }
}

/**
 * Check if a timer is currently active
 * @returns {boolean}
 */
function isTimerActive() {
  return activeTimer !== null && activeTimer.expiresAt > Date.now();
}

/**
 * Get remaining time in seconds
 * @returns {number|null} Remaining seconds or null if no active timer
 */
function getRemainingTime() {
  if (!activeTimer) return null;
  const remaining = (activeTimer.expiresAt - Date.now()) / 1000;
  return Math.max(0, remaining);
}