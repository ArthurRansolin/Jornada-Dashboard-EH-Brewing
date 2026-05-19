import {
  useContext
} from "react";

import {
  useParams
} from "react-router-dom";

import { TankContext }
from "../contexts/TankContext";

import { ReadingContext }
from "../contexts/ReadingContext";

import { BeerContext }
from "../contexts/BeerContext";

import TemperatureSchedule
from "../components/TemperatureSchedule";

export default function TankDetails() {

  const { id } = useParams();

  const { tanks } =
    useContext(TankContext);

  const { readings } =
    useContext(ReadingContext);

  const { beerTypes } =
    useContext(BeerContext);

  const tank =
    tanks.find(
      tank =>
        tank.id === Number(id)
    );

  if (!tank) {

    return (
      <div className="details-page">

        <div className="details-card">

          <h2>
            Tanque não encontrado
          </h2>

        </div>

      </div>
    );
  }

  const tankReadings =
  readings.filter(
    reading =>
      Number(reading.tankId)
      ===
      Number(tank.id)
  );
  const beer =
    beerTypes.find(
      beer =>
        beer.id === tank.beerTypeId
    );

  return (

    <div className="details-page">

      {/* HEADER */}

      <div className="details-header">

        <div>

          <h1>
            {tank.name}
          </h1>

          <p>
            {
              beer
                ? beer.name
                : "Sem tipo"
            }
          </p>

        </div>

        <span
          className={`status ${tank.status}`}
        >
          {tank.status}
        </span>

      </div>

      {/* GRID */}

      <div className="details-grid">

        {/* INFO */}

        <div className="details-card">

          <h2>
            Informações do Tanque
          </h2>

          <p>
            <strong>
              Capacidade:
            </strong>

            {" "}
            {tank.capacity}L
          </p>

          <p>
            <strong>
              Temperatura Ideal:
            </strong>

            {" "}
            {tank.idealTemp}°C
          </p>

          <p>
            <strong>
              Observações:
            </strong>

            {" "}
            {
              tank.notes ||
              "Nenhuma"
            }
          </p>

        </div>

        {/* READINGS */}

        <div className="details-card">

          <h2>
            Leituras
          </h2>

          {
            tankReadings.length === 0
            ? (
              <p>
                Nenhuma leitura registrada.
              </p>
            )
            : (
              tankReadings.map(reading => (

                <div
                  key={reading.id}
                  className="reading-card"
                >

                  <p>
                    <strong>
                      {reading.temperature}°C
                    </strong>
                  </p>

                  <small>
                    {
                      reading.date ||
                      "Sem data"
                    }
                  </small>

                </div>

              ))
            )
          }

        </div>

        {/* SCHEDULE */}

        <TemperatureSchedule
          tank={tank}
        />

      </div>

    </div>
  );
}