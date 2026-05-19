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

      const saved =
        localStorage.getItem(
          "tanks"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  /* ====================================== */
  /* SAVE LOCAL STORAGE */
  /* ====================================== */

  useEffect(() => {

    localStorage.setItem(
      "tanks",
      JSON.stringify(tanks)
    );

  }, [tanks]);

  /* ====================================== */
  /* ADD */
  /* ====================================== */

  function addTank(tank) {

    const newTank = {

      id: Date.now(),

      name: tank.name,

      beerTypeId:
        Number(tank.beerTypeId),

      capacity:
        Number(tank.capacity),

      idealTemp:
        Number(tank.idealTemp),

      status:
        tank.status ||
        "fermentando",

      notes:
        tank.notes || "",

      temperatureSchedule: []
    };

    setTanks(prev => [
      ...prev,
      newTank
    ]);
  }

  /* ====================================== */
  /* REMOVE */
  /* ====================================== */

  function removeTank(id) {

    setTanks(prev =>
      prev.filter(
        tank =>
          tank.id !== id
      )
    );
  }

  /* ====================================== */
  /* UPDATE */
  /* ====================================== */

  function updateTank(
    id,
    updatedData
  ) {

    setTanks(prev =>
      prev.map(tank => {

        if (tank.id !== id)
          return tank;

        return {
          ...tank,
          ...updatedData
        };
      })
    );
  }

  /* ====================================== */
  /* SCHEDULE */
  /* ====================================== */

  function addTemperatureSchedule(
    tankId,
    schedule
  ) {

    setTanks(prev =>
      prev.map(tank => {

        if (
          tank.id !== tankId
        ) return tank;

        return {

          ...tank,

          temperatureSchedule: [

            ...(tank.temperatureSchedule || []),

            {
              id: Date.now(),
              ...schedule
            }
          ]
        };
      })
    );
  }

  function removeTemperatureSchedule(
    tankId,
    scheduleId
  ) {

    setTanks(prev =>
      prev.map(tank => {

        if (
          tank.id !== tankId
        ) return tank;

        return {

          ...tank,

          temperatureSchedule:
            tank.temperatureSchedule.filter(
              item =>
                item.id !== scheduleId
            )
        };
      })
    );
  }

  return (

    <TankContext.Provider
      value={{

        tanks,

        addTank,
        removeTank,
        updateTank,

        addTemperatureSchedule,
        removeTemperatureSchedule
      }}
    >

      {children}

    </TankContext.Provider>
  );
}