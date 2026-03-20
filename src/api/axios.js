import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5142/api',
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        // Si todo salió bien, simplemente devolvemos la respuesta
        return response;
    },
    (error) => {
        // Si hubo un error global, podemos atajarlo aquí
        if (error.response) {
            if (error.response.status === 401) {
                console.error('Error 401: No autorizado. Tu sesión pudo haber expirado.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
