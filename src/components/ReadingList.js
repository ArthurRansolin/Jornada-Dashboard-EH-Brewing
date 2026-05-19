import {
  useContext
} from "react";

import { ReadingContext }
from "../contexts/ReadingContext";

import { TankContext }
from "../contexts/TankContext";

export default function ReadingList() {

  const {
    readings,
    removeReading
  } = useContext(ReadingContext);

  const { tanks } =
    useContext(TankContext);

  function getTankName(tankId) {

    const tank =
      tanks.find(
        tank =>
          Number(tank.id)
          ===
          Number(tankId)
      );

    return tank
      ? tank.name
      : "Tanque removido";
  }

  return (

    <div className="section-content">

      {
        readings.length === 0
        ? (
          <p className="reading-empty">
            Nenhuma leitura cadastrada.
          </p>
        )
        : (
          readings
            .slice()
            .reverse()
            .map(reading => (

              <div
                key={reading.id}
                className="reading-card"
              >

                <div>

                  <strong>
                    {reading.temperature}°C
                  </strong>

                  <p>

                    {
                      getTankName(
                        reading.tankId
                      )
                    }

                  </p>

                  <small>
                    {reading.date}
                  </small>

                </div>

                <button
                  className="delete-btn"
                  onClick={() =>
                    removeReading(
                      reading.id
                    )
                  }
                >
                  Excluir
                </button>

              </div>

            ))
        )
      }

    </div>
  );
}