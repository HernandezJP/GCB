import api from '../api/axios';

const BASE = '/movimiento';

export const getMovimientos = () =>
  api.get(BASE).then(r => r.data);

export const getMovimiento = (id) =>
  api.get(`${BASE}/${id}`).then(r => r.data);

export const getMovimientosPorCuenta = (idCuenta) =>
  api.get(`${BASE}/cuenta/${idCuenta}`).then(r => r.data);

export const createMovimiento = (dto) =>
  api.post(BASE, dto).then(r => r.data);

export const anularMovimiento = (id) =>
  api.patch(`${BASE}/${id}/anular`).then(r => r.data);