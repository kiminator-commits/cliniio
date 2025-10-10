// Simple script to count TypeScript errors
import { execSync } from 'child_process';

try {
  const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', { 
    encoding: 'utf8',
    cwd: process.cwd()
  });
  
  const lines = output.split('\n');
  const fileErrorCounts = {};
  let totalErrors = 0;
  
  for (const line of lines) {
    // Match TypeScript error lines
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
    .slice(0, 20);
  
  console.log(`\n🔴 Total TypeScript Errors: ${totalErrors}`);
  console.log(`\n📊 Top 20 Files with Most TypeScript Errors:`);
  console.log('='.repeat(70));
  
  sortedFiles.forEach(([filePath, count], index) => {
    console.log(`${String(index + 1).padStart(2)}. ${filePath.padEnd(50)} - ${count} errors`);
  });
  
  console.log('\n' + '='.repeat(70));
  
} catch (error) {
  console.error('Error:', error.message);
}
