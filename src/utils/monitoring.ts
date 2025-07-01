export const Monitoring = {
  recordPageLoad: (page: string) => {
    console.log(`Page loaded: ${page}`);
  },
  recordInteraction: (event: string) => {
    console.log(`User interaction: ${event}`);
  },
};
