import fs from 'fs';
import _path from 'path';
import glob from 'glob';

// Pattern to match Supabase .from() calls with only one type argument
const supabaseFromPattern =
  /\.from<Database\['public'\]\['Tables'\]\['([^']+)'\]\['Row'\]>\('([^']+)'\)/g;

// Function to fix a single file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Replace the pattern with the correct two-type-argument format
    const newContent = content.replace(
      supabaseFromPattern,
      (match, tableName, tableNameInQuotes) => {
        hasChanges = true;
        return `.from<'${tableNameInQuotes}', Database['public']['Tables']['${tableName}']['Row']>('${tableNameInQuotes}')`;
      }
    );

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing Supabase type arguments...\n');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
});

let totalFixed = 0;
let filesProcessed = 0;

files.forEach((file) => {
  if (fixFile(file)) {
    totalFixed++;
  }
  filesProcessed++;
});

console.log(`\n✅ Complete!`);
console.log(`📁 Files processed: ${filesProcessed}`);
console.log(`🔧 Files fixed: ${totalFixed}`);
console.log(`\nRun 'npx tsc --noEmit --skipLibCheck' to verify the fixes.`);
