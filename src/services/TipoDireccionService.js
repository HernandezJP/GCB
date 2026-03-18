import api from '../api/axios';

const BASE = '/tipodireccion';

export const getTiposDireccion = () => api.get(BASE).then(r => r.data);
export const getTipoDireccionById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createTipoDireccion = (data) => api.post(BASE, data).then(r => r.data);
export const updateTipoDireccion = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteTipoDireccion = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);