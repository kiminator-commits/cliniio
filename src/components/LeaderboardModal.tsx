import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiTrophy, mdiClose } from '@mdi/js';

export interface LeaderboardUser {
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
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  gamificationData,
}) => {
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
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Icon path={mdiTrophy} size={1} className="text-white" />
                </div>
                <h2 className="ml-3 text-xl font-bold text-[#5b5b5b]">Office Leaderboard</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <Icon path={mdiClose} size={1} />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-700 font-medium">Your Rank</div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-700 mr-1">
                  #{gamificationData.rank}
                </span>
                <span className="text-blue-500 text-sm">/15</span>
              </div>
            </div>

            <div className="space-y-3">
              {gamificationData.topUsers.map((user, index) => (
                <motion.div
                  key={user.name}
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
                          <Icon path={mdiTrophy} size={0.4} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-700">{user.name}</div>
                      <div className="text-xs text-gray-500">Rank #{index + 1}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-[#4ECDC4]">{user.score}</span>
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
