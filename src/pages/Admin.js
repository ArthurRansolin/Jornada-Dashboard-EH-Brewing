import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";

const emptyController = {
  name: "",
  slave_id: "1",
  serial_port: "",
  baud_rate: "9600",
  enabled: true,
};

const emptyTank = {
  name: "",
  capacity_l: "",
  location: "",
  ideal_temp_c: "",
  controller_id: "",
  status: "idle",
};

const emptyBeerType = {
  name: "",
  description: "",
  ideal_temp_min: "",
  ideal_temp_max: "",
  default_profile_id: "",
};

const defaultProfileSegments = [
  { target_sp: "18", duration_hours: "72" },
  { target_sp: "20", duration_hours: "24" },
  { target_sp: "2", duration_hours: "48" },
];

const emptyProfile = {
  name: "",
  description: "",
  segments: defaultProfileSegments,
};

const emptyBatch = {
  tank_id: "",
  beer_type_id: "",
  profile_id: "",
  recipe_name: "",
  yeast: "",
  og: "",
  fg_target: "",
};

function numberOrNull(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}

function hoursToSeconds(value) {
  return Math.max(1, Math.round(Number(value || 0) * 3600));
}

function profileLabel(profile) {
  const count = profile.segments?.length || 0;
  return `${profile.name}${count ? ` (${count} etapas)` : ""}`;
}

