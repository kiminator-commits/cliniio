// Run TypeScript compiler and capture output
import { execSync } from 'child_process';

try {
  console.log('Running TypeScript compiler...');
  const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', { 
    encoding: 'utf8',
    cwd: process.cwd()
  });
  
  // Parse the output to extract file paths and error counts
  const lines = output.split('\n');
  const fileErrorCounts = {};
  let totalErrors = 0;
  
  for (const line of lines) {
    // Match TypeScript error lines like: src/file.ts(10,5): error TS1234: message
    const match = line.match(/^([^(]+)\([0-9]+,[0-9]+\): error TS[0-9]+:/);
    if (match) {
      const filePath = match[1];
      if (!fileErrorCounts[filePath]) {
        fileErrorCounts[filePath] = 0;
      }
      fileErrorCounts[filePath]++;
      totalErrors++;
    }
  }
  
  // Sort files by error count (descending)
  const sortedFiles = Object.entries(fileErrorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20); // Top 20
  
  console.log(`\nTotal TypeScript Errors: ${totalErrors}`);
  console.log(`\nTop 20 Files with Most TypeScript Errors:`);
  console.log('='.repeat(60));
  
  sortedFiles.forEach(([filePath, count], index) => {
    console.log(`${index + 1}. ${filePath} - ${count} errors`);
  });
  
  console.log('\n' + '='.repeat(60));
  
} catch (error) {
  console.error('Error running TypeScript compiler:', error.message);
}
