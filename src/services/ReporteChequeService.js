import api from "../api/axios";

const BASE = "/reportes/cheques";

export const getReporteCheques = (params = {}) =>
    api.get(BASE, { params }).then((r) => r.data);