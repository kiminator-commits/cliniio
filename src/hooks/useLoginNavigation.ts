import { useNavigate } from 'react-router-dom';

export const useLoginNavigation = () => {
  const navigate = useNavigate();
  return (path: string) => {
    navigate(path);
  };
};
