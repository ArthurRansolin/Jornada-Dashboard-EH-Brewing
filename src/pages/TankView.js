import { useContext }
from "react";

import { TankContext }
from "../contexts/TankContext";

import { ReadingContext }
from "../contexts/ReadingContext";

import { BeerContext }
from "../contexts/BeerContext";

import TankCard
from "../components/TankCard";

export default function TankView() {

  const { tanks } =
    useContext(TankContext);

  const { readings } =
    useContext(ReadingContext);

  const { beerTypes } =
    useContext(BeerContext);

  const getBeerName = (id) => {

    const beer =
      beerTypes.find(
        b =>
          String(b.id) ===
          String(id)
      );

    return beer
      ? beer.name
      : "Sem tipo";
  };

  const getLastReading = (
    tankId
  ) => {

    const filtered =
      readings.filter(
        r =>
          String(r.tankId) ===
          String(tankId)
      );

    if (!filtered.length)
      return null;

    return filtered[
      filtered.length - 1
    ].temp;
  };

  return (
    <div className="tank-grid">

      {tanks.map(tank => (

        <TankCard
          key={tank.id}
          tank={tank}
          beerName={getBeerName(
            tank.beerTypeId
          )}
          lastReading={getLastReading(
            tank.id
          )}
        />

      ))}

    </div>
  );
}