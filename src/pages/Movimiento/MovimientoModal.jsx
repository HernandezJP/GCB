import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeftRight, Check } from 'lucide-react';

const INITIAL = {
  CUB_Cuenta: '',
  PER_Persona: '',
  TIM_Tipo_Movimiento: '',
  MEM_Medio_Movimiento: '',
  ESM_Estado_Movimiento: '',
  RCA_Regla_Recargo: '',
  MOV_Fecha: '',
  MOV_Numero_Referencia: '',
  MOV_Descripcion: '',
  MOV_Monto_Origen: '',
};

const MovimientoModal = ({
  isOpen,
  onClose,
  onSave,
  cuentaId = '',
  numeroCuenta = '',
  personas = [],
  tiposMovimiento = [],
  mediosMovimiento = [],
  estadosMovimiento = []
}) => {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  const setText = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const getPersonaId = (p) =>
    p?.peR_Persona ?? p?.pER_Persona ?? p?.per_persona ?? p?.id ?? '';

  const getPersonaNombre = (p) =>
    p?.peR_Nombre_Completo ??
    p?.pER_Nombre_Completo ??
    p?.per_nombre_completo ??
    p?.nombreCompleto ??
    '';

  const getTipoId = (t) =>
    t?.tiM_Tipo_Movimiento ?? t?.tIM_Tipo_Movimiento ?? t?.tim_tipo_movimiento ?? '';

  const getTipoDesc = (t) =>
    t?.tiM_Descripcion ?? t?.tIM_Descripcion ?? t?.tim_descripcion ?? '';

  const getMedioId = (m) =>
    m?.meM_Medio_Movimiento ?? m?.mEM_Medio_Movimiento ?? m?.mem_medio_movimiento ?? '';

  const getMedioDesc = (m) =>
    m?.meM_Descripcion ?? m?.mEM_Descripcion ?? m?.mem_descripcion ?? '';

  const getEstadoId = (e) =>
    e?.esM_Estado_Movimiento ?? e?.eSM_Estado_Movimiento ?? e?.esm_estado_movimiento ?? '';

  const getEstadoDesc = (e) =>
    e?.esM_Descripcion ?? e?.eSM_Descripcion ?? e?.esm_descripcion ?? '';

  const estadoPorDefecto = useMemo(() => {
    if (!estadosMovimiento || estadosMovimiento.length === 0) return '';

    const activo =
      estadosMovimiento.find((e) =>
        String(getEstadoDesc(e)).trim().toLowerCase() === 'activo'
      ) ||
      estadosMovimiento.find((e) =>
        String(getEstadoDesc(e)).trim().toLowerCase() === 'aplicado'
      ) ||
      estadosMovimiento[0];

    return String(getEstadoId(activo) ?? '');
  }, [estadosMovimiento]);

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...INITIAL,
        CUB_Cuenta: String(cuentaId ?? ''),
        ESM_Estado_Movimiento: estadoPorDefecto,
        MOV_Fecha: new Date().toISOString().slice(0, 16),
      });
    }
  }, [isOpen, cuentaId, estadoPorDefecto]);

  if (!isOpen) return null;

  const tipoSeleccionado = tiposMovimiento.find(
    (t) => String(getTipoId(t)) === String(form.TIM_Tipo_Movimiento)
  );

  const medioSeleccionado = mediosMovimiento.find(
    (m) => String(getMedioId(m)) === String(form.MEM_Medio_Movimiento)
  );

  const nombreTipo = String(getTipoDesc(tipoSeleccionado)).trim().toLowerCase();
  const nombreMedio = String(getMedioDesc(medioSeleccionado)).trim().toLowerCase();

  const aplicaRecargoInfo =
    nombreTipo === 'egreso' &&
    nombreMedio === 'transferencia a otros bancos';

  const isValid =
    String(form.CUB_Cuenta).trim() !== '' &&
    String(form.TIM_Tipo_Movimiento).trim() !== '' &&
    String(form.MEM_Medio_Movimiento).trim() !== '' &&
    String(form.ESM_Estado_Movimiento).trim() !== '' &&
    String(form.MOV_Fecha).trim() !== '' &&
    String(form.MOV_Descripcion).trim() !== '' &&
    Number(form.MOV_Monto_Origen) > 0;

  const handleSubmit = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    try {
      await onSave({
        CUB_Cuenta: Number(form.CUB_Cuenta),
        PER_Persona: form.PER_Persona ? Number(form.PER_Persona) : null,
        TIM_Tipo_Movimiento: Number(form.TIM_Tipo_Movimiento),
        MEM_Medio_Movimiento: Number(form.MEM_Medio_Movimiento),
        ESM_Estado_Movimiento: Number(form.ESM_Estado_Movimiento),
        RCA_Regla_Recargo: form.RCA_Regla_Recargo ? Number(form.RCA_Regla_Recargo) : null,
        MOV_Fecha: new Date(form.MOV_Fecha).toISOString(),
        MOV_Numero_Referencia: form.MOV_Numero_Referencia.trim() || null,
        MOV_Descripcion: form.MOV_Descripcion.trim(),
        MOV_Monto_Origen: Number(form.MOV_Monto_Origen),
      });
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <ArrowLeftRight size={20} />
            </div>
            <div>
              <h2>Nuevo movimiento</h2>
              <p>Cuenta {numeroCuenta || cuentaId}</p>
            </div>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="stepper">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3
              }}
            >
              <div className="step-dot active">
                <Check size={13} />
              </div>
              <span className="step-label" style={{ color: '#0284c7' }}>
                Movimiento
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Cuenta</label>
              <input value={numeroCuenta || cuentaId} disabled />
            </div>

            <div className="input-group">
              <label>Fecha *</label>
              <input
                type="datetime-local"
                value={form.MOV_Fecha}
                onChange={setText('MOV_Fecha')}
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Tipo de movimiento *</label>
              <select
                value={form.TIM_Tipo_Movimiento}
                onChange={setText('TIM_Tipo_Movimiento')}
                disabled={saving}
              >
                <option value="">Seleccionar</option>
                {tiposMovimiento.map((t) => (
                  <option key={getTipoId(t)} value={String(getTipoId(t))}>
                    {getTipoDesc(t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Medio de movimiento *</label>
              <select
                value={form.MEM_Medio_Movimiento}
                onChange={setText('MEM_Medio_Movimiento')}
                disabled={saving}
              >
                <option value="">Seleccionar</option>
                {mediosMovimiento.map((m) => (
                  <option key={getMedioId(m)} value={String(getMedioId(m))}>
                    {getMedioDesc(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Persona</label>
              <select
                value={form.PER_Persona}
                onChange={setText('PER_Persona')}
                disabled={saving}
              >
                <option value="">Sin persona</option>
                {personas.map((p) => (
                  <option key={getPersonaId(p)} value={String(getPersonaId(p))}>
                    {getPersonaNombre(p)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Estado *</label>
              <select
                value={form.ESM_Estado_Movimiento}
                onChange={setText('ESM_Estado_Movimiento')}
                disabled={saving}
              >
                <option value="">Seleccionar</option>
                {estadosMovimiento.map((e) => (
                  <option key={getEstadoId(e)} value={String(getEstadoId(e))}>
                    {getEstadoDesc(e)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Referencia</label>
              <input
                value={form.MOV_Numero_Referencia}
                onChange={setText('MOV_Numero_Referencia')}
                placeholder="Ej. TRX-001"
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label>Monto *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.MOV_Monto_Origen}
                onChange={setText('MOV_Monto_Origen')}
                placeholder="0.00"
                disabled={saving}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Descripción *</label>
            <input
              value={form.MOV_Descripcion}
              onChange={setText('MOV_Descripcion')}
              placeholder="Descripción del movimiento"
              disabled={saving}
            />
          </div>

          {aplicaRecargoInfo && (
            <div
              style={{
                marginTop: 14,
                padding: '12px 14px',
                borderRadius: 8,
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: 13
              }}
            >
              Este movimiento puede generar recargo automático según la lógica del backend.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            Cancelar
          </button>

          <button
            className="btn-save"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            type="button"
          >
            {saving ? 'Guardando...' : 'Guardar movimiento'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MovimientoModal;