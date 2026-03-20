//Cheque.
import api from '../api/axios';

const BASE = '/estados-cheque';

export const getEstadosCheque      = ()         => api.get(BASE).then(r => r.data);
export const getEstadoChequeById   = (id)       => api.get(`${BASE}/${id}`).then(r => r.data);
export const createEstadoCheque    = (data)     => api.post(BASE, data).then(r => r.data);
export const updateEstadoCheque    = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteEstadoCheque    = (id)       => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarEstadoCheque = (id)       => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);