import { AppShell } from '../components/layout/AppShell';
import { AppProviders } from './providers/AppProviders';

export function App() {
  return <AppProviders><AppShell /></AppProviders>;
}
