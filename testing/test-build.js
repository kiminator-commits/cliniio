console.log('Test build starting...');
console.log('Node version:', process.version);
import { execSync } from 'child_process';

console.log(
  'NPM version:',
  execSync('npm --version', { encoding: 'utf8' }).trim()
);
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);
console.log('Test build completed successfully!');
