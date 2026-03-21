import api from '../api/axios';

const BASE_PATH = '/bancos';

export const getBancos = async () => {
    const response = await api.get(BASE_PATH);
    return response.data;
};

export const getBancoById = async (id) => {
    const response = await api.get(`${BASE_PATH}/${id}`);
    return response.data;
};

export const createBanco = async (bancoData) => {
    const response = await api.post(BASE_PATH, bancoData);
    return response.data;
};

export const updateBanco = async (id, bancoData) => {
    const response = await api.put(`${BASE_PATH}/${id}`, bancoData);
    return response.data;
};

export const deleteBanco = async (id) => {
    const response = await api.delete(`${BASE_PATH}/${id}`);
    return response.data;
};

export const reactivarBanco = async (id) => {
    const response = await api.patch(`${BASE_PATH}/${id}/reactivar`).then(r => r.data);
    return response;
}