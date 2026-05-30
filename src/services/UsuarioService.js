import api from "../api/axios";

const BASE = "/usuarios";

export const getUsuarios = () =>
    api.get(BASE).then((r) => r.data);

export const getUsuario = (id) =>
    api.get(`${BASE}/${id}`).then((r) => r.data);

export const createUsuario = (dto) =>
    api.post(BASE, dto).then((r) => r.data);

export const updateUsuario = (id, dto) =>
    api.put(`${BASE}/${id}`, dto).then((r) => r.data);

export const cambiarPasswordUsuario = (id, dto) =>
    api.patch(`${BASE}/${id}/password`, dto).then((r) => r.data);

export const deleteUsuario = (id) =>
    api.patch(`${BASE}/${id}/desactivar`).then((r) => r.data);

export const reactivarUsuario = (id) =>
    api.patch(`${BASE}/${id}/reactivar`).then((r) => r.data);

export const actualizarUltimoAcceso = (id) =>
    api.patch(`${BASE}/${id}/ultimo-acceso`).then((r) => r.data);