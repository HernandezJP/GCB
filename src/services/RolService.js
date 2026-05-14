import api from "../api/axios";

const BASE = "/roles";

export const getRoles = () => api.get(BASE).then((r) => r.data);

export const getRol = (id) =>
    api.get(`${BASE}/${id}`).then((r) => r.data);

export const createRol = (dto) =>
    api.post(BASE, dto).then((r) => r.data);

export const updateRol = (id, dto) =>
    api.put(`${BASE}/${id}`, dto).then((r) => r.data);

export const deleteRol = (id) =>
    api.patch(`${BASE}/${id}/desactivar`).then((r) => r.data);

export const reactivarRol = (id) =>
    api.patch(`${BASE}/${id}/reactivar`).then((r) => r.data);