import { BeerProvider } from "./BeerContext";
import { TankProvider } from "./TankContext";
import { ReadingProvider } from "./ReadingContext";

export default function AppProviders({
  children
}) {

  return (
    <BeerProvider>

      <TankProvider>

        <ReadingProvider>
          {children}
        </ReadingProvider>

      </TankProvider>

    </BeerProvider>
  );
}