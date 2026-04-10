export const getConciliacionId = (c) =>
  c?.coN_Conciliacion ?? c?.cON_Conciliacion ?? c?.con_conciliacion ?? c?.CON_Conciliacion ?? 0;

export const getCuentaId = (c) =>
  c?.cuB_Cuenta ?? c?.cUB_Cuenta ?? c?.cub_cuenta ?? c?.CUB_Cuenta ?? 0;

export const getPeriodo = (c) =>
  c?.coN_Periodo ?? c?.cON_Periodo ?? c?.con_periodo ?? c?.CON_Periodo ?? '';

export const getSaldoBanco = (c) =>
  Number(c?.coN_Saldo_Banco ?? c?.cON_Saldo_Banco ?? c?.con_saldo_banco ?? c?.CON_Saldo_Banco ?? 0);

export const getSaldoLibros = (c) =>
  Number(c?.coN_Saldo_Libros ?? c?.cON_Saldo_Libros ?? c?.con_saldo_libros ?? c?.CON_Saldo_Libros ?? 0);

export const getDiferencia = (c) =>
  Number(c?.coN_Diferencia ?? c?.cON_Diferencia ?? c?.con_diferencia ?? c?.CON_Diferencia ?? 0);

export const getFechaConciliacion = (c) =>
  c?.coN_Fecha_Conciliacion ?? c?.cON_Fecha_Conciliacion ?? c?.con_fecha_conciliacion ?? c?.CON_Fecha_Conciliacion ?? null;

export const getEstadoConciliacionId = (c) =>
  c?.ecO_Estado_Conciliacion ?? c?.eCO_Estado_Conciliacion ?? c?.eco_estado_conciliacion ?? c?.ECO_Estado_Conciliacion ?? 0;

export const getEstadoConciliacionDescripcion = (c) =>
  c?.ecO_Descripcion ?? c?.eCO_Descripcion ?? c?.eco_descripcion ?? c?.ECO_Descripcion ?? '—';

export const getConciliados = (c) => Number(c?.conciliados ?? 0);
export const getPendientesEnLibros = (c) => Number(c?.pendientesEnLibros ?? 0);
export const getPendientesEnBanco = (c) => Number(c?.pendientesEnBanco ?? 0);
export const getEnTransito = (c) => Number(c?.enTransito ?? 0);
export const getDiferenciaMonto = (c) => Number(c?.diferenciaMonto ?? 0);
export const getDiferenciaFecha = (c) => Number(c?.diferenciaFecha ?? 0);

export const getTotalDepositosTransito = (c) =>
  Number(c?.totalDepositosTransito ?? 0);

export const getTotalChequesCirculacion = (c) =>
  Number(c?.totalChequesCirculacion ?? 0);

export const getTotalErroresBancarios = (c) =>
  Number(c?.totalErroresBancarios ?? 0);

export const getTotalAjustesContablesPendientes = (c) =>
  Number(c?.totalAjustesContablesPendientes ?? 0);

export const getSaldoBancoAjustado = (c) =>
  Number(c?.saldoBancoAjustado ?? 0);

export const getSaldoLibrosAjustado = (c) =>
  Number(c?.saldoLibrosAjustado ?? 0);

export const getDetalleId = (d) =>
  d?.dcO_Detalle_Conciliacion ?? d?.dCO_Detalle_Conciliacion ?? d?.dco_detalle_conciliacion ?? d?.DCO_Detalle_Conciliacion ?? 0;

export const getDetalleEstadoDescripcion = (d) =>
  d?.edC_Descripcion ?? d?.eDC_Descripcion ?? d?.edc_descripcion ?? d?.EDC_Descripcion ?? '—';

export const getDetalleMovimientoId = (d) =>
  d?.moV_Movimiento ?? d?.mOV_Movimiento ?? d?.mov_movimiento ?? d?.MOV_Movimiento ?? null;

export const getDetalleTemporalId = (d) =>
  d?.mtE_Movimiento_Temporal ?? d?.mTE_Movimiento_Temporal ?? d?.mte_movimiento_temporal ?? d?.MTE_Movimiento_Temporal ?? null;

