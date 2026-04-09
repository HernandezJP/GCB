import api from '../api/axios';

const BASE = '/tasa-interes';

export const getTasasInteres = () => api.get(BASE).then(r => r.data);
export const getTasaInteresById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createTasaInteres = (data) => api.post(BASE, data).then(r => r.data);
export const updateTasaInteres = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteTasaInteres = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarTasaInteres = (id) => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);