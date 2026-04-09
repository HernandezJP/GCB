export const getId = (m) =>
  m?.moV_Movimiento ?? m?.mOV_Movimiento ?? m?.mov_movimiento ?? 0;

export const getCuentaId = (m) =>
  m?.cuB_Cuenta ?? m?.cUB_Cuenta ?? m?.cub_cuenta ?? 0;

export const getNumeroCuenta = (m) =>
  m?.cuB_Numero_Cuenta ?? m?.cUB_Numero_Cuenta ?? m?.cub_numero_cuenta ?? '';

export const getPersonaId = (m) =>
  m?.peR_Persona ?? m?.pER_Persona ?? m?.per_persona ?? null;

export const getPersonaNombre = (m) =>
  m?.peR_Nombre_Completo ?? m?.pER_Nombre_Completo ?? m?.per_nombre_completo ?? '';

export const getTipoId = (m) =>
  m?.tiM_Tipo_Movimiento ?? m?.tIM_Tipo_Movimiento ?? m?.tim_tipo_movimiento ?? 0;

export const getTipoDescripcion = (m) =>
  m?.tiM_Descripcion ?? m?.tIM_Descripcion ?? m?.tim_descripcion ?? '';

export const getMedioId = (m) =>
  m?.meM_Medio_Movimiento ?? m?.mEM_Medio_Movimiento ?? m?.mem_medio_movimiento ?? 0;

export const getMedioDescripcion = (m) =>
  m?.meM_Descripcion ?? m?.mEM_Descripcion ?? m?.mem_descripcion ?? '';

export const getEstadoId = (m) =>
  m?.esM_Estado_Movimiento ?? m?.eSM_Estado_Movimiento ?? m?.esm_estado_movimiento ?? 0;

export const getEstadoDescripcion = (m) =>
  m?.esM_Descripcion ?? m?.eSM_Descripcion ?? m?.esm_descripcion ?? '';

export const getReglaRecargo = (m) =>
  m?.rcA_Regla_Recargo ?? m?.rCA_Regla_Recargo ?? m?.rca_regla_recargo ?? null;

export const getMontoOrigen = (m) =>
  Number(m?.moV_Monto_Origen ?? m?.mOV_Monto_Origen ?? m?.mov_monto_origen ?? 0);

export const getRecargo = (m) =>
  Number(m?.moV_Recargo ?? m?.mOV_Recargo ?? m?.mov_recargo ?? 0);

export const getMonto = (m) =>
  Number(m?.moV_Monto ?? m?.mOV_Monto ?? m?.mov_monto ?? 0);

export const getSaldo = (m) =>
  Number(m?.moV_Saldo ?? m?.mOV_Saldo ?? m?.mov_saldo ?? 0);

export const getFecha = (m) =>
  m?.moV_Fecha ?? m?.mOV_Fecha ?? m?.mov_fecha ?? '';

export const getReferencia = (m) =>
  m?.moV_Numero_Referencia ?? m?.mOV_Numero_Referencia ?? m?.mov_numero_referencia ?? '';

export const getDescripcion = (m) =>
  m?.moV_Descripcion ?? m?.mOV_Descripcion ?? m?.mov_descripcion ?? '';

export const getFechaCreacion = (m) =>
  m?.moV_Fecha_Creacion ?? m?.mOV_Fecha_Creacion ?? m?.mov_fecha_creacion ?? '';

export const esIngreso = (m) =>
  getTipoDescripcion(m).trim().toLowerCase() === 'ingreso';

export const esEgreso = (m) =>
  getTipoDescripcion(m).trim().toLowerCase() === 'egreso';

export const estaAnulado = (m) =>
  getEstadoDescripcion(m).trim().toLowerCase() === 'anulado';

export const formatMoney = (valor, simbolo = 'Q') =>
  `${simbolo} ${Number(valor || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '—';

  return d.toLocaleString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};