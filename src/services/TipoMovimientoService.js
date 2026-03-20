import api from '../api/axios';

const BASE = '/TipoMovimiento';

export const getTiposMovimiento = () => api.get(BASE).then(r => r.data);
export const getTipoMovimientoById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createTipoMovimiento = (data) => api.post(BASE, data).then(r => r.data);
export const updateTipoMovimiento = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteTipoMovimiento = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);