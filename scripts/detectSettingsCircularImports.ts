import madge from "madge";

async function detectSettingsCircularImports() {
  try {
    console.log("🔍 Analyzing Settings directory for circular imports...");
    
    const result = await madge("./src/pages/Settings", {
      tsConfig: "./tsconfig.json",
      includeNpm: false,
      skipFile: ["node_modules"],
    });

    const circular = result.circular();

    if (circular.length === 0) {
      console.log("✅ No circular dependencies detected in Settings directory.");
    } else {
      console.log("⚠️ Circular dependencies found in Settings:");
      circular.forEach((cycle, i) => {
        console.log(`${i + 1}. ${cycle.join(" → ")}`);
      });
    }

    // Also check for any problematic import patterns
    console.log("\n🔍 Checking for potential import issues...");
    const graph = result.obj();
    
    // Find files with many imports
    const importCounts = Object.entries(graph).map(([file, imports]) => ({
      file,
      count: Object.keys(imports).length
    })).sort((a, b) => b.count - a.count);

    console.log("\n📊 Files with most imports:");
    importCounts.slice(0, 10).forEach(({ file, count }) => {
      console.log(`  ${file}: ${count} imports`);
    });

  } catch (error) {
    console.error("Error analyzing Settings directory:", error);
  }
}

detectSettingsCircularImports();
