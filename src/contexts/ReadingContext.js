import {
  createContext,
  useEffect,
  useState
} from "react";

export const ReadingContext =
  createContext();

export function ReadingProvider({
  children
}) {

  const [readings, setReadings] =
    useState(() => {

      return JSON.parse(
        localStorage.getItem("readings")
      ) || [];

    });

  useEffect(() => {

    localStorage.setItem(
      "readings",
      JSON.stringify(readings)
    );

  }, [readings]);

  return (
    <ReadingContext.Provider
      value={{
        readings,
        setReadings
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
}