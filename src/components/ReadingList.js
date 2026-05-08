import { useContext }
  from "react";

import { ReadingContext }
  from "../contexts/ReadingContext";

import { TankContext }
  from "../contexts/TankContext";

export default function ReadingList() {

  const {
    readings,
    setReadings
  } = useContext(ReadingContext);

  const { tanks } =
    useContext(TankContext);

  const removeReading = (id) => {

    setReadings(
      readings.filter(
        reading =>
          reading.id !== id
      )
    );
  };

  const getTankName = (
    tankId
  ) => {

    const tank = tanks.find(
      t =>
        String(t.id) ===
        String(tankId)
    );

    return tank
      ? tank.name
      : "Tanque";
  };

  return (
    <div className="section-content">
      {readings.map(reading => (

        <div
          key={reading.id}
          className="card"
        >

          <span>

            {reading.temp}°C
            {" - "}
            {getTankName(
              reading.tankId
            )}

          </span>

          <button
            onClick={() =>
              removeReading(
                reading.id
              )
            }
          >
            Excluir
          </button>

        </div>

      ))}

    </div>
  );
}