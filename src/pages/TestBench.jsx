import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';

export default function TestBench() {
  const api = useApi();
  const [controllerId, setControllerId] = useState('');
  const [tankId, setTankId] = useState('');
  const [setpointValue, setSetpointValue] = useState('18');
  const [runEnabled, setRunEnabled] = useState(true);
  const [mode, setMode] = useState('auto');
  const [manualMv, setManualMv] = useState('50');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!controllerId && api.controllers.length) {
      setControllerId(String(api.controllers[0].id));
    }
    if (!tankId && api.tanks.length) {
      setTankId(String(api.tanks[0].id));
    }
  }, [api.controllers, api.tanks, controllerId, tankId]);

  const selectedController = useMemo(
    () => api.controllers.find((controller) => String(controller.id) === String(controllerId)),
    [api.controllers, controllerId]
  );

  const latest = useMemo(
    () => api.readings.find((reading) => String(reading.tank_id) === String(tankId)),
    [api.readings, tankId]
  );

  const doAction = async (fn) => {
    if (!selectedController) {
      setStatus('cadastre ou selecione um controlador primeiro');
      return;
    }

    setStatus('executando...');
    try {
      await fn();
      setStatus('ok');
      await api.refresh();
    } catch (e) {
      setStatus(e.message || 'erro');
    }
  };

  const noControllers = api.controllers.length === 0;

  return (
    <div className="page testbench">
      <div className="card panel-card">
        <div>
          <h2>Banco de Teste</h2>
          <p>Status: {api.loading ? 'carregando' : api.error ? api.error : 'ok'}</p>
          <p>Último comando: {status || 'nenhum'}</p>
        </div>
        <button onClick={api.refresh}>Recarregar</button>
      </div>

      {noControllers && (
        <div className="notice">
          Nenhum controlador cadastrado. Crie um controlador no Admin antes de enviar comandos.
          <Link to="/admin"><button>Ir para Admin</button></Link>
        </div>
      )}

      <div className="card form-card">
        <div className="grid2">
          <label>
            Controlador
            <select value={controllerId} onChange={(e) => setControllerId(e.target.value)}>
              <option value="">Selecione</option>
              {api.controllers.map((controller) => (
                <option key={controller.id} value={controller.id}>
                  {controller.name} - ID {controller.id} / slave {controller.slave_id}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tanque para leitura
            <select value={tankId} onChange={(e) => setTankId(e.target.value)}>
              <option value="">Selecione</option>
              {api.tanks.map((tank) => (
                <option key={tank.id} value={tank.id}>
                  {tank.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Setpoint
            <input type="number" step="0.1" value={setpointValue} onChange={(e) => setSetpointValue(e.target.value)} />
          </label>

          <label>
            MV Manual
            <input type="number" step="1" value={manualMv} onChange={(e) => setManualMv(e.target.value)} />
          </label>

          <label>
            Modo
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="auto">auto</option>
              <option value="manual">manual</option>
            </select>
          </label>

          <label>
            RUN
            <select value={String(runEnabled)} onChange={(e) => setRunEnabled(e.target.value === 'true')}>
              <option value="true">ligado</option>
              <option value="false">desligado</option>
            </select>
          </label>
        </div>

        <div className="actions">
          <button disabled={!selectedController} onClick={() => doAction(() => api.testConnection(Number(controllerId)))}>Testar conexão</button>
          <button disabled={!selectedController} onClick={() => doAction(() => api.setpoint(Number(controllerId), Number(setpointValue)))}>Enviar SP</button>
          <button disabled={!selectedController} onClick={() => doAction(() => api.run(Number(controllerId), runEnabled))}>Enviar RUN</button>
          <button disabled={!selectedController} onClick={() => doAction(() => api.mode(Number(controllerId), mode))}>Enviar modo</button>
          <button disabled={!selectedController} onClick={() => doAction(() => api.manualMv(Number(controllerId), Number(manualMv)))}>Enviar MV manual</button>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <h2>Leitura Atual</h2>
          {latest ? (
            <>
              <p>PV: {latest.pv ?? '-'}</p>
              <p>SP: {latest.sp_active ?? '-'}</p>
              <p>MV: {latest.mv ?? '-'}</p>
              <p>Modo: {latest.control_mode ?? '-'}</p>
              <p>RUN: {latest.run_state ?? '-'}</p>
              <p>Segmento: {latest.segment_number ?? '-'}</p>
            </>
          ) : (
            <p>Sem leitura ainda.</p>
          )}
        </div>

        <div className="details-card">
          <h2>Logs de Comando</h2>
          {api.logs.slice(0, 15).map((log) => (
            <p key={log.id}>
              {log.command_type} · {log.value_sent} · {String(log.success)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
