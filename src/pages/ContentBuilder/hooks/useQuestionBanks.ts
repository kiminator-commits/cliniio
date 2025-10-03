import { useState, useCallback, useMemo } from 'react';
import { QuestionBank, QuizQuestion } from '../types';

export const useQuestionBanks = () => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  const selectedBank = useMemo(() => {
    return questionBanks.find((bank) => bank.id === selectedBankId) || null;
  }, [questionBanks, selectedBankId]);

  const createQuestionBank = useCallback(
    (bank: Omit<QuestionBank, 'id' | 'createdAt'>) => {
      const newBank: QuestionBank = {
        ...bank,
        id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      setQuestionBanks((prev) => [...prev, newBank]);
      return newBank;
    },
    []
  );

  const updateQuestionBank = useCallback(
    (id: string, updates: Partial<QuestionBank>) => {
      setQuestionBanks((prev) =>
        prev.map((bank) => (bank.id === id ? { ...bank, ...updates } : bank))
      );
    },
    []
  );

  const deleteQuestionBank = useCallback(
    (id: string) => {
      setQuestionBanks((prev) => prev.filter((bank) => bank.id !== id));
      if (selectedBankId === id) {
        setSelectedBankId(null);
      }
    },
    [selectedBankId]
  );

  const selectQuestionBank = useCallback((id: string | null) => {
    setSelectedBankId(id);
  }, []);

  const addQuestionToBank = useCallback(
    (bankId: string, question: QuizQuestion) => {
      setQuestionBanks((prev) =>
        prev.map((bank) =>
          bank.id === bankId
            ? { ...bank, questions: [...bank.questions, question] }
            : bank
        )
      );
    },
    []
  );

  const updateQuestionInBank = useCallback(
    (bankId: string, questionId: string, updates: Partial<QuizQuestion>) => {
      setQuestionBanks((prev) =>
        prev.map((bank) =>
          bank.id === bankId
            ? {
                ...bank,
                questions: bank.questions.map((q) =>
                  q.id === questionId ? { ...q, ...updates } : q
                ),
              }
            : bank
        )
      );
    },
    []
  );

  const removeQuestionFromBank = useCallback(
    (bankId: string, questionId: string) => {
      setQuestionBanks((prev) =>
        prev.map((bank) =>
          bank.id === bankId
            ? {
                ...bank,
                questions: bank.questions.filter((q) => q.id !== questionId),
              }
            : bank
        )
      );
    },
    []
  );

  const moveQuestionInBank = useCallback(
    (bankId: string, questionId: string, newIndex: number) => {
      setQuestionBanks((prev) =>
        prev.map((bank) => {
          if (bank.id !== bankId) return bank;

          const questions = [...bank.questions];
          const currentIndex = questions.findIndex((q) => q.id === questionId);
          if (currentIndex === -1) return bank;

          const [question] = questions.splice(currentIndex, 1);
          questions.splice(newIndex, 0, question);

          return { ...bank, questions };
        })
      );
    },
    []
  );

  const importQuestionsToBank = useCallback(
    (bankId: string, questions: QuizQuestion[]) => {
      setQuestionBanks((prev) =>
        prev.map((bank) =>
          bank.id === bankId
            ? { ...bank, questions: [...bank.questions, ...questions] }
            : bank
        )
      );
    },
    []
  );

  const getQuestionsByDifficulty = useCallback(
    (difficulty: 'easy' | 'medium' | 'hard') => {
      return questionBanks.flatMap((bank) =>
        bank.questions.filter((q) => q.difficulty === difficulty)
      );
    },
    [questionBanks]
  );

  const getQuestionsByType = useCallback(
    (type: QuizQuestion['type']) => {
      return questionBanks.flatMap((bank) =>
        bank.questions.filter((q) => q.type === type)
      );
    },
    [questionBanks]
  );

  const getQuestionsByTags = useCallback(
    (tags: string[]) => {
      return questionBanks.flatMap((bank) =>
        bank.questions.filter((q) => tags.some((tag) => q.tags?.includes(tag)))
      );
    },
    [questionBanks]
  );

  const searchQuestions = useCallback(
    (searchTerm: string) => {
      const term = searchTerm.toLowerCase();
      return questionBanks.flatMap((bank) =>
        bank.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(term) ||
            q.tags?.some((tag) => tag.toLowerCase().includes(term))
        )
      );
    },
    [questionBanks]
  );

  const getBankStats = useCallback(
    (bankId: string) => {
      const bank = questionBanks.find((b) => b.id === bankId);
      if (!bank) return null;

      const totalQuestions = bank.questions.length;
      const questionsByType = bank.questions.reduce(
        (acc, q) => {
          acc[q.type] = (acc[q.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const questionsByDifficulty = bank.questions.reduce(
        (acc, q) => {
          acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const totalPoints = bank.questions.reduce((sum, q) => sum + q.points, 0);
      const averagePoints =
        totalQuestions > 0 ? totalPoints / totalQuestions : 0;

      return {
        totalQuestions,
        questionsByType,
        questionsByDifficulty,
        totalPoints,
        averagePoints,
      };
    },
    [questionBanks]
  );

  const duplicateQuestionBank = useCallback(
    (bankId: string, newName?: string) => {
      const bank = questionBanks.find((b) => b.id === bankId);
      if (!bank) return null;

      const duplicatedBank: QuestionBank = {
        ...bank,
        id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newName || `${bank.name} (Copy)`,
        createdAt: new Date(),
        isPublic: false, // Duplicates are private by default
      };

      setQuestionBanks((prev) => [...prev, duplicatedBank]);
      return duplicatedBank;
    },
    [questionBanks]
  );

  const exportQuestionBank = useCallback(
    (bankId: string) => {
      const bank = questionBanks.find((b) => b.id === bankId);
      if (!bank) return null;

      const exportData = {
        ...bank,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bank.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_question_bank.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return exportData;
    },
    [questionBanks]
  );

  return {
    // State
    questionBanks,
    selectedBank,
    selectedBankId,

    // Bank Management
    createQuestionBank,
    updateQuestionBank,
    deleteQuestionBank,
    selectQuestionBank,
    duplicateQuestionBank,
    exportQuestionBank,

    // Question Management
    addQuestionToBank,
    updateQuestionInBank,
    removeQuestionFromBank,
    moveQuestionInBank,
    importQuestionsToBank,

    // Queries
    getQuestionsByDifficulty,
    getQuestionsByType,
    getQuestionsByTags,
    searchQuestions,
    getBankStats,
  };
};
