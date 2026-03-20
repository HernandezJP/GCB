import axios from 'axios';

// Creamos una instancia de axios personalizada
const api = axios.create({
    // baseURL: Cambia esto por la URL base de tu servidor/backend real
    baseURL: 'http://localhost:7172/api',
    timeout: 10000, // Tiempo máximo de espera para una petición (10 segundos)
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Interceptor de Peticiones (REQUEST)
// Esto se ejecuta ANTES de que la petición salga de tu app hacia el backend.
// Es el lugar perfecto para adjuntar un Token de seguridad si el usuario inició sesión.
api.interceptors.request.use(
    (config) => {
        // Ejemplo: Obtener token del localStorage (si usas autenticación)
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Interceptor de Respuestas (RESPONSE)
// Esto se ejecuta CUANDO el backend te responde, ANTES de que llegue a tu componente.
// Sirve para manejar errores globales, como cuando el token expira (Error 401).
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
                // Aquí podrías agregar lógica para borrar el token y redirigir al login
                // localStorage.removeItem('token');
                // window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);

export default api;
