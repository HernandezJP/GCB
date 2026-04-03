import api from '../api/axios';
 
const BASE = '/cuentas-bancarias';
 
export const getCuentas            = ()        => api.get(BASE).then(r => r.data);
export const getCuentasPorBanco    = (bancoId) => api.get(`${BASE}/banco/${bancoId}`).then(r => r.data);
export const getCuenta             = (id)      => api.get(`${BASE}/${id}`).then(r => r.data);
export const createCuenta          = (dto)     => api.post(BASE, dto).then(r => r.data);
export const updateCuenta          = (id, dto) => api.put(`${BASE}/${id}`, dto).then(r => r.data);
export const deleteCuenta          = (id)      => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarCuenta       = (id)      => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);