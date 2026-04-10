import api from '../api/axios';

const BASE = '/regla-recargo';

export const getReglasRecargoPorCuenta = (cuentaId) =>
    api.get(`${BASE}/cuenta/${cuentaId}`).then(r => r.data);

export const createReglaRecargo = (data) =>
    api.post(BASE, data).then(r => r.data);

export const updateReglaRecargo = (id, data) =>
    api.put(`${BASE}/${id}`, data).then(r => r.data);

export const deleteReglaRecargo = (id) =>
    api.delete(`${BASE}/${id}`).then(r => r.data);