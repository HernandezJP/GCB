import api from '../api/axios';

const BASE = '/tipopersona';

export const getTiposPersona = () => api.get(BASE).then(r => r.data);
export const getTipoPersonaById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createTipoPersona = (data) => api.post(BASE, data).then(r => r.data);
export const updateTipoPersona = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteTipoPersona = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);