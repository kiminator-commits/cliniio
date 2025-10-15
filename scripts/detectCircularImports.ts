import madge from "madge";

async function detectCircularImports() {
  const result = await madge("./src", {
    tsConfig: "./tsconfig.json",
    includeNpm: false,
    skipFile: ["node_modules"],
  });

  const circular = result.circular();

  if (circular.length === 0) {
    console.log("✅ No circular dependencies detected.");
  } else {
    console.log("⚠️ Circular dependencies found:");
    circular.forEach((cycle, i) => {
      console.log(`${i + 1}. ${cycle.join(" → ")}`);
    });
  }
}

detectCircularImports().catch((err) => {
  console.error("Error detecting circular imports:", err);
});