export default function Admin() {
  const api = useApi();
  const [controller, setController] = useState(emptyController);
  const [tank, setTank] = useState(emptyTank);
  const [beerType, setBeerType] = useState(emptyBeerType);
  const [profile, setProfile] = useState(emptyProfile);
  const [batch, setBatch] = useState(emptyBatch);
  const [message, setMessage] = useState("");

  const nextSlaveId = useMemo(() => {
    const used = new Set(api.controllers.map((item) => Number(item.slave_id)));
    let next = 1;
    while (used.has(next)) {
      next += 1;
    }
    return String(next);
  }, [api.controllers]);

  const usedControllerIds = useMemo(
    () => new Set(api.tanks.map((item) => item.controller_id).filter(Boolean)),
    [api.tanks]
  );

  useEffect(() => {
    const currentSlaveId = Number(controller.slave_id);
    const currentIsUsed = api.controllers.some((item) => Number(item.slave_id) === currentSlaveId);
    if (!controller.name && (!controller.slave_id || currentIsUsed)) {
      setController((current) => ({ ...current, slave_id: nextSlaveId }));
    }
  }, [api.controllers, controller.name, controller.slave_id, nextSlaveId]);

  const latestByTank = useMemo(() => {
    const map = new Map();
    api.readings.forEach((reading) => {
      if (reading.tank_id && !map.has(reading.tank_id)) {
        map.set(reading.tank_id, reading);
      }
    });
    return map;
  }, [api.readings]);

  async function submit(action, successMessage) {
    setMessage("Salvando...");
    try {
      await action();
      setMessage(successMessage);
    } catch (error) {
      setMessage(error.message || "Erro ao salvar");
    }
  }

  const runningByTank = useMemo(() => {
    const map = new Map();
    api.batches
      .filter((item) => item.status === "running")
      .forEach((item) => map.set(item.tank_id, item));
    return map;
  }, [api.batches]);

  function createController(event) {
    event.preventDefault();
    submit(async () => {
      await api.createController({
        name: controller.name,
        slave_id: Number(controller.slave_id),
        serial_port: controller.serial_port || null,
        baud_rate: Number(controller.baud_rate || 9600),
        parity: "N",
        data_bits: 8,
        stop_bits: 1,
        enabled: controller.enabled,
      });
      setController({ ...emptyController, slave_id: nextSlaveId });
    }, "Controlador cadastrado.");
  }

  function createTank(event) {
    event.preventDefault();
    submit(async () => {
      await api.createTank({
        name: tank.name,
        capacity_l: numberOrNull(tank.capacity_l),
        location: tank.location || null,
        status: tank.status,
        ideal_temp_c: numberOrNull(tank.ideal_temp_c),
        controller_id: numberOrNull(tank.controller_id),
      });
      setTank(emptyTank);
    }, "Tanque cadastrado.");
  }

  function createBeerType(event) {
    event.preventDefault();
    submit(async () => {
      await api.createBeerType({
        name: beerType.name,
        description: beerType.description || null,
        ideal_temp_min: numberOrNull(beerType.ideal_temp_min),
        ideal_temp_max: numberOrNull(beerType.ideal_temp_max),
        default_profile_id: numberOrNull(beerType.default_profile_id),
      });
      setBeerType(emptyBeerType);
    }, "Tipo de cerveja cadastrado.");
  }

  function createProfile(event) {
    event.preventDefault();
    const segments = profile.segments
      .map((segment, index) => ({
        segment_order: index + 1,
        target_sp: Number(segment.target_sp),
        duration_seconds: hoursToSeconds(segment.duration_hours),
      }))
      .filter((segment) => Number.isFinite(segment.target_sp) && segment.duration_seconds > 0);

    submit(async () => {
      await api.createProfile({
        name: profile.name,
        description: profile.description || null,
        mode: "server_managed",
        time_base: "HH:MM",
        segments,
      });
      setProfile({ ...emptyProfile, segments: defaultProfileSegments.map((segment) => ({ ...segment })) });
    }, "Rampa cadastrada.");
  }

  function updateProfileSegment(index, field, value) {
    const nextSegments = profile.segments.map((segment, segmentIndex) =>
      segmentIndex === index ? { ...segment, [field]: value } : segment
    );
    const last = nextSegments[nextSegments.length - 1];
    const shouldAddStep = last.target_sp !== "" && last.duration_hours !== "";

    setProfile({
      ...profile,
      segments: shouldAddStep
        ? [...nextSegments, { target_sp: "", duration_hours: "" }]
        : nextSegments,
    });
  }

  function removeProfileSegment(index) {
    if (profile.segments.length <= 1) {
      return;
    }
    setProfile({
      ...profile,
      segments: profile.segments.filter((_, segmentIndex) => segmentIndex !== index),
    });
  }

  function startBatch(event) {
    event.preventDefault();
    submit(async () => {
      await api.startBatch({
        tank_id: Number(batch.tank_id),
        beer_type_id: numberOrNull(batch.beer_type_id),
        profile_id: Number(batch.profile_id),
        recipe_name: batch.recipe_name,
        yeast: batch.yeast || null,
        og: numberOrNull(batch.og),
        fg_target: numberOrNull(batch.fg_target),
      });
      setBatch(emptyBatch);
    }, "Lote iniciado. A rampa serÃ¡ aplicada pelo polling.");
  }

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <h1>Controle de FermentaÃ§Ã£o</h1>
          <p>Cadastre controladores, tanques, estilos e rampas antes de iniciar um lote.</p>
        </div>
        <div className="system-status">
          <span className={api.error ? "status-dot danger" : "status-dot"} />
          {api.loading ? "Carregando..." : api.error || "API conectada"}
        </div>
      </section>

      {message && <p className="notice">{message}</p>}

      <div className="admin-grid">
        <section className="section">
          <h2>Nova Rampa</h2>
          <form onSubmit={createProfile}>
            <input required placeholder="Nome da rampa. Ex: Ale padrÃ£o" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <textarea placeholder="DescriÃ§Ã£o do objetivo da rampa" value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} />
            <div className="ramp-grid">              {profile.segments.map((segment, index) => (
                <div className="ramp-step" key={index}>
                  <div className="ramp-step-header">
                    <strong>Etapa {index + 1}</strong>
                    {profile.segments.length > 1 && index >= 3 && (
                      <button type="button" className="ghost-btn" onClick={() => removeProfileSegment(index)}>
                        Remover
                      </button>
                    )}
                  </div>
                  <input type="number" step="0.1" placeholder="SP °C" value={segment.target_sp} onChange={(e) => updateProfileSegment(index, "target_sp", e.target.value)} />
                  <input type="number" step="0.5" placeholder="Duração h" value={segment.duration_hours} onChange={(e) => updateProfileSegment(index, "duration_hours", e.target.value)} />
                </div>
              ))}
            </div>
            <button type="submit">Salvar rampa</button>
          </form>
        </section>

        <section className="section">
          <h2>Tipo de Cerveja</h2>
          <form onSubmit={createBeerType}>
            <input required placeholder="Nome. Ex: IPA, Lager, Weiss" value={beerType.name} onChange={(e) => setBeerType({ ...beerType, name: e.target.value })} />
            <textarea placeholder="DescriÃ§Ã£o ou observaÃ§Ãµes" value={beerType.description} onChange={(e) => setBeerType({ ...beerType, description: e.target.value })} />
            <div className="grid2">
              <input type="number" step="0.1" placeholder="Temp. mÃ­nima Â°C" value={beerType.ideal_temp_min} onChange={(e) => setBeerType({ ...beerType, ideal_temp_min: e.target.value })} />
              <input type="number" step="0.1" placeholder="Temp. mÃ¡xima Â°C" value={beerType.ideal_temp_max} onChange={(e) => setBeerType({ ...beerType, ideal_temp_max: e.target.value })} />
            </div>
            <select value={beerType.default_profile_id} onChange={(e) => setBeerType({ ...beerType, default_profile_id: e.target.value })}>
              <option value="">Rampa padrÃ£o</option>
              {api.profiles.map((item) => (
                <option key={item.id} value={item.id}>{profileLabel(item)}</option>
              ))}
            </select>
            <button type="submit">Salvar tipo</button>
          </form>
        </section>

        <section className="section">
          <h2>Controlador N1050</h2>
          <form onSubmit={createController}>
            <input required placeholder="Nome do controlador" value={controller.name} onChange={(e) => setController({ ...controller, name: e.target.value })} />
            <div className="grid2">
              <input required type="number" placeholder="Slave ID" value={controller.slave_id} onChange={(e) => setController({ ...controller, slave_id: e.target.value })} />
              <input type="number" placeholder="Baud rate" value={controller.baud_rate} onChange={(e) => setController({ ...controller, baud_rate: e.target.value })} />
            </div>
            <input placeholder="Porta serial ou deixe vazio para config global" value={controller.serial_port} onChange={(e) => setController({ ...controller, serial_port: e.target.value })} />
            <label className="inline-check">
              <input type="checkbox" checked={controller.enabled} onChange={(e) => setController({ ...controller, enabled: e.target.checked })} />
              Ativo no polling
            </label>
            <button type="submit">Salvar controlador</button>
          </form>
        </section>

        <section className="section">
          <h2>Tanque</h2>
          <form onSubmit={createTank}>
            <input required placeholder="Nome do tanque" value={tank.name} onChange={(e) => setTank({ ...tank, name: e.target.value })} />
            <div className="grid2">
              <input type="number" step="0.1" placeholder="Capacidade L" value={tank.capacity_l} onChange={(e) => setTank({ ...tank, capacity_l: e.target.value })} />
              <input type="number" step="0.1" placeholder="Temp. ideal Â°C" value={tank.ideal_temp_c} onChange={(e) => setTank({ ...tank, ideal_temp_c: e.target.value })} />
            </div>
            <input placeholder="LocalizaÃ§Ã£o" value={tank.location} onChange={(e) => setTank({ ...tank, location: e.target.value })} />
            <select value={tank.controller_id} onChange={(e) => setTank({ ...tank, controller_id: e.target.value })}>
              <option value="">Sem controlador</option>
              {api.controllers.map((item) => (
                <option key={item.id} value={item.id} disabled={usedControllerIds.has(item.id)}>
                  {item.name} - slave {item.slave_id}{usedControllerIds.has(item.id) ? " - já vinculado" : ""}
                </option>
              ))}
            </select>
            <button type="submit">Salvar tanque</button>
          </form>
        </section>

        <section className="section">
          <h2>Iniciar Lote</h2>
          <form onSubmit={startBatch}>
            <input required placeholder="Nome da receita ou lote" value={batch.recipe_name} onChange={(e) => setBatch({ ...batch, recipe_name: e.target.value })} />
            <select required value={batch.tank_id} onChange={(e) => setBatch({ ...batch, tank_id: e.target.value })}>
              <option value="">Tanque</option>
              {api.tanks.map((item) => (
                <option key={item.id} value={item.id} disabled={runningByTank.has(item.id)}>
                  {item.name}{runningByTank.has(item.id) ? " - jÃ¡ tem lote ativo" : ""}
                </option>
              ))}
            </select>
            <select value={batch.beer_type_id} onChange={(e) => {
              const selected = api.beerTypes.find((item) => String(item.id) === e.target.value);
              setBatch({
                ...batch,
                beer_type_id: e.target.value,
                profile_id: selected?.default_profile_id ? String(selected.default_profile_id) : batch.profile_id,
              });
            }}>
              <option value="">Tipo de cerveja</option>
              {api.beerTypes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select required value={batch.profile_id} onChange={(e) => setBatch({ ...batch, profile_id: e.target.value })}>
              <option value="">Rampa</option>
              {api.profiles.map((item) => (
                <option key={item.id} value={item.id}>{profileLabel(item)}</option>
              ))}
            </select>
            <div className="grid2">
              <input placeholder="Levedura" value={batch.yeast} onChange={(e) => setBatch({ ...batch, yeast: e.target.value })} />
              <input type="number" step="0.001" placeholder="OG" value={batch.og} onChange={(e) => setBatch({ ...batch, og: e.target.value })} />
            </div>
            <input type="number" step="0.001" placeholder="FG alvo" value={batch.fg_target} onChange={(e) => setBatch({ ...batch, fg_target: e.target.value })} />
            <button type="submit">Iniciar lote</button>
          </form>
        </section>
      </div>

      <section className="section">
        <h2>OperaÃ§Ã£o Atual</h2>
        <div className="ops-grid">
          {api.tanks.length === 0 ? (
            <p className="reading-empty">Nenhum tanque cadastrado ainda.</p>
          ) : (
            api.tanks.map((item) => {
              const latest = latestByTank.get(item.id);
              const controllerInfo = api.controllers.find((ctrl) => ctrl.id === item.controller_id);
              const runningBatch = runningByTank.get(item.id);
              const runningProfile = api.profiles.find((profileItem) => profileItem.id === runningBatch?.profile_id);
              return (
                <article className="ops-card" key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.capacity_l || "-"} L Â· {item.location || "sem localizaÃ§Ã£o"}</p>
                    <p>Controlador: {controllerInfo ? `${controllerInfo.name} / slave ${controllerInfo.slave_id}` : "nÃ£o associado"}</p>
                    <p>
                      Lote:{" "}
                      {runningBatch ? (
                        <Link to={`/batches/${runningBatch.id}`}>{runningBatch.recipe_name} Â· {runningProfile?.name || "rampa"}</Link>
                      ) : (
                        "sem lote ativo"
                      )}
                    </p>
                  </div>
                  <div className="metric-row">
                    <span>PV <strong>{latest?.pv ?? "-"}</strong></span>
                    <span>SP <strong>{latest?.sp_active ?? item.ideal_temp_c ?? "-"}</strong></span>
                    <span>MV <strong>{latest?.mv ?? "-"}</strong></span>
                    <span>RUN <strong>{latest?.run_state ?? "-"}</strong></span>
                  </div>
                  {runningBatch && (
                    <button className="delete-btn" onClick={() => submit(() => api.finishBatch(runningBatch.id), "Lote finalizado.")}>
                      Finalizar lote
                    </button>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="section">
        <h2>Rampas Cadastradas</h2>
        <div className="profile-list">
          {api.profiles.map((item) => (
            <article className="profile-card" key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.description || "Sem descriÃ§Ã£o"}</p>
              <ol>
                {(item.segments || []).sort((a, b) => a.segment_order - b.segment_order).map((segment) => (
                  <li key={segment.id}>
                    {segment.target_sp} Â°C por {(segment.duration_seconds / 3600).toFixed(1)} h
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>HistÃ³rico de Lotes</h2>
        <div className="profile-list">
          {api.batches.map((item) => {
            const tankInfo = api.tanks.find((tankItem) => tankItem.id === item.tank_id);
            const profileInfo = api.profiles.find((profileItem) => profileItem.id === item.profile_id);
            return (
              <Link className="profile-card link-card" key={item.id} to={`/batches/${item.id}`}>
                <h3>{item.recipe_name}</h3>
                <p>{tankInfo?.name || "Tanque removido"} Â· {profileInfo?.name || "Sem rampa"}</p>
                <p>Status: {item.status}</p>
                <p>InÃ­cio: {item.started_at ? new Date(item.started_at).toLocaleString("pt-BR") : "nÃ£o iniciado"}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}





