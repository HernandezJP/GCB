import api from '../api/axios';

const BASE = '/tipotelefono';

export const getTiposTelefono = () => api.get(BASE).then(r => r.data);
export const getTipoTelefonoById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createTipoTelefono = (data) => api.post(BASE, data).then(r => r.data);
export const updateTipoTelefono = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteTipoTelefono = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);