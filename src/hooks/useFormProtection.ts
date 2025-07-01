import { useState } from 'react';

export const useFormProtection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startSubmission = () => setIsSubmitting(true);
  const endSubmission = () => setIsSubmitting(false);

  return { isSubmitting, startSubmission, endSubmission };
};
