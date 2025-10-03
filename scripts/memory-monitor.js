#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Memory monitoring script for CI
function monitorMemory() {
  const used = process.memoryUsage();
  const formatBytes = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  console.log('=== MEMORY USAGE ===');
  console.log('RSS:', formatBytes(used.rss));
  console.log('Heap Used:', formatBytes(used.heapUsed));
  console.log('Heap Total:', formatBytes(used.heapTotal));
  console.log('External:', formatBytes(used.external));
  console.log('Array Buffers:', formatBytes(used.arrayBuffers));
  console.log('===================');

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    console.log('Garbage collection forced');
  }

  // Check if memory usage is too high
  const heapUsedMB = used.heapUsed / 1024 / 1024;
  if (heapUsedMB > 1000) {
    // 1GB threshold
    console.warn(
      `⚠️  High memory usage detected: ${formatBytes(used.heapUsed)}`
    );
  }
}

// Monitor memory every 30 seconds
setInterval(monitorMemory, 30000);

// Initial memory check
monitorMemory();

// Export for use in tests
module.exports = { monitorMemory };
