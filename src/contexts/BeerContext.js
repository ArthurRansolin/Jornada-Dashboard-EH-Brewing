import {
  createContext,
  useEffect,
  useState
} from "react";

export const BeerContext =
  createContext();

export function BeerProvider({
  children
}) {

  const [beerTypes, setBeerTypes] =
    useState(() => {

      return JSON.parse(
        localStorage.getItem("beerTypes")
      ) || [];

    });

  useEffect(() => {

    localStorage.setItem(
      "beerTypes",
      JSON.stringify(beerTypes)
    );

  }, [beerTypes]);

  return (
    <BeerContext.Provider
      value={{
        beerTypes,
        setBeerTypes
      }}
    >
      {children}
    </BeerContext.Provider>
  );
}