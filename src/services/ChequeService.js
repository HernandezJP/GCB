import api from '../api/axios';

const BASE = '/Cheque';

export const getCheques = () => api.get(BASE).then(r => r.data);
export const getCheque = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const createCheque = (dto) => api.post(BASE, dto).then(r => r.data);
export const updateCheque = (id, dto) => api.put(`${BASE}/${id}`, dto).then(r => r.data);
export const deleteCheque = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);