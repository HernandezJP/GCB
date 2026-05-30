import api from '../api/axios';

const BASE = '/reportes/movimientos';

export const getReporteMovimientos = async (params = {}) => {
    const response = await api.get("/reportes/movimientos", {
        params,
    });

    return response.data;
};