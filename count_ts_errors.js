const { execSync } = require('child_process');

try {
  console.log('Running TypeScript check...');
  const output = execSync('npx tsc --noEmit --skipLibCheck', { 
    encoding: 'utf8', 
    stdio: 'pipe' 
  });
} catch (error) {
  const output = error.stdout || error.stderr || '';
  
  // Extract file paths and count errors
  const lines = output.split('\n');
  const fileErrorCounts = {};
  
  lines.forEach(line => {
    if (line.includes('error TS') && (line.includes('.ts') || line.includes('.tsx'))) {
      // Extract file path from error line
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        const filePath = match[1];
        fileErrorCounts[filePath] = (fileErrorCounts[filePath] || 0) + 1;
      }
    }
  });
  
  // Sort by error count (descending)
  const sortedFiles = Object.entries(fileErrorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Get top 10
  
  console.log('\nTop 10 files with most TypeScript errors:');
  console.log('==========================================');
  sortedFiles.forEach(([file, count], index) => {
    console.log(`${index + 1}. ${file} - ${count} errors`);
  });
}
