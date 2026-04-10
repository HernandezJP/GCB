import api from '../api/axios';

const BASE = '/persona';

export const getPersonas = () => api.get(BASE).then(r => r.data);
export const getPersonaById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);
export const getPersonaDetalle = (id) => api.get(`${BASE}/${id}/detalle`).then(r => r.data);
export const createPersona = (dto) => api.post(BASE, dto).then(r => r.data);
export const updatePersona = (id, dto) => api.put(`${BASE}/${id}`, dto).then(r => r.data);
export const deletePersona = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);

export const addTelefonoPersona = (id, dto) =>
  api.post(`${BASE}/${id}/telefonos`, dto).then(r => r.data);

export const addDireccionPersona = (id, dto) =>
  api.post(`${BASE}/${id}/direcciones`, dto).then(r => r.data);

export const updateTelefonoPersona = (telefonoId, dto) =>
  api.put(`${BASE}/telefonos/${telefonoId}`, dto).then(r => r.data);

export const deleteTelefonoPersona = (telefonoId) =>
  api.delete(`${BASE}/telefonos/${telefonoId}`).then(r => r.data);

export const updateDireccionPersona = (direccionId, dto) =>
  api.put(`${BASE}/direcciones/${direccionId}`, dto).then(r => r.data);

export const deleteDireccionPersona = (direccionId) =>
  api.delete(`${BASE}/direcciones/${direccionId}`).then(r => r.data);