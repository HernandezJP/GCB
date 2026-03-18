import api from '../api/axios';

const BASE = '/estados-cuenta';

export const getEstadosCuenta      = ()         => api.get(BASE).then(r => r.data);
export const getEstadoCuentaById   = (id)       => api.get(`${BASE}/${id}`).then(r => r.data);
export const createEstadoCuenta    = (data)     => api.post(BASE, data).then(r => r.data);
export const updateEstadoCuenta    = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteEstadoCuenta    = (id)       => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarEstadoCuenta = (id)       => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);