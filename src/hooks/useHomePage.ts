import { useHomeStore } from '../store/homeStore';
import { useHomeActions } from './useHomeActions';

const useHomePage = () => {
  // Use global state from useHomeStore
  const { tasks, gamificationData, leaderboardUsers } = useHomeStore();
  const { handleTaskComplete } = useHomeActions();

  return { tasks, gamificationData, leaderboardUsers, handleTaskComplete };
};

export default useHomePage;
