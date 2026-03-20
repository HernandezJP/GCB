import api from '../api/axios';

const BASE = '/api/Movimiento';

export const getMovimientos = () => api.get(BASE).then(r => r.data);
export const getMovimientoById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createMovimiento = (data) => api.post(BASE, data).then(r => r.data);
export const updateMovimiento = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteMovimiento = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);