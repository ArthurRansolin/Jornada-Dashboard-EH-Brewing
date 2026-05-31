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

function formatHours(seconds) {
  return `${(seconds / 3600).toFixed(1)} h`;
}

function getRampState(profile, batch) {
  const segments = [...(profile?.segments || [])].sort((a, b) => a.segment_order - b.segment_order);
  if (!batch?.started_at || segments.length === 0) {
    return { segments, current: null, elapsed: 0, total: 0, progress: 0, currentIndex: -1 };
  }

  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(batch.started_at).getTime()) / 1000));
  const total = segments.reduce((sum, segment) => sum + segment.duration_seconds, 0);
  let accumulated = 0;
  let current = segments[segments.length - 1];
  let currentIndex = segments.length - 1;

  for (let index = 0; index < segments.length; index += 1) {
    accumulated += segments[index].duration_seconds;
    if (elapsed <= accumulated) {
      current = segments[index];
      currentIndex = index;
      break;
    }
  }

  return {
    segments,
    current,
    elapsed,
    total,
    currentIndex,
    progress: total ? Math.min(100, Math.round((elapsed / total) * 100)) : 0,
  };
}

export default function BatchDetails() {
  const { id } = useParams();
  const api = useApi();
  const batch = api.batches.find((item) => item.id === Number(id));

  if (!batch) {
    return (
      <div className="details-page">
        <div className="details-card">
          <h2>Lote não encontrado</h2>
          <Link to="/admin"><button>Voltar ao Admin</button></Link>
        </div>
      </div>
    );
  }

  const tank = api.tanks.find((item) => item.id === batch.tank_id);
  const beerType = api.beerTypes.find((item) => item.id === batch.beer_type_id);
  const profile = api.profiles.find((item) => item.id === batch.profile_id);
  const controller = api.controllers.find((item) => item.id === tank?.controller_id);
  const ramp = getRampState(profile, batch);

  const readings = api.readings
    .filter((reading) => Number(reading.tank_id) === Number(batch.tank_id))
    .filter((reading) => !batch.started_at || new Date(reading.ts) >= new Date(batch.started_at))
    .sort((a, b) => new Date(a.ts) - new Date(b.ts));

  const hourlyRows = readings.map((reading) => ({
    ...reading,
    elapsedHours: batch.started_at
      ? Math.round((new Date(reading.ts).getTime() - new Date(batch.started_at).getTime()) / 3600000)
      : null,
  }));

  const chartData = {
    labels: readings.map((reading) => new Date(reading.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })),
    datasets: [
      {
        label: "PV",
        data: readings.map((reading) => reading.pv),
        borderColor: "#007c89",
        backgroundColor: "#007c89",
        tension: 0.25,
      },
      {
        label: "SP",
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
        labels: { color: "#1f2a2e" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9fb0c0" },
        grid: { color: "rgba(148, 163, 184, 0.12)" },
      },
      y: {
        ticks: { color: "#9fb0c0" },
        grid: { color: "rgba(148, 163, 184, 0.12)" },
      },
    },
  };

  return (
    <div className="batch-page">
      <section className="admin-hero">
        <div>
          <h1>{batch.recipe_name}</h1>
          <p>{tank?.name || "Tanque removido"} · {beerType?.name || "sem tipo"} · {profile?.name || "sem rampa"}</p>
        </div>
        <span className={`batch-status ${batch.status}`}>{batch.status}</span>
      </section>

      <section className="batch-summary">
        <article className="summary-card">
          <span>Etapa atual</span>
          <strong>{ramp.current ? `${ramp.current.segment_order} · ${ramp.current.target_sp} °C` : "-"}</strong>
        </article>
        <article className="summary-card">
          <span>Progresso</span>
          <strong>{ramp.progress}%</strong>
        </article>
        <article className="summary-card">
          <span>Tempo decorrido</span>
          <strong>{formatHours(ramp.elapsed)}</strong>
        </article>
        <article className="summary-card">
          <span>Controlador</span>
          <strong>{controller ? `Slave ${controller.slave_id}` : "-"}</strong>
        </article>
      </section>

      <section className="section">
        <div className="section-title-row">
          <h2>PV x SP</h2>
          <button onClick={api.refresh}>Atualizar</button>
        </div>
        <div className="chart-panel">
          {readings.length ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="reading-empty">Ainda não há leituras para este lote.</p>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Rampa Programada</h2>
        <div className="timeline">
          {ramp.segments.map((segment, index) => (
            <article className={`timeline-step ${index === ramp.currentIndex ? "active" : ""}`} key={segment.id}>
              <span>Etapa {segment.segment_order}</span>
              <strong>{segment.target_sp} °C</strong>
              <p>{formatHours(segment.duration_seconds)}</p>
            </article>
          ))}
        </div>
        <div className="progress-bar">
          <span style={{ width: `${ramp.progress}%` }} />
        </div>
      </section>

      <section className="section">
        <h2>Histórico Hora a Hora</h2>
        {hourlyRows.length ? (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Horário</th>
                  <th>PV</th>
                  <th>SP</th>
                  <th>MV</th>
                  <th>Etapa</th>
                </tr>
              </thead>
              <tbody>
                {hourlyRows.map((reading) => (
                  <tr key={reading.id}>
                    <td>{reading.elapsedHours !== null ? `${reading.elapsedHours}h` : "-"}</td>
                    <td>{new Date(reading.ts).toLocaleString("pt-BR")}</td>
                    <td>{reading.pv ?? "-"} °C</td>
                    <td>{reading.sp_written ?? reading.sp_active ?? "-"} °C</td>
                    <td>{reading.mv ?? "-"}</td>
                    <td>{reading.segment_number ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="reading-empty">Ainda não há histórico registrado para este lote.</p>
        )}
      </section>

      <section className="details-grid">
        <div className="details-card">
          <h2>Dados do Lote</h2>
          <p><strong>Levedura:</strong> {batch.yeast || "-"}</p>
          <p><strong>OG:</strong> {batch.og || "-"}</p>
          <p><strong>FG alvo:</strong> {batch.fg_target || "-"}</p>
          <p><strong>Início:</strong> {batch.started_at ? new Date(batch.started_at).toLocaleString("pt-BR") : "-"}</p>
          <p><strong>Fim:</strong> {batch.ended_at ? new Date(batch.ended_at).toLocaleString("pt-BR") : "-"}</p>
        </div>

        <div className="details-card">
          <h2>Logs Recentes</h2>
          {api.logs.filter((log) => log.tank_id === batch.tank_id).slice(0, 8).map((log) => (
            <p key={log.id}>{log.command_type} · {log.value_sent} · {log.success ? "ok" : "falhou"}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
