import api from '../api/axios';

const BASE = '/reportes/movimientos';

export const getReporteMovimientos = (params = {}) =>
  api.get(BASE, { params }).then(r => r.data);