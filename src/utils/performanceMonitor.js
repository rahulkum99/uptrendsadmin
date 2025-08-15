// Performance monitoring utilities

class PerformanceMonitor {
  constructor() {
    this.violations = [];
    this.isMonitoring = false;
  }

  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor for performance violations
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure' && entry.duration > 50) {
              console.warn('Performance violation detected:', {
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime
              });
              this.violations.push({
                type: 'measure',
                name: entry.name,
                duration: entry.duration,
                timestamp: Date.now()
              });
            }
          }
        });
        
        observer.observe({ entryTypes: ['measure'] });
        this.observer = observer;
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    // Monitor for long tasks
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
            this.violations.push({
              type: 'longTask',
              duration: entry.duration,
              timestamp: Date.now()
            });
          }
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.longTaskObserver = longTaskObserver;
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }
  }

  stop() {
    this.isMonitoring = false;
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect();
    }
  }

  getViolations() {
    return this.violations;
  }

  clearViolations() {
    this.violations = [];
  }

  // Measure execution time of a function
  measure(name, fn) {
    if (typeof performance !== 'undefined' && performance.mark) {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;
      
      performance.mark(startMark);
      
      const result = fn();
      
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      
      return result;
    } else {
      // Fallback for browsers without performance API
      const start = Date.now();
      const result = fn();
      const duration = Date.now() - start;
      
      if (duration > 50) {
        console.warn(`Function ${name} took ${duration}ms to execute`);
      }
      
      return result;
    }
  }

  // Async version of measure
  async measureAsync(name, fn) {
    if (typeof performance !== 'undefined' && performance.mark) {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;
      
      performance.mark(startMark);
      
      const result = await fn();
      
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      
      return result;
    } else {
      // Fallback for browsers without performance API
      const start = Date.now();
      const result = await fn();
      const duration = Date.now() - start;
      
      if (duration > 50) {
        console.warn(`Async function ${name} took ${duration}ms to execute`);
      }
      
      return result;
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export functions
export const startPerformanceMonitoring = () => performanceMonitor.start();
export const stopPerformanceMonitoring = () => performanceMonitor.stop();
export const getPerformanceViolations = () => performanceMonitor.getViolations();
export const clearPerformanceViolations = () => performanceMonitor.clearViolations();
export const measurePerformance = (name, fn) => performanceMonitor.measure(name, fn);
export const measureAsyncPerformance = (name, fn) => performanceMonitor.measureAsync(name, fn);

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  startPerformanceMonitoring();
}
