import { useState } from 'react';
import {
  feedbackService,
  FeedbackSubmission,
} from '../services/feedbackService';

export const useFeedbackSubmission = () => {
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackPriority, setFeedbackPriority] = useState('medium');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);

    try {
      const feedback: FeedbackSubmission = {
        type: feedbackType,
        title: feedbackTitle,
        description: feedbackDescription,
        priority: feedbackPriority,
        email: feedbackEmail,
      };

      const result = await feedbackService.submitFeedback(feedback);

      if (!result.success) {
        console.error('Error submitting feedback:', result.error);
        alert('There was an error submitting your feedback. Please try again.');
        return false;
      }

      // Reset form
      setFeedbackType('');
      setFeedbackTitle('');
      setFeedbackDescription('');
      setFeedbackPriority('medium');
      setFeedbackEmail('');

      // Show success message
      alert(
        "Thank you for your feedback! We'll review it and get back to you if needed."
      );

      return true; // Success
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
      return false; // Failure
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const resetFeedbackForm = () => {
    setFeedbackType('');
    setFeedbackTitle('');
    setFeedbackDescription('');
    setFeedbackPriority('medium');
    setFeedbackEmail('');
  };

  return {
    feedbackType,
    setFeedbackType,
    feedbackTitle,
    setFeedbackTitle,
    feedbackDescription,
    setFeedbackDescription,
    feedbackPriority,
    setFeedbackPriority,
    feedbackEmail,
    setFeedbackEmail,
    isSubmittingFeedback,
    handleFeedbackSubmit,
    resetFeedbackForm,
  };
};
