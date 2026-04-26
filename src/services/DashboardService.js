import api from "../api/axios";

export const getDashboardCuentas = () =>
    api.get("/reportes/cuentas-bancarias").then(r => r.data);