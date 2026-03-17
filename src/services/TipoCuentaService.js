import api from '../api/axios';

const BASE = '/tipos-cuenta';

export const getTiposCuenta = () => api.get(BASE).then(r => r.data);
export const getTipoCuentaById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createTipoCuenta = (data) => api.post(BASE, data).then(r => r.data);
export const updateTipoCuenta = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteTipoCuenta = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarTipoCuenta = (id) => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);