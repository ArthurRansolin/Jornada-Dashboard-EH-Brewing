import { useMemo } from "react";
import TankCard from "../components/TankCard";
import { useApi } from "../contexts/ApiContext";

export default function TankView() {
  const api = useApi();

  const latestByTank = useMemo(() => {
    const map = new Map();
    api.readings.forEach((reading) => {
      if (reading.tank_id && !map.has(reading.tank_id)) {
        map.set(reading.tank_id, reading);
      }
    });
    return map;
  }, [api.readings]);

  if (api.tanks.length === 0) {
    return (
      <div className="details-card">
        <h2>Nenhum tanque cadastrado</h2>
        <p>Cadastre tanques e controladores no Admin para acompanhar a operação.</p>
      </div>
    );
  }

  return (
    <div className="tank-grid">
      {api.tanks.map((tank) => (
        <TankCard
          key={tank.id}
          tank={tank}
          beerName="Definido no lote"
          lastReading={latestByTank.get(tank.id)}
          removeTank={api.deleteTank}
        />
      ))}
    </div>
  );
}
