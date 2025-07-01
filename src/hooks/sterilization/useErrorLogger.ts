import { toast } from 'react-hot-toast';

export function useErrorLogger(context: string) {
  return (err: unknown) => {
    console.error(`[${context}]`, err);
    toast.error('Something went wrong. Please try again.');
    // Optional: add logic here for remote logging or retry queue
  };
}
