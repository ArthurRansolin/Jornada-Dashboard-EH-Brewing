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

      const saved =
        localStorage.getItem(
          "readings"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  /* ====================================== */

  useEffect(() => {

    localStorage.setItem(
      "readings",
      JSON.stringify(readings)
    );

  }, [readings]);

  /* ====================================== */
  /* ADD */
  /* ====================================== */

  function addReading(reading) {

    const newReading = {

      id: Date.now(),

      tankId:
        Number(reading.tankId),

      temperature:
        Number(reading.temperature),

      date:
        new Date()
          .toLocaleString(),

      createdAt:
        new Date()
          .toISOString()
    };

    setReadings(prev => [
      ...prev,
      newReading
    ]);
  }

  /* ====================================== */
  /* REMOVE */
  /* ====================================== */

  function removeReading(id) {

    setReadings(prev =>
      prev.filter(
        reading =>
          reading.id !== id
      )
    );
  }

  return (

    <ReadingContext.Provider
      value={{

        readings,

        addReading,
        removeReading
      }}
    >

      {children}

    </ReadingContext.Provider>
  );
}