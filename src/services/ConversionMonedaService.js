import api from '../api/axios';

const BASE = '/conversiones-moneda';

export const getConversionesMoneda = () => api.get(BASE).then(r => r.data);
export const getConversionMonedaById = (id) => api.get(`${BASE}/${id}`).then(r => r.data);

export const getTasaVigente = (origen, destino, fecha) =>
    api.get(`${BASE}/vigente`, {
        params: { origen, destino, fecha }
    }).then(r => r.data);

export const getTasaDesdeApi = (origen, destino) =>
    api.post(`${BASE}/desde-api`, null, {
        params: { origen, destino }
    }).then(r => r.data);

export const createConversionMoneda = (data) => api.post(BASE, data).then(r => r.data);
export const updateConversionMoneda = (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteConversionMoneda = (id) => api.delete(`${BASE}/${id}`).then(r => r.data);
export const reactivarConversionMoneda = (id) => api.patch(`${BASE}/${id}/reactivar`).then(r => r.data);