import api from '../api/axios';

const BASE = '/interes-frecuencia';

export const getInteresFrecuencias = () => api.get(BASE).then(r => r.data);
export const getInteresFrecuenciaById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createInteresFrecuencia = (data) => api.post(BASE, data).then(r => r.data);
export const updateInteresFrecuencia = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteInteresFrecuencia = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarInteresFrecuencia = (id) => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);