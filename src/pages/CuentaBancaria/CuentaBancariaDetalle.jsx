import React, { useState } from 'react';
import { ArrowLeft, CreditCard, ArrowLeftRight, FileText, BookOpen, FileCheck } from 'lucide-react';
import {
  getBancoNombre,
  getNumero,
  getTipoCuenta,
  getMoneda,
  getNombre,
  getApellido,
  isActivo,
  getSimbolo,
  getSaldoInicial,
  getSaldoActual,
  getEstadoDesc,
  getId
} from './CuentaBancariaModal';

import MovimientoTab from '../Movimiento/MovimientoTab';
import '../Movimiento/Movimiento.css';

const TABS = [
  { key: 'movimientos', label: 'Movimientos', icon: <ArrowLeftRight size={14} /> },
  { key: 'cheques', label: 'Cheques', icon: <FileText size={14} /> },
  { key: 'chequeras', label: 'Chequeras', icon: <BookOpen size={14} /> },
  { key: 'conciliacion', label: 'Conciliación', icon: <FileCheck size={14} /> },
];

const TabPlaceholder = ({ label }) => (
  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
    Módulo de <strong>{label}</strong> — conectar con el tab correspondiente.
  </div>
);

const CuentaBancariaView = ({ cuenta, onBack }) => {
  const [tab, setTab] = useState('movimientos');

  const simbolo = getSimbolo(cuenta);
  const titular = `${getNombre(cuenta)} ${getApellido(cuenta)}`.trim();
  const cuentaId = getId(cuenta);
  const numeroCuenta = getNumero(cuenta);

  return (
    <div>
      <button className="btn-secondary" style={{ marginBottom: 16 }} onClick={onBack}>
        <ArrowLeft size={15} /> Volver a cuentas
      </button>

      <div className="detalle-card">
        <div className="detalle-header">
          <div className="detalle-icon">
            <CreditCard size={26} />
          </div>

          <div>
            <h2>{getBancoNombre(cuenta)}</h2>
            <p className="detalle-subtitle">
              <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                {numeroCuenta}
              </code>
              {' · '}
              {getTipoCuenta(cuenta)}
              {' · '}
              {getMoneda(cuenta)}
            </p>
          </div>

          <div className="detalle-status">
            <span className={`status-pill ${isActivo(cuenta) ? 'pill-green' : 'pill-red'}`}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isActivo(cuenta) ? '#22c55e' : '#ef4444',
                  display: 'inline-block',
                  marginRight: 8
                }}
              />
              {isActivo(cuenta) ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        <div className="detalle-stats">
          {[
            { label: 'Titular', val: titular || '—' },
            { label: 'Estado cuenta', val: getEstadoDesc(cuenta) || '—' },
            {
              label: 'Saldo inicial',
              val: `${simbolo} ${Number(getSaldoInicial(cuenta) || 0).toLocaleString('es-GT', {
                minimumFractionDigits: 2
              })}`
            },
            {
              label: 'Saldo actual',
              val: `${simbolo} ${Number(getSaldoActual(cuenta) || 0).toLocaleString('es-GT', {
                minimumFractionDigits: 2
              })}`,
              color: Number(getSaldoActual(cuenta) || 0) < 0 ? '#b91c1c' : '#15803d'
            },
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
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
              type="button"
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {tab === 'movimientos' && (
            <MovimientoTab
              cuentaId={cuentaId}
              numeroCuenta={numeroCuenta}
              simbolo={simbolo}
            />
          )}

          {tab === 'cheques' && <TabPlaceholder label="Cheques" />}
          {tab === 'chequeras' && <TabPlaceholder label="Chequeras" />}
          {tab === 'conciliacion' && <TabPlaceholder label="Conciliación" />}
        </div>
      </div>
    </div>
  );
};

export default CuentaBancariaView;