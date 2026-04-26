import api from "../api/axios";

export const getDashboardCuentas = () =>
    api.get("/reportes/cuentas-bancarias").then(r => r.data);

export const getDashboardConciliaciones = () =>
    api.get("/reportes/conciliaciones").then(r => r.data);