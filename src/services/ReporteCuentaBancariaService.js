import api from "../api/axios";

const BASE = "/reportes/cuentas-bancarias";

const limpiarFiltros = (filtros) => {
    const params = {};

    if (filtros.bancoId) params.bancoId = Number(filtros.bancoId);
    if (filtros.tipoCuentaId) params.tipoCuentaId = Number(filtros.tipoCuentaId);
    if (filtros.tipoMonedaId) params.tipoMonedaId = Number(filtros.tipoMonedaId);
    if (filtros.estadoCuentaId) params.estadoCuentaId = Number(filtros.estadoCuentaId);
    if (filtros.estadoRegistro) params.estadoRegistro = filtros.estadoRegistro;

    return params;
};

export const getReporteCuentasBancarias = (filtros = {}) =>
    api.get(BASE, { params: limpiarFiltros(filtros) }).then(r => r.data);