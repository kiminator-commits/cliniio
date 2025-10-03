import fs from 'fs';

// Read the error file
const content = fs.readFileSync('ts_errors.txt', 'utf8');

// Split into lines and filter for TypeScript error lines
const lines = content
  .split('\n')
  .filter((line) => line.match(/^src\/.*\.ts\(\d+,\d+\): error/));

// Extract file names and count errors
const fileCounts = {};
lines.forEach((line) => {
  const match = line.match(/^(src\/.*\.ts)\(\d+,\d+\):/);
  if (match) {
    const fileName = match[1];
    fileCounts[fileName] = (fileCounts[fileName] || 0) + 1;
  }
});

// Sort by error count (descending)
const sortedFiles = Object.entries(fileCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 20);

console.log('Files with the most TypeScript errors:');
console.log('=====================================');
sortedFiles.forEach(([fileName, count], index) => {
  console.log(`${index + 1}. ${fileName}: ${count} errors`);
});

console.log(`\nTotal files with errors: ${Object.keys(fileCounts).length}`);
console.log(`Total errors: ${lines.length}`);
