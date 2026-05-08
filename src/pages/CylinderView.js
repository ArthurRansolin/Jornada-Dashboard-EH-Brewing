import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function CylinderView() {
  const { cylinders, readings, beerTypes } =
    useContext(AppContext);

  const getBeerName = (id) => {
    const beer = beerTypes.find(
      b => b.id === id
    );

    return beer ? beer.name : "Sem tipo";
  };

  const getLastReading = (cylinderId) => {
    const filtered = readings.filter(
      r => r.cylinderId == cylinderId
    );

    if (!filtered.length) return "--";

    return filtered[filtered.length - 1].temp;
  };

  return (
    <div className="tank-grid">

      {cylinders.map(c => (
        <div key={c.id} className="tank-wrapper">

          {/* topo */}
          <div className="tank-top"></div>

          {/* corpo */}
          <div className="tank-body">

            <div className="tank-header">
              <h3>{c.name}</h3>

              <span className={`status ${c.status?.toLowerCase()}`}>
                {c.status}
              </span>
            </div>

            <div className="tank-info">
              <p>{getBeerName(c.beerTypeId)}</p>

              <p>
                Capacidade: {c.capacity || "--"}L
              </p>

              <p>
                Temp. Ideal: {c.targetTemp || "--"}°C
              </p>

              <p>
                Temp. Atual: {getLastReading(c.id)}°C
              </p>
            </div>

          </div>

          {/* base */}
          <div className="tank-bottom"></div>

        </div>
      ))}

    </div>
  );
}