import api from '../api/axios';

const BASE = '/cheques';

export const getCheques            = ()        => api.get(BASE).then(r => r.data);
export const getChequesPorCuenta   = (id)      => api.get(`${BASE}/cuenta/${id}`).then(r => r.data);
export const getCheque             = (id)      => api.get(`${BASE}/${id}`).then(r => r.data);
export const createCheque          = (dto)     => api.post(BASE, dto).then(r => r.data);
export const cambiarEstadoCheque   = (id, dto) => api.patch(`${BASE}/${id}/estado`, dto).then(r => r.data);