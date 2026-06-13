import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";

export default function TankDetails() {
  const { id } = useParams();
  const api = useApi();
  const tank = api.tanks.find((item) => item.id === Number(id));

  const tankReadings = useMemo(
    () => api.readings.filter((reading) => Number(reading.tank_id) === Number(id)),
    [api.readings, id]
  );

  if (!tank) {
    return (
      <div className="details-page">
        <div className="details-card">
          <h2>Tanque não encontrado</h2>
          <Link to="/admin"><button>Voltar</button></Link>
        </div>
      </div>
    );
  }

  const controller = api.controllers.find((item) => item.id === tank.controller_id);
  const latest = tankReadings[0];

  return (
    <div className="details-page">
      <div className="details-header">
        <div>
          <h1>{tank.name}</h1>
          <p>{tank.location || "Sem localização"}</p>
        </div>
        <span className={`status ${tank.status}`}>{tank.status}</span>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <h2>Informações do Tanque</h2>
          <p><strong>Capacidade:</strong> {tank.capacity_l || "--"}L</p>
          <p><strong>Temperatura ideal:</strong> {tank.ideal_temp_c || "--"}°C</p>
          <p><strong>Controlador:</strong> {controller ? `${controller.name} / slave ${controller.slave_id}` : "não associado"}</p>
        </div>

        <div className="details-card">
          <h2>Leitura Atual</h2>
          {latest ? (
            <>
              <p><strong>PV:</strong> {latest.pv ?? "--"}°C</p>
              <p><strong>SP ativo:</strong> {latest.sp_active ?? "--"}°C</p>
              <p><strong>MV:</strong> {latest.mv ?? "--"}</p>
              <p><strong>Modo:</strong> {latest.control_mode ?? "--"}</p>
              <p><strong>RUN:</strong> {latest.run_state ?? "--"}</p>
            </>
          ) : (
            <p>Nenhuma leitura registrada ainda.</p>
          )}
        </div>

        <div className="details-card">
          <h2>Próximo passo</h2>
          <p>Cadastre uma rampa e associe ela a um tipo de cerveja. A próxima camada natural é iniciar um lote nesse tanque usando essa rampa.</p>
          <Link to="/admin"><button>Gerenciar rampas</button></Link>
        </div>
      </div>
    </div>
  );
}
