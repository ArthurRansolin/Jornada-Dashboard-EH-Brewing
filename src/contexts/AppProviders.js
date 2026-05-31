import { ApiProvider } from './ApiContext';
import { BeerProvider } from './BeerContext';
import { ReadingProvider } from './ReadingContext';
import { TankProvider } from './TankContext';

export default function AppProviders({ children }) {
  return (
    <ApiProvider>
      <BeerProvider>
        <TankProvider>
          <ReadingProvider>{children}</ReadingProvider>
        </TankProvider>
      </BeerProvider>
    </ApiProvider>
  );
}
