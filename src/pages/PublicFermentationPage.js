import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Link, useParams } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "-";
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString("pt-BR") : "-";
}

function formatDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return "-";
  const hours = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 3600000);
  if (hours < 48) return `${hours} horas`;
  return `${(hours / 24).toFixed(1)} dias`;
}

export default function PublicFermentationPage() {
  const { id } = useParams();
  const api = useApi();
  const batch = api.batches.find((item) => item.id === Number(id));

  if (!batch) {
    return (
      <main className="public-fermentation-page">
        <section className="public-hero">
          <p className="public-eyebrow">EH Brewing</p>
          <h1>Fermentação não encontrada</h1>
          <Link to="/dashboard"><button>Voltar</button></Link>
        </section>
      </main>
    );
  }

  const tank = api.tanks.find((item) => item.id === batch.tank_id);
  const beerType = api.beerTypes.find((item) => item.id === batch.beer_type_id);
  const profile = api.profiles.find((item) => item.id === batch.profile_id);
  const readings = api.readings
    .filter((reading) => Number(reading.tank_id) === Number(batch.tank_id))
    .filter((reading) => !batch.started_at || new Date(reading.ts) >= new Date(batch.started_at))
    .filter((reading) => !batch.ended_at || new Date(reading.ts) <= new Date(batch.ended_at))
    .sort((a, b) => new Date(a.ts) - new Date(b.ts));

  const minPv = readings.length ? Math.min(...readings.map((reading) => reading.pv ?? 0)) : null;
  const maxPv = readings.length ? Math.max(...readings.map((reading) => reading.pv ?? 0)) : null;

  const chartData = {
    labels: readings.map((reading) => new Date(reading.ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })),
    datasets: [
      {
        label: "Temperatura real",
        data: readings.map((reading) => reading.pv),
        borderColor: "#007c89",
        backgroundColor: "#007c89",
        tension: 0.25,
      },
      {
        label: "Setpoint",
        data: readings.map((reading) => reading.sp_written ?? reading.sp_active),
        borderColor: "#c4232f",
        backgroundColor: "#c4232f",
        tension: 0.25,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#f8f5ee" },
      },
    },
    scales: {
      x: { ticks: { color: "#d8d2c8" }, grid: { color: "rgba(255,255,255,0.08)" } },
      y: { ticks: { color: "#d8d2c8" }, grid: { color: "rgba(255,255,255,0.08)" } },
    },
  };

  return (
    <main className="public-fermentation-page">
      <section className="public-hero">
        <p className="public-eyebrow">EH Brewing Co. · Fermentação finalizada</p>
        <h1>{batch.recipe_name}</h1>
        <p>
          {beerType?.name || "Cerveja artesanal"} fermentada em {tank?.name || "tanque EH"} usando a rampa
          {" "}{profile?.name || "definida pela cervejaria"}.
        </p>
        <div className="public-badges">
          <span>{batch.status}</span>
          <span>{formatDuration(batch.started_at, batch.ended_at)}</span>
          <span>{readings.length} registros</span>
        </div>
      </section>

      <section className="public-stats">
        <article>
          <span>Início</span>
          <strong>{formatDate(batch.started_at)}</strong>
        </article>
        <article>
          <span>Fim</span>
          <strong>{formatDate(batch.ended_at)}</strong>
        </article>
        <article>
          <span>Faixa real</span>
          <strong>{minPv !== null ? `${minPv.toFixed(1)} - ${maxPv.toFixed(1)} °C` : "-"}</strong>
        </article>
        <article>
          <span>Levedura</span>
          <strong>{batch.yeast || "-"}</strong>
        </article>
      </section>

      <section className="public-panel">
        <div className="section-title-row">
          <h2>Temperatura da Fermentação</h2>
          <p>PV real acompanhando o setpoint programado.</p>
        </div>
        <div className="public-chart">
          {readings.length ? <Line data={chartData} options={chartOptions} /> : <p>Sem leituras registradas.</p>}
        </div>
      </section>

      <section className="public-panel">
        <h2>Rampa Programada</h2>
        <div className="public-timeline">
          {[...(profile?.segments || [])].sort((a, b) => a.segment_order - b.segment_order).map((segment) => (
            <article key={segment.id}>
              <span>Etapa {segment.segment_order}</span>
              <strong>{segment.target_sp} °C</strong>
              <p>{(segment.duration_seconds / 3600).toFixed(1)} h</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-panel">
        <h2>Histórico hora a hora</h2>
        <div className="history-table-wrap public-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Horário</th>
                <th>PV</th>
                <th>SP</th>
                <th>Etapa</th>
              </tr>
            </thead>
            <tbody>
              {readings.slice(0, 120).map((reading) => (
                <tr key={reading.id}>
                  <td>{formatDateTime(reading.ts)}</td>
                  <td>{reading.pv ?? "-"} °C</td>
                  <td>{reading.sp_written ?? reading.sp_active ?? "-"} °C</td>
                  <td>{reading.segment_number ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="public-footer">
        <strong>EH Brewing</strong>
        <span>Desde 2021 · fermentação acompanhada com Jornada Dashboard</span>
      </footer>
    </main>
  );
}
