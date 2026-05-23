import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../contexts/ApiContext';

export default function TestBench() {
  const api = useApi();
  const [controllerId, setControllerId] = useState('1');
  const [tankId, setTankId] = useState('1');
  const [setpointValue, setSetpointValue] = useState('18');
  const [runEnabled, setRunEnabled] = useState(true);
  const [mode, setMode] = useState('auto');
  const [manualMv, setManualMv] = useState('50');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.refresh();
  }, []);

  const latest = useMemo(
    () => api.readings.find((r) => String(r.tank_id) === String(tankId)),
    [api.readings, tankId]
  );

  const doAction = async (fn) => {
    setStatus('executando...');
    try {
      await fn();
      setStatus('ok');
      await api.refresh();
    } catch (e) {
      setStatus(e.message || 'erro');
    }
  };

  return (
    <div className="page testbench">
      <div className="card">
        <h2>Banco de Teste</h2>
        <p>Status: {api.loading ? 'carregando' : api.error ? api.error : 'ok'}</p>
        <p>Último comando: {status}</p>

        <div className="grid2">
          <label>
            Controlador ID
            <input value={controllerId} onChange={(e) => setControllerId(e.target.value)} />
          </label>

          <label>
            Tanque ID
            <input value={tankId} onChange={(e) => setTankId(e.target.value)} />
          </label>

          <label>
            Setpoint
            <input value={setpointValue} onChange={(e) => setSetpointValue(e.target.value)} />
          </label>

          <label>
            MV Manual
            <input value={manualMv} onChange={(e) => setManualMv(e.target.value)} />
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
          <button onClick={() => doAction(() => api.testConnection(Number(controllerId)))}>Testar conexão</button>
          <button onClick={() => doAction(() => api.setpoint(Number(controllerId), Number(setpointValue)))}>Enviar SP</button>
          <button onClick={() => doAction(() => api.run(Number(controllerId), runEnabled))}>Enviar RUN</button>
          <button onClick={() => doAction(() => api.mode(Number(controllerId), mode))}>Modo</button>
          <button onClick={() => doAction(() => api.manualMv(Number(controllerId), Number(manualMv)))}>MV Manual</button>
          <button onClick={() => doAction(() => api.refresh())}>Recarregar</button>
        </div>
      </div>

      <div className="card">
        <h2>Leitura Atual</h2>
        {latest ? (
          <div>
            <p>PV: {latest.pv}</p>
            <p>SP: {latest.sp_active}</p>
            <p>MV: {latest.mv}</p>
            <p>Modo: {latest.control_mode}</p>
            <p>RUN: {latest.run_state}</p>
            <p>Segmento: {latest.segment_number}</p>
            <p>Tempo segmento: {latest.segment_time_remaining}</p>
          </div>
        ) : (
          <p>Sem leitura ainda.</p>
        )}
      </div>

      <div className="card">
        <h2>Logs de Comando</h2>
        <ul>
          {api.logs.slice(0, 15).map((log) => (
            <li key={log.id}>
              {log.command_type} | {log.value_sent} | {String(log.success)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}