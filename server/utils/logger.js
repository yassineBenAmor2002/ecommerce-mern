import debug from 'debug';

// Create namespaced loggers
export const log = {
  // Core application logging
  app: debug('app:core'),
  
  // Database related logging
  db: debug('app:db'),
  
  // Authentication and authorization
  auth: debug('app:auth'),
  
  // Email service logging
  email: debug('app:email'),
  
  // API request/response logging
  api: debug('app:api'),
  
  // Error logging
  error: debug('app:error'),
  
  // Debug logging (very verbose)
  debug: debug('app:debug'),
};

// Configure debug output
const isDevelopment = process.env.NODE_ENV !== 'production';

debug.enable(process.env.DEBUG || (isDevelopment ? 'app:*,email:*' : 'app:error,app:api'));

// Override console methods in development
if (isDevelopment) {
  console.log = log.app;
  console.error = log.error;
  console.warn = log.error;
  console.info = log.app;
  console.debug = log.debug;
}

// Export a function to enable/disable namespaces
export function enableDebug(namespace) {
  debug.enable(namespace);
}

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  // In production, you might want to gracefully shut down the server here
  if (!isDevelopment) {
    process.exit(1);
  }
});

// Log memory usage (in development)
if (isDevelopment) {
  const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
  
  setInterval(() => {
    const memoryData = process.memoryUsage();
    
    log.debug('Memory Usage:', {
      rss: formatMemoryUsage(memoryData.rss),
      heapTotal: formatMemoryUsage(memoryData.heapTotal),
      heapUsed: formatMemoryUsage(memoryData.heapUsed),
      external: formatMemoryUsage(memoryData.external),
      arrayBuffers: formatMemoryUsage(memoryData.arrayBuffers),
    });
  }, 60000); // Log every minute
}
