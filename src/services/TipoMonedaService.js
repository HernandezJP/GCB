import api from '../api/axios';

const BASE = '/tipos-moneda';

export const getTiposMoneda = ()=> api.get(BASE).then(r => r.data);
export const getTipoMonedaById = (id)=> api.get(`${BASE}/${id}`).then(r => r.data);
export const createTipoMoneda = (data)=> api.post(BASE, data).then(r => r.data);
export const updateTipoMoneda = (id, data)=> api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteTipoMoneda = (id)=> api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarTipoMoneda = (id)=> api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);