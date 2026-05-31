import { Link } from "react-router-dom";

export default function TankCard({ tank, beerName, lastReading, removeTank }) {
  return (
    <div className="tank-wrapper">
      <div className="tank-top"></div>
      <div className="tank-body">
        <div className="tank-header">
          <h3>{tank.name}</h3>
          <span className={`status ${tank.status}`}>{tank.status}</span>
        </div>

        <div className="tank-info">
          <p><strong>Tipo:</strong> {beerName}</p>
          <p><strong>Capacidade:</strong> {tank.capacity_l || "--"}L</p>
          <p><strong>Temperatura ideal:</strong> {tank.ideal_temp_c || "--"}°C</p>
          <p><strong>Temperatura atual:</strong> {lastReading ? `${lastReading.pv ?? "--"}°C` : "--°C"}</p>
        </div>

        <div className="tank-card-actions">
          <Link to={`/tanks/${tank.id}`}>
            <button>Abrir</button>
          </Link>

          {removeTank && (
            <button className="delete-btn" onClick={() => removeTank(tank.id)}>
              Excluir
            </button>
          )}
        </div>
      </div>
      <div className="tank-bottom"></div>
    </div>
  );
}
