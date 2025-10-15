import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiTrophy, mdiClose } from '@mdi/js';
import { supabase } from '@/lib/supabaseClient';

export interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

export interface GamificationData {
  rank: number;
  topUsers: LeaderboardUser[];
}

export interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamificationData: GamificationData;
  loading?: boolean;
  error?: string | null;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  gamificationData,
  loading = false,
  error = null,
}) => {
  const [category, setCategory] = useState<
    'All' | 'Learning' | 'Cleaning' | 'Challenges'
  >('All');
  const [_leaderboard, _setLeaderboard] = useState<
    { user_id: string; total_xp: number }[]
  >([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        let query = supabase
          .from('user_gamification_stats')
          .select('user_id, total_xp, category');

        if (category !== 'All')
          query = query.eq('category', category.toLowerCase());

        const { data, error } = await query
          .order('total_xp', { ascending: false })
          .limit(10);

        if (error) throw error;
        setLeaderboard(data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };

    fetchLeaderboard();
  }, [category]);

  // Provide default values to prevent undefined errors
  const safeData = {
    rank: gamificationData?.rank || 1,
    topUsers: gamificationData?.topUsers || [],
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Icon path={mdiTrophy} size={1} className="text-white" />
                </div>
                <h2 className="ml-3 text-xl font-bold text-[#5b5b5b]">
                  Office Leaderboard
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-700 font-medium">Your Rank</div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-700 mr-1">
                  #{safeData.rank}
                </span>
                <span className="text-blue-500 text-sm">/15</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl mb-3">
                <div className="text-red-600 text-sm font-semibold">
                  Error Loading Leaderboard
                </div>
                <div className="text-red-500 text-xs mt-1">{error}</div>
              </div>
            )}

            <div className="flex gap-2 mb-4 justify-center">
              {['All', 'Learning', 'Cleaning', 'Challenges'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as 'All' | 'Learning' | 'Cleaning' | 'Challenges')}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <div className="text-sm text-gray-500 mt-2">
                    Loading leaderboard...
                  </div>
                </div>
              )}

              {!loading &&
                !error &&
                safeData.topUsers.map((user, index) => (
                  <motion.div
                    key={
                      user.id ||
                      (user as unknown as { full_name: string }).full_name
                    }
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.2 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          {user.avatar}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Icon
                              path={mdiTrophy}
                              size={0.4}
                              className="text-white"
                            />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-700">
                          {(user as unknown as { full_name: string }).full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Rank #{index + 1}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-[#4ECDC4]">
                        {user.score}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">pts</span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(LeaderboardModal);
