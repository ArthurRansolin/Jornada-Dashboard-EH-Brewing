import { useContext } from "react";

import { Link } from "react-router-dom";

import { TankContext } from "../contexts/TankContext";
import { BeerContext } from "../contexts/BeerContext";

export default function TankList() {

  const {
    tanks,
    removeTank
  } = useContext(TankContext);

  const {
    beerTypes
  } = useContext(BeerContext);

  function getBeerName(beerTypeId) {

    const beer = beerTypes.find(
      beer =>
        Number(beer.id)
        ===
        Number(beerTypeId)
    );

    return beer
      ? beer.name
      : "Sem tipo";
  }

  return (

    <div className="list-container">

      {
        tanks.length === 0
        ? (
          <p className="reading-empty">
            Nenhum tanque cadastrado.
          </p>
        )
        : (
          tanks.map(tank => (

            <div
              key={tank.id}
              className="list-card"
            >

              <div className="list-info">

                <h3>
                  {tank.name}
                </h3>

                <p>
                  Tipo:
                  {" "}
                  {getBeerName(
                    tank.beerTypeId
                  )}
                </p>

                <p>
                  Capacidade:
                  {" "}
                  {tank.capacity}L
                </p>

                <p>
                  Temp. Ideal:
                  {" "}
                  {tank.idealTemp}°C
                </p>

              </div>

              <div className="list-actions">

                <Link
                  to={`/tanks/${tank.id}`}
                >
                  <button>
                    Abrir
                  </button>
                </Link>

                <button
                  className="delete-btn"
                  onClick={() =>
                    removeTank(tank.id)
                  }
                >
                  Excluir
                </button>

              </div>

            </div>

          ))
        )
      }

    </div>
  );
}