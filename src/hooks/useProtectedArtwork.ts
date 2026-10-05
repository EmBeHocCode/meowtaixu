import { useEffect } from 'react';

const protectedSelector = '.protected-artwork';

export function useProtectedArtwork() {
  useEffect(() => {
    const protect = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(protectedSelector)) event.preventDefault();
    };
    document.addEventListener('dragstart', protect);
    document.addEventListener('contextmenu', protect);
    return () => {
      document.removeEventListener('dragstart', protect);
      document.removeEventListener('contextmenu', protect);
    };
  }, []);
}
