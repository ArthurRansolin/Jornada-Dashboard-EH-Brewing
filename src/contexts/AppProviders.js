import { ApiProvider } from './ApiContext';

export default function AppProviders({ children }) {
  return <ApiProvider>{children}</ApiProvider>;
}