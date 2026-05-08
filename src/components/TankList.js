import { useContext }
from "react";

import { TankContext }
from "../contexts/TankContext";

import { BeerContext }
from "../contexts/BeerContext";

import { ReadingContext }
from "../contexts/ReadingContext";

export default function TankList() {

  const {
    tanks,
    setTanks
  } = useContext(TankContext);

  const { beerTypes } =
    useContext(BeerContext);

  const {
    readings,
    setReadings
  } = useContext(ReadingContext);

  const removeTank = (id) => {

    setTanks(
      tanks.filter(
        tank =>
          tank.id !== id
      )
    );

    setReadings(
      readings.filter(
        reading =>
          String(
            reading.tankId
          ) !== String(id)
      )
    );
  };

  const getBeerName = (
    beerId
  ) => {

    const beer =
      beerTypes.find(
        b =>
          String(b.id) ===
          String(beerId)
      );

    return beer
      ? beer.name
      : "Sem tipo";
  };

  return (
<div className="section-content">
      {tanks.map(tank => (

        <div
          key={tank.id}
          className="card"
        >

          <div>

            <strong>
              {tank.name}
            </strong>

            <p>
              {getBeerName(
                tank.beerTypeId
              )}
            </p>

          </div>

          <button
            onClick={() =>
              removeTank(
                tank.id
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