import { useLocation } from 'react-router-dom';

export const useHelpContext = () => {
  const location = useLocation();

  const getCurrentContext = () => {
    const path = location.pathname;
    if (path.includes('/sterilization')) return 'sterilization';
    if (path.includes('/inventory')) return 'inventory';
    if (path.includes('/environmental-clean')) return 'environmental-clean';
    if (path.includes('/home')) return 'home';
    return 'general';
  };

  return { getCurrentContext };
};
