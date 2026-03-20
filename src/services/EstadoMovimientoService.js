import api from '../api/axios';

const BASE = '/EstadoMovimiento';

export const getEstadosMovimiento = ()=> api.get(BASE).then(r => r.data);
export const getEstadoMovimientoById = (id)=> api.get(`${BASE}/${id}`).then(r => r.data);
export const createEstadoMovimiento = (data)=> api.post(BASE, data).then(r => r.data);
export const updateEstadoMovimiento = (id, data)=> api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteEstadoMovimiento = (id)=> api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarEstadoMovimiento = (id)=> api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);