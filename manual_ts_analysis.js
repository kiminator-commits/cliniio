// Manual analysis of TypeScript errors from the output we saw
const errorLines = [
  "src/utils/Inventory/deleteOperationUtils.ts(50,7): error TS2698: Spread types may only be created from object types.",
  "src/utils/Inventory/deleteOperationUtils.ts(69,7): error TS2698: Spread types may only be created from object types.",
  "src/utils/Inventory/formatting.ts(206,38): error TS2339: Property 'createdAt' does not exist on type 'Json'.",
  "src/utils/Inventory/formatting.ts(207,38): error TS2339: Property 'updatedAt' does not exist on type 'Json'.",
  "src/utils/providers/GamificationSkillProvider.ts(275,11): error TS2769: No overload matches this call.",
  "src/utils/queryOptimization.ts(321,38): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SupabaseQuery'."
];

const fileErrorCounts = {};
let totalErrors = 0;

for (const line of errorLines) {
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
  .sort(([,a], [,b]) => b - a);

console.log(`\n🔴 Total TypeScript Errors: ${totalErrors}`);
console.log(`\n📊 Files with TypeScript Errors:`);
console.log('='.repeat(60));

sortedFiles.forEach(([filePath, count], index) => {
  console.log(`${String(index + 1).padStart(2)}. ${filePath.padEnd(45)} - ${count} errors`);
});

console.log('\n' + '='.repeat(60));
console.log('\n📝 Error Details:');
console.log('='.repeat(60));

errorLines.forEach((line, index) => {
  console.log(`${index + 1}. ${line}`);
});
