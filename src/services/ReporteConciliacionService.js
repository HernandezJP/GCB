import api from "../api/axios";

const BASE = "/reportes/conciliaciones";

const limpiarFiltros = (filtros) => {
    const params = {};

    if (filtros.cuentaId) params.cuentaId = Number(filtros.cuentaId);

    return params;
};

export const getReporteConciliaciones = (filtros = {}) =>
    api.get(BASE, { params: limpiarFiltros(filtros) }).then(r => r.data);