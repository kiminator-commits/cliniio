export const runStressTest = (
  label: string,
  action: () => void,
  iterations: number = 1000,
  delay: number = 0
) => {
  console.log(`[StressTest] Running "${label}" for ${iterations} iterations.`);
  let count = 0;

  const run = () => {
    if (count >= iterations) {
      console.log(`[StressTest] "${label}" completed.`);
      return;
    }
    action();
    count++;
    if (delay > 0) {
      setTimeout(run, delay);
    } else {
      run();
    }
  };

  run();
};
