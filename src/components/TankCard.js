import { Link }
from "react-router-dom";

export default function TankCard({
  tank,
  beerName,
  lastReading,
  removeTank
}) {

  return (

    <div className="tank-wrapper">

      {/* TOP */}

      <div className="tank-top"></div>

      {/* BODY */}

      <div className="tank-body">

        {/* HEADER */}

        <div className="tank-header">

          <h3>
            {tank.name}
          </h3>

          <span
            className={`status ${tank.status}`}
          >
            {tank.status}
          </span>

        </div>

        {/* CONTENT */}

        <div className="tank-info">

          <p>
            <strong>Tipo:</strong>{" "}
            {beerName}
          </p>

          <p>
            <strong>Capacidade:</strong>{" "}
            {tank.capacity || "--"}L
          </p>

          <p>
            <strong>Temperatura Ideal:</strong>{" "}
            {tank.idealTemp || "--"}°C
          </p>

          <p>
            <strong>Temperatura Atual:</strong>{" "}
            {
              lastReading
                ? `${lastReading.temperature}°C`
                : "--°C"
            }
          </p>

        </div>

        {/* ACTIONS */}

        <div className="tank-card-actions">

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

      {/* BOTTOM */}

      <div className="tank-bottom"></div>

    </div>
  );
}