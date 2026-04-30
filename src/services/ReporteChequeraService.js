import api from "../api/axios";

const BASE = "/reportes/chequeras";

export const getReporteChequeras = (params = {}) =>
    api.get(BASE, { params }).then((r) => r.data);