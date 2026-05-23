import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const ApiContext = createContext(null);

export const useApi = () => useContext(ApiContext);

export function ApiProvider({ children }) {
  const [tanks, setTanks] = useState([]);
  const [controllers, setControllers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, c, r, l] = await Promise.all([
        api.get('/tanks'),
        api.get('/controllers'),
        api.get('/readings?limit=200'),
        api.get('/logs/commands'),
      ]);
      setTanks(t);
      setControllers(c);
      setReadings(r);
      setLogs(l);
    } catch (e) {
      setError(e.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      tanks,
      controllers,
      readings,
      logs,
      loading,
      error,
      refresh,
      createTank: async (payload) => {
        await api.post('/tanks', payload);
        await refresh();
      },
      updateTank: async (id, payload) => {
        await api.put(`/tanks/${id}`, payload);
        await refresh();
      },
      deleteTank: async (id) => {
        await api.del(`/tanks/${id}`);
        await refresh();
      },
      createController: async (payload) => {
        await api.post('/controllers', payload);
        await refresh();
      },
      updateController: async (id, payload) => {
        await api.put(`/controllers/${id}`, payload);
        await refresh();
      },
      deleteController: async (id) => {
        await api.del(`/controllers/${id}`);
        await refresh();
      },
      testConnection: (id) => api.post(`/controllers/${id}/test-connection`, {}),
      setpoint: (id, value) => api.post(`/controllers/${id}/setpoint`, { value }),
      run: (id, enabled) => api.post(`/controllers/${id}/run`, { enabled }),
      mode: (id, mode) => api.post(`/controllers/${id}/mode`, { mode }),
      manualMv: (id, value) => api.post(`/controllers/${id}/manual-mv`, { value }),
      createProfile: (payload) => api.post('/profiles', payload),
      createProfileSegment: (id, payload) => api.post(`/profiles/${id}/segments`, payload),
      getLatestReading: (tankId) => api.get(`/tanks/${tankId}/latest-reading`),
    }),
    [tanks, controllers, readings, logs, loading, error]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}