export const getMovFecha = (d) =>
  d?.moV_Fecha ?? d?.mOV_Fecha ?? d?.mov_fecha ?? d?.MOV_Fecha ?? null;

export const getMovReferencia = (d) =>
  d?.moV_Numero_Referencia ?? d?.mOV_Numero_Referencia ?? d?.mov_numero_referencia ?? d?.MOV_Numero_Referencia ?? '—';

export const getMovDescripcion = (d) =>
  d?.moV_Descripcion ?? d?.mOV_Descripcion ?? d?.mov_descripcion ?? d?.MOV_Descripcion ?? '—';

export const getMovMonto = (d) =>
  Number(d?.moV_Monto ?? d?.mOV_Monto ?? d?.mov_monto ?? d?.MOV_Monto ?? 0);

export const getMovTipo = (d) =>
  d?.tiM_Descripcion ?? d?.tIM_Descripcion ?? d?.tim_descripcion ?? d?.TIM_Descripcion ?? '—';

export const getMovMedio = (d) =>
  d?.meM_Descripcion ?? d?.mEM_Descripcion ?? d?.mem_descripcion ?? d?.MEM_Descripcion ?? '—';

export const getTempFecha = (d) =>
  d?.mtE_Fecha ?? d?.mTE_Fecha ?? d?.mte_fecha ?? d?.MTE_Fecha ?? null;

export const getTempReferencia = (d) =>
  d?.mtE_Referencia ?? d?.mTE_Referencia ?? d?.mte_referencia ?? d?.MTE_Referencia ?? '—';

export const getTempDescripcion = (d) =>
  d?.mtE_Descripcion ?? d?.mTE_Descripcion ?? d?.mte_descripcion ?? d?.MTE_Descripcion ?? '—';

export const getTempDebito = (d) =>
  Number(d?.mtE_Debito ?? d?.mTE_Debito ?? d?.mte_debito ?? d?.MTE_Debito ?? 0);

export const getTempCredito = (d) =>
  Number(d?.mtE_Credito ?? d?.mTE_Credito ?? d?.mte_credito ?? d?.MTE_Credito ?? 0);

export const getTempSaldo = (d) =>
  Number(d?.mtE_Saldo ?? d?.mTE_Saldo ?? d?.mte_saldo ?? d?.MTE_Saldo ?? 0);

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatMoney = (value, simbolo = 'Q') => {
  const num = Number(value || 0);
  return `${simbolo} ${num.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getEstadoPillClass = (estado) => {
  const e = String(estado || '').trim().toLowerCase();

  if (e.includes('conciliada') || e.includes('cerrada')) return 'pill-green';
  if (e.includes('diferencia')) return 'pill-red';
  if (e.includes('analisis')) return 'pill-amber';
  return 'pill-blue';
};

export const getDetallePillClass = (estado) => {
  const e = String(estado || '').trim().toLowerCase();

  if (e.includes('conciliado') || e.includes('ajustado') || e.includes('aceptado')) return 'pill-green';
  if (e.includes('pendiente en libros')) return 'pill-red';
  if (e.includes('pendiente en banco') || e.includes('transito')) return 'pill-amber';
  if (e.includes('diferencia')) return 'pill-red';
  return 'pill-blue';
};

export const puedeRegistrarEnLibros = (detalle) =>
  String(getDetalleEstadoDescripcion(detalle)).trim().toLowerCase() === 'pendiente en libros';

export const puedeMarcarEnTransito = (detalle) => {
  const estado = String(getDetalleEstadoDescripcion(detalle)).trim().toLowerCase();
  return estado === 'pendiente en banco' || estado === 'diferencia de fecha';
};

export const puedeAceptarManual = (detalle) => {
  const estado = String(getDetalleEstadoDescripcion(detalle)).trim().toLowerCase();
  return estado === 'diferencia de monto' || estado === 'diferencia de fecha';
};