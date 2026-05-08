import {
  createContext,
  useEffect,
  useState
} from "react";

export const TankContext =
  createContext();

export function TankProvider({
  children
}) {

  const [tanks, setTanks] =
    useState(() => {

      return JSON.parse(
        localStorage.getItem("tanks")
      ) || [];

    });

  useEffect(() => {

    localStorage.setItem(
      "tanks",
      JSON.stringify(tanks)
    );

  }, [tanks]);

  return (
    <TankContext.Provider
      value={{
        tanks,
        setTanks
      }}
    >
      {children}
    </TankContext.Provider>
  );
}