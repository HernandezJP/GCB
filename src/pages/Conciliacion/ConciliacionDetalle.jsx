import React, { useMemo, useState } from 'react';
import { ArrowLeft, Scale, RefreshCcw, Lock, FileCheck } from 'lucide-react';
import {
  getPeriodo,
  getSaldoBanco,
  getSaldoLibros,
  getDiferencia,
  getFechaConciliacion,
  getEstadoConciliacionDescripcion,
  getEstadoPillClass,
  getConciliados,
  getPendientesEnLibros,
  getPendientesEnBanco,
  getEnTransito,
  getDiferenciaMonto,
  getDiferenciaFecha,
  getTotalDepositosTransito,
  getTotalChequesCirculacion,
  getTotalErroresBancarios,
  getTotalAjustesContablesPendientes,
  getSaldoBancoAjustado,
  getSaldoLibrosAjustado,
  getDetalleId,
  getDetalleEstadoDescripcion,
  getDetallePillClass,
  getMovFecha,
  getMovReferencia,
  getMovMonto,
  getTempFecha,
  getTempReferencia,
  getTempDescripcion,
  getTempDebito,
  getTempCredito,
  formatDate,
  formatMoney,
  puedeRegistrarEnLibros,
  puedeMarcarEnTransito,
  puedeAceptarManual,
} from './ConciliacionHelpers';

const ConciliacionDetalle = ({
  conciliacion,
  detalle = [],
  onBack,
  onRegistrarEnLibros,
  onMarcarEnTransito,
  onAceptarManual,
  onRecalcular,
  onCerrar,
}) => {
  const [tab, setTab] = useState('detalle');

  const resumenCards = useMemo(
    () => [
      { label: 'Conciliados', value: getConciliados(conciliacion), color: '#15803d', bg: '#dcfce7' },
      { label: 'Pend. en libros', value: getPendientesEnLibros(conciliacion), color: '#b91c1c', bg: '#fee2e2' },
      { label: 'Pend. en banco', value: getPendientesEnBanco(conciliacion), color: '#92400e', bg: '#fef3c7' },
      { label: 'En tránsito', value: getEnTransito(conciliacion), color: '#1d4ed8', bg: '#dbeafe' },
      { label: 'Dif. monto', value: getDiferenciaMonto(conciliacion), color: '#dc2626', bg: '#fee2e2' },
      { label: 'Dif. fecha', value: getDiferenciaFecha(conciliacion), color: '#ea580c', bg: '#ffedd5' },
    ],
    [conciliacion]
  );

  if (!conciliacion) return null;

  return (
    <div>
      <button
        className="btn-secondary"
        style={{ marginBottom: 16 }}
        onClick={onBack}
        type="button"
      >
        <ArrowLeft size={15} /> Volver a conciliaciones
      </button>

      <div className="detalle-card">
        <div className="detalle-header">
          <div className="detalle-icon">
            <Scale size={26} />
          </div>

          <div>
            <h2>Conciliación {getPeriodo(conciliacion) || '—'}</h2>
            <p className="detalle-subtitle">
              {formatDate(getFechaConciliacion(conciliacion))} {' · '} Documento de conciliación bancaria
            </p>
          </div>

          <div className="detalle-status">
            <span className={`status-pill ${getEstadoPillClass(getEstadoConciliacionDescripcion(conciliacion))}`}>
              {getEstadoConciliacionDescripcion(conciliacion)}
            </span>
          </div>
        </div>

        <div className="detalle-stats">
          {[
            { label: 'Saldo banco', val: formatMoney(getSaldoBanco(conciliacion)) },
            { label: 'Saldo libros', val: formatMoney(getSaldoLibros(conciliacion)) },
            {
              label: 'Diferencia',
              val: formatMoney(getDiferencia(conciliacion)),
              color: getDiferencia(conciliacion) === 0 ? '#15803d' : '#b91c1c'
            },
            { label: 'Banco ajustado', val: formatMoney(getSaldoBancoAjustado(conciliacion)) },
            { label: 'Libros ajustado', val: formatMoney(getSaldoLibrosAjustado(conciliacion)) },
          ].map((s, i) => (
            <div key={i} className="detalle-stat">
              <div className="detalle-stat-label">{s.label}</div>
              <div className="detalle-stat-value" style={{ color: s.color || '#0f172a' }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>

        <div className="tabs-bar">
          <button
            type="button"
            className={`tab-btn ${tab === 'detalle' ? 'active' : ''}`}
            onClick={() => setTab('detalle')}
          >
            <FileCheck size={15} />
            Detalle
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'documento' ? 'active' : ''}`}
            onClick={() => setTab('documento')}
          >
            <Scale size={15} />
            Documento
          </button>
        </div>

        {tab === 'documento' && (
          <div className="tab-content" style={{ padding: 24 }}>
            <div className="kpi-grid" style={{ marginBottom: 0 }}>
              {[
                { label: 'Depósitos en tránsito', value: formatMoney(getTotalDepositosTransito(conciliacion)), color: '#15803d', bg: '#dcfce7' },
                { label: 'Cheques en circulación', value: formatMoney(getTotalChequesCirculacion(conciliacion)), color: '#b91c1c', bg: '#fee2e2' },
                { label: 'Errores bancarios', value: formatMoney(getTotalErroresBancarios(conciliacion)), color: '#92400e', bg: '#fef3c7' },
                { label: 'Ajustes contables', value: formatMoney(getTotalAjustesContablesPendientes(conciliacion)), color: '#1d4ed8', bg: '#dbeafe' },
              ].map((k, i) => (
                <div key={i} className="kpi-card" style={{ borderLeft: `4px solid ${k.color}` }}>
                  <div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                  </div>
                  <div className="kpi-icon" style={{ background: k.bg }}>
                    <Scale size={18} color={k.color} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'detalle' && (
          <>
            <div className="tab-toolbar">
              <div className="page-header-left" style={{ gap: 8 }}>
                <span className="record-count">{detalle.length} registros en detalle</span>
              </div>

              <div className="action-buttons" style={{ gap: 8 }}>
                <button className="btn-secondary" onClick={() => onRecalcular && onRecalcular()} type="button">
                  <RefreshCcw size={15} />
                  Recalcular
                </button>

                <button className="btn-primary" onClick={() => onCerrar && onCerrar()} type="button">
                  <Lock size={15} />
                  Cerrar conciliación
                </button>
              </div>
            </div>

            <div className="kpi-grid" style={{ padding: '20px 20px 0' }}>
              {resumenCards.map((k, i) => (
                <div key={i} className="kpi-card" style={{ borderLeft: `4px solid ${k.color}` }}>
                  <div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                  </div>
                  <div className="kpi-icon" style={{ background: k.bg }}>
                    <FileCheck size={18} color={k.color} />
                  </div>
                </div>
              ))}
            </div>

            <div className="table-container" style={{ margin: 20, marginTop: 16 }}>
              <div className="table-scroll">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Estado</th>
                      <th>Fecha libros</th>
                      <th>Referencia libros</th>
                      <th>Monto libros</th>
                      <th>Fecha banco</th>
                      <th>Referencia banco</th>
                      <th>Débito</th>
                      <th>Crédito</th>
                      <th>Descripción banco</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="empty-state">No hay detalle de conciliación.</td>
                      </tr>
                    ) : (
                      detalle.map((d, idx) => {
                        const id = getDetalleId(d);
                        const estado = getDetalleEstadoDescripcion(d);

                        return (
                          <tr key={id ?? `det-${idx}`}>
                            <td style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>{idx + 1}</td>

                            <td>
                              <span className={`status-pill ${getDetallePillClass(estado)}`}>
                                {estado}
                              </span>
                            </td>

                            <td>{formatDate(getMovFecha(d))}</td>
                            <td><code style={codeStyle}>{getMovReferencia(d)}</code></td>
                            <td style={moneyStyle}>{formatMoney(getMovMonto(d))}</td>

                            <td>{formatDate(getTempFecha(d))}</td>
                            <td><code style={codeStyle}>{getTempReferencia(d)}</code></td>
                            <td style={{ ...moneyStyle, color: '#b91c1c' }}>{formatMoney(getTempDebito(d))}</td>
                            <td style={{ ...moneyStyle, color: '#15803d' }}>{formatMoney(getTempCredito(d))}</td>
                            <td>{getTempDescripcion(d) || '—'}</td>

                            <td>
                              <div className="action-buttons" style={{ flexWrap: 'wrap' }}>
                                {puedeRegistrarEnLibros(d) && (
                                  <button
                                    className="btn-secondary"
                                    type="button"
                                    onClick={() => onRegistrarEnLibros && onRegistrarEnLibros(id)}
                                  >
                                    Registrar
                                  </button>
                                )}

                                {puedeMarcarEnTransito(d) && (
                                  <button
                                    className="btn-secondary"
                                    type="button"
                                    onClick={() => onMarcarEnTransito && onMarcarEnTransito(id)}
                                  >
                                    Tránsito
                                  </button>
                                )}

                                {puedeAceptarManual(d) && (
                                  <button
                                    className="btn-secondary"
                                    type="button"
                                    onClick={() => onAceptarManual && onAceptarManual(id)}
                                  >
                                    Aceptar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const codeStyle = {
  fontFamily: 'monospace',
  background: '#f1f5f9',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 600
};

const moneyStyle = {
  fontWeight: 600,
  fontFamily: 'monospace',
  fontSize: 13
};

export default ConciliacionDetalle;