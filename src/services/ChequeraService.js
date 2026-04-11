import api from '../api/axios';

const BASE = '/chequera';

export const getChequeras          = ()        => api.get(BASE).then(r => r.data);
export const getChequerasPorCuenta = (id)      => api.get(`${BASE}/cuenta/${id}`).then(r => r.data);
export const getChequera           = (id)      => api.get(`${BASE}/${id}`).then(r => r.data);
export const createChequera        = (dto)     => api.post(BASE, dto).then(r => r.data);
export const updateChequera        = (id, dto) => api.put(`${BASE}/${id}/actualizar`, dto).then(r => r.data);
export const deleteChequera        = (id)      => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarChequera     = (id)      => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);