export const createAbortController = () => {
  const controller = new AbortController();
  const signal = controller.signal;

  const cancel = () => {
    controller.abort();
  };

  return { signal, cancel };
};
