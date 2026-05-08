import { useContext }
from "react";

import { useParams }
from "react-router-dom";

import { TankContext }
from "../contexts/TankContext";

import { ReadingContext }
from "../contexts/ReadingContext";

import { BeerContext }
from "../contexts/BeerContext";

export default function TankDetails() {

  const { id } =
    useParams();

  const { tanks } =
    useContext(TankContext);

  const { readings } =
    useContext(ReadingContext);

  const { beerTypes } =
    useContext(BeerContext);

  const tank =
    tanks.find(
      t =>
        String(t.id) ===
        String(id)
    );

  if (!tank) {

    return (
      <div className="section">

        <h2>
          Tanque não encontrado
        </h2>

      </div>
    );
  }

  const beer =
    beerTypes.find(
      b =>
        String(b.id) ===
        String(tank.beerTypeId)
    );

  const tankReadings =
    readings.filter(
      r =>
        String(r.tankId) ===
        String(tank.id)
    );

  return (
    <div className="details-page">

      <div className="details-header">

        <div>

          <h1>{tank.name}</h1>

          <p>
            {beer?.name ||
              "Sem tipo"}
          </p>

        </div>

        <span
          className={`status ${
            tank.status?.toLowerCase()
          }`}
        >
          {tank.status}
        </span>

      </div>

      <div className="details-grid">

        <div className="details-card">

          <h2>
            Informações do Tanque
          </h2>

          <p>
            Capacidade:
            {" "}
            {tank.capacity || "--"}L
          </p>

          <p>
            Temperatura Ideal:
            {" "}
            {tank.targetTemp || "--"}°C
          </p>

          <p>
            Observações:
            {" "}
            {tank.notes ||
              "Nenhuma"}
          </p>

        </div>

        <div className="details-card">

          <h2>Leituras</h2>

          {!tankReadings.length && (
            <p>
              Nenhuma leitura registrada.
            </p>
          )}

          {tankReadings.map(
            reading => (

            <div
              key={reading.id}
              className="reading-card"
            >

              <div>
                {reading.temp}°C
              </div>

              <small>
                {new Date(
                  reading.date
                ).toLocaleString()}
              </small>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}