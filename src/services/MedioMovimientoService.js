import api from '../api/axios';

const BASE = '/medio-movimiento';

export const getMediosMovimiento = ()=> api.get(BASE).then(r => r.data);
export const getMedioMovimientoById = (id)=> api.get(`${BASE}/${id}`).then(r => r.data);
export const createMedioMovimiento = (data)=> api.post(BASE, data).then(r => r.data);
export const updateMedioMovimiento = (id, data)=> api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteMedioMovimiento = (id)=> api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarMedioMovimiento = (id)=> api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);