//Detalle conciliacion
import api from '../api/axios';

const BASE = '/estados-detalle-conciliacion';

export const getEstadosDetalleConciliacion      = ()         => api.get(BASE).then(r => r.data);
export const getEstadoDetalleConciliacionById   = (id)       => api.get(`${BASE}/${id}`).then(r => r.data);
export const createEstadoDetalleConciliacion    = (data)     => api.post(BASE, data).then(r => r.data);
export const updateEstadoDetalleConciliacion    = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteEstadoDetalleConciliacion    = (id)       => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarEstadoDetalleConciliacion = (id)       => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);