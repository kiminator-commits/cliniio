export const useLoginService = () => {
  return {
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    test: 'test',
  };
};
