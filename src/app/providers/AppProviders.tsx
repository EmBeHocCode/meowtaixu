import type { PropsWithChildren } from 'react';

export function AppProviders({ children }: PropsWithChildren) {
  // HorizontalJourney owns input and interpolation. Do not mount vertical Lenis.
  return <>{children}</>;
}
