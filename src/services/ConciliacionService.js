import api from '../api/axios';

const BASE = '/conciliacion';

export const getConciliaciones = () =>
  api.get(BASE).then(r => r.data);

export const getConciliacionById = (id) =>
  api.get(`${BASE}/${id}`).then(r => r.data);

export const getDetalleConciliacion = (id) =>
  api.get(`${BASE}/${id}/detalle`).then(r => r.data);

export const getConciliacionesPorCuenta = (cuentaId) =>
  api.get(`${BASE}/cuenta/${cuentaId}`).then(r => r.data);

export const procesarConciliacion = (formData) =>
  api.post(`${BASE}/procesar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  }).then(r => r.data);

export const registrarEnLibros = (detalleId) =>
  api.post(`${BASE}/detalle/${detalleId}/registrar-en-libros`).then(r => r.data);

export const marcarEnTransito = (detalleId) =>
  api.patch(`${BASE}/detalle/${detalleId}/marcar-transito`).then(r => r.data);

export const aceptarManual = (detalleId) =>
  api.patch(`${BASE}/detalle/${detalleId}/aceptar-manual`).then(r => r.data);

export const recalcularEstadoConciliacion = (id) =>
  api.patch(`${BASE}/${id}/recalcular-estado`).then(r => r.data);

export const cerrarConciliacion = (id) =>
  api.patch(`${BASE}/${id}/cerrar`).then(r => r.data);