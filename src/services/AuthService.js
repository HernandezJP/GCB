import api from "../api/axios";

const BASE = "/auth";

export const loginRequest = (dto) =>
    api.post(`${BASE}/login`, dto).then((r) => r.data);

export const logoutRequest = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
};