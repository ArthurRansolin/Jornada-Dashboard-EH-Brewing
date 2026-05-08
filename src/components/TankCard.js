import { Link }
from "react-router-dom";

export default function TankCard({
  tank,
  beerName,
  lastReading
}) {

  return (
    <Link
      to={`/tanks/${tank.id}`}
      className="tank-link"
    >

      <div className="tank-wrapper">

        <div className="tank-top"></div>

        <div className="tank-body">

          <div className="tank-header">

            <h3>{tank.name}</h3>

            <span
              className={`status ${
                tank.status?.toLowerCase()
              }`}
            >
              {tank.status}
            </span>

          </div>

          <div className="tank-info">

            <p>
              Tipo:
              {" "}
              {beerName}
            </p>

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
              Temperatura Atual:
              {" "}
              {lastReading ?? "--"}°C
            </p>

          </div>

        </div>

        <div className="tank-bottom"></div>

      </div>

    </Link>
  );
}