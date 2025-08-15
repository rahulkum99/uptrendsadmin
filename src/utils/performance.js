// Performance-optimized scheduling utilities

/**
 * Schedule a task to run when the browser is idle
 * @param {Function} callback - The function to execute
 * @param {number} timeout - Maximum time to wait (default: 1000ms)
 */
export const scheduleIdleTask = (callback, timeout = 1000) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback, { timeout });
  } else {
    // Fallback to setTimeout with minimal delay
    setTimeout(callback, 0);
  }
};

/**
 * Schedule a task with a delay, optimized for performance
 * @param {Function} callback - The function to execute
 * @param {number} delay - Delay in milliseconds
 */
export const scheduleDelayedTask = (callback, delay) => {
  if (delay <= 0) {
    scheduleIdleTask(callback);
  } else {
    setTimeout(() => {
      scheduleIdleTask(callback);
    }, delay);
  }
};

/**
 * Debounce function to prevent excessive calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit execution frequency
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Check if the current execution context is suitable for heavy operations
 * @returns {boolean} - True if it's safe to perform heavy operations
 */
export const isIdleTime = () => {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => resolve(true), { timeout: 100 });
    } else {
      // Fallback: assume it's safe after a minimal delay
      setTimeout(() => resolve(true), 0);
    }
  });
};
