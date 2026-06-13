import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function latestByTank(readings) {
  const map = new Map();
  readings.forEach((reading) => {
    if (reading.tank_id && !map.has(reading.tank_id)) {
      map.set(reading.tank_id, reading);
    }
  });
  return map;
}

function formatTemp(value) {
  return value === null || value === undefined ? "-" : `${Number(value).toFixed(1)} °C`;
}

export default function DashboardPage() {
  const api = useApi();
  const [selectedTankId, setSelectedTankId] = useState("");

  const latest = useMemo(() => latestByTank(api.readings), [api.readings]);
  const runningBatches = api.batches.filter((batch) => batch.status === "running");
  const selectedTank = api.tanks.find((tank) => String(tank.id) === String(selectedTankId)) || api.tanks[0];

  const selectedReadings = api.readings
    .filter((reading) => selectedTank && Number(reading.tank_id) === Number(selectedTank.id))
    .slice()
    .reverse()
    .slice(-80);

  const chartData = {
    labels: selectedReadings.map((reading) => new Date(reading.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })),
    datasets: [
      {
        label: "PV",
        data: selectedReadings.map((reading) => reading.pv),
        borderColor: "#007c89",
        backgroundColor: "#007c89",
        tension: 0.25,
      },
      {
        label: "SP",
        data: selectedReadings.map((reading) => reading.sp_written ?? reading.sp_active),
        borderColor: "#c4232f",
        backgroundColor: "#c4232f",
        tension: 0.25,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#1f2a2e" } } },
    scales: {
      x: { ticks: { color: "#6d6a63" }, grid: { color: "rgba(148, 163, 184, 0.18)" } },
      y: { ticks: { color: "#6d6a63" }, grid: { color: "rgba(148, 163, 184, 0.18)" } },
    },
  };

  return (
    <div className="dashboard-page">
      <section className="admin-hero">
        <div>
          <h1>Dashboard</h1>
          <p>Visão rápida de tanques, lotes ativos, leituras e controle de temperatura.</p>
        </div>
        <button onClick={api.refresh}>Atualizar</button>
      </section>

      <section className="dashboard-kpis">
        <article className="summary-card">
          <span>Tanques</span>
          <strong>{api.tanks.length}</strong>
        </article>
        <article className="summary-card">
          <span>Controladores ativos</span>
          <strong>{api.controllers.filter((controller) => controller.enabled).length}</strong>
        </article>
        <article className="summary-card">
          <span>Lotes rodando</span>
          <strong>{runningBatches.length}</strong>
        </article>
        <article className="summary-card">
          <span>Rampas</span>
          <strong>{api.profiles.length}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="section">
          <div className="section-title-row">
            <h2>Temperatura do Tanque</h2>
            <select value={selectedTank?.id || ""} onChange={(event) => setSelectedTankId(event.target.value)}>
              {api.tanks.map((tank) => (
                <option key={tank.id} value={tank.id}>{tank.name}</option>
              ))}
            </select>
          </div>
          <div className="chart-panel">
            {selectedReadings.length ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <p className="reading-empty">Sem leituras para plotar ainda.</p>
            )}
          </div>
        </div>

        <div className="section">
          <h2>Lotes Ativos</h2>
          <div className="active-list">
            {runningBatches.length === 0 ? (
              <p className="reading-empty">Nenhum lote ativo.</p>
            ) : (
              runningBatches.map((batch) => {
                const tank = api.tanks.find((item) => item.id === batch.tank_id);
                const profile = api.profiles.find((item) => item.id === batch.profile_id);
                return (
                  <Link className="ops-card link-card" key={batch.id} to={`/batches/${batch.id}`}>
                    <h3>{batch.recipe_name}</h3>
                    <p>{tank?.name || "Tanque removido"}</p>
                    <p>{profile?.name || "Sem rampa"}</p>
                    <span className="batch-status running">running</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Tanques</h2>
        <div className="ops-grid">
          {api.tanks.map((tank) => {
            const reading = latest.get(tank.id);
            const batch = runningBatches.find((item) => item.tank_id === tank.id);
            return (
              <Link className="ops-card link-card" key={tank.id} to={`/tanks/${tank.id}`}>
                <div>
                  <h3>{tank.name}</h3>
                  <p>{batch ? `Lote: ${batch.recipe_name}` : "Sem lote ativo"}</p>
                </div>
                <div className="metric-row">
                  <span>PV <strong>{formatTemp(reading?.pv)}</strong></span>
                  <span>SP <strong>{formatTemp(reading?.sp_written ?? reading?.sp_active ?? tank.ideal_temp_c)}</strong></span>
                  <span>MV <strong>{reading?.mv ?? "-"}</strong></span>
                  <span>RUN <strong>{reading?.run_state ?? "-"}</strong></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
