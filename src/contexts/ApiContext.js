import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const ApiContext = createContext(null);

export const useApi = () => useContext(ApiContext);

export function ApiProvider({ children }) {
  const [tanks, setTanks] = useState([]);
  const [controllers, setControllers] = useState([]);
  const [beerTypes, setBeerTypes] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [batches, setBatches] = useState([]);
  const [readings, setReadings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, c, bt, p, ba, r, l] = await Promise.all([
        api.get('/tanks'),
        api.get('/controllers'),
        api.get('/beer-types'),
        api.get('/profiles'),
        api.get('/batches'),
        api.get('/readings?limit=2000'),
        api.get('/logs/commands'),
      ]);
      setTanks(t);
      setControllers(c);
      setBeerTypes(bt);
      setProfiles(p);
      setBatches(ba);
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
      beerTypes,
      profiles,
      batches,
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
      createBeerType: async (payload) => {
        await api.post('/beer-types', payload);
        await refresh();
      },
      updateBeerType: async (id, payload) => {
        await api.put(`/beer-types/${id}`, payload);
        await refresh();
      },
      deleteBeerType: async (id) => {
        await api.del(`/beer-types/${id}`);
        await refresh();
      },
      testConnection: (id) => api.post(`/controllers/${id}/test-connection`, {}),
      setpoint: (id, value) => api.post(`/controllers/${id}/setpoint`, { value }),
      run: (id, enabled) => api.post(`/controllers/${id}/run`, { enabled }),
      mode: (id, mode) => api.post(`/controllers/${id}/mode`, { mode }),
      manualMv: (id, value) => api.post(`/controllers/${id}/manual-mv`, { value }),
      createProfile: async (payload) => {
        await api.post('/profiles', payload);
        await refresh();
      },
      createProfileSegment: async (id, payload) => {
        await api.post(`/profiles/${id}/segments`, payload);
        await refresh();
      },
      startBatch: async (payload) => {
        await api.post('/batches/start', payload);
        await refresh();
      },
      finishBatch: async (id) => {
        await api.post(`/batches/${id}/finish`, {});
        await refresh();
      },
      getLatestReading: (tankId) => api.get(`/tanks/${tankId}/latest-reading`),
    }),
    [tanks, controllers, beerTypes, profiles, batches, readings, logs, loading, error]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
