import { useCallback, useMemo, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string, serverValue = false) {
  const media = useMemo(() => typeof window === 'undefined' ? null : window.matchMedia(query), [query]);
  const subscribe = useCallback((notify: () => void) => {
    media?.addEventListener('change', notify);
    return () => media?.removeEventListener('change', notify);
  }, [media]);
  return useSyncExternalStore(subscribe, () => media?.matches ?? serverValue, () => serverValue);
}
