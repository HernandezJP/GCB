import api from '../api/axios';

const BASE = '/EstadoConciliacion';

export const getEstadosConciliacion      = ()         => api.get(BASE).then(r => r.data);
export const getEstadoConciliacionById   = (id)       => api.get(`${BASE}/${id}`).then(r => r.data);
export const createEstadoConciliacion    = (data)     => api.post(BASE, data).then(r => r.data);
export const updateEstadoConciliacion    = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteEstadoConciliacion    = (id)       => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarEstadoConciliacion = (id)       => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);