import { execSync } from 'child_process';

console.log('Starting build test...');
console.log('Node version:', process.version);
console.log(
  'NPM version:',
  execSync('npm --version', { encoding: 'utf8' }).trim()
);
console.log('Current directory:', process.cwd());

try {
  console.log('Running npm install...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('Running vite build...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
