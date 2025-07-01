export const ErrorFallback = () => {
  return (
    <div className="p-6 bg-red-100 text-red-800 rounded-lg shadow text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm">Please refresh the page or contact support if the issue persists.</p>
    </div>
  );
};
