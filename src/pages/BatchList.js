import { Link } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";

export default function BatchList() {
  const api = useApi();

  return (
    <div className="batch-page">
      <section className="admin-hero">
        <div>
          <h1>Lotes</h1>
          <p>Acompanhe lotes em andamento e histórico de fermentações.</p>
        </div>
        <Link to="/admin"><button>Novo lote</button></Link>
      </section>

      <section className="section">
        <h2>Lotes Cadastrados</h2>
        <div className="profile-list">
          {api.batches.length === 0 ? (
            <p className="reading-empty">Nenhum lote cadastrado ainda.</p>
          ) : (
            api.batches.map((batch) => {
              const tank = api.tanks.find((item) => item.id === batch.tank_id);
              const profile = api.profiles.find((item) => item.id === batch.profile_id);
              return (
                <Link className="profile-card link-card" key={batch.id} to={`/batches/${batch.id}`}>
                  <h3>{batch.recipe_name}</h3>
                  <p>{tank?.name || "Tanque removido"} · {profile?.name || "Sem rampa"}</p>
                  <span className={`batch-status ${batch.status}`}>{batch.status}</span>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
