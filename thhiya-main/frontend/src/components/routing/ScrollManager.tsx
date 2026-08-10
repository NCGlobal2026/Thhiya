import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Keeps hash-based navigation working in static hosting environments by
 * scrolling to the requested section (or to the top when no hash is provided)
 * every time the route changes.
 */
export const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const section = document.getElementById(targetId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
