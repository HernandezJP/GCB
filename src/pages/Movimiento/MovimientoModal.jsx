import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ClipboardList } from 'lucide-react';
import {
  getDescripcion,
  getReferencia,
  getMonto,
  getCuenta,
  getPersona,
  getTipoId,
  getMedioId,
  getEstadoId
} from './MovimientoPage';

const INITIAL = {
  CUB_Cuenta: '',
  PER_Persona: '',
  TIM_Tipo_Movimiento: '',
  MEM_Medio_Movimiento: '',
  ESM_Estado_Movimiento: '',
  MOV_Numero_Referencia: '',
  MOV_Descripcion: '',
  MOV_Monto: ''
};

const MovimientoModal = ({
  isOpen,
  onClose,
  onSave,
  movimientoToEdit,
  tiposMovimiento,
  mediosMovimiento,
  estadosMovimiento
}) => {
  const [formData, setFormData] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        movimientoToEdit
          ? {
              CUB_Cuenta: getCuenta(movimientoToEdit),
              PER_Persona: getPersona(movimientoToEdit),
              TIM_Tipo_Movimiento: getTipoId(movimientoToEdit),
              MEM_Medio_Movimiento: getMedioId(movimientoToEdit),
              ESM_Estado_Movimiento: getEstadoId(movimientoToEdit),
              MOV_Numero_Referencia: getReferencia(movimientoToEdit),
              MOV_Descripcion: getDescripcion(movimientoToEdit),
              MOV_Monto: getMonto(movimientoToEdit)
            }
          : INITIAL
      );
    }
  }, [movimientoToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon"><ClipboardList size={20} /></div>
            <h2>{movimientoToEdit ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h2>
          </div>

          <button onClick={onClose} className="close-btn" disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!movimientoToEdit && (
              <>
                <div className="input-group">
                  <label htmlFor="cub-cuenta">Cuenta</label>
                  <input
                    id="cub-cuenta"
                    type="number"
                    required
                    value={formData.CUB_Cuenta}
                    onChange={set('CUB_Cuenta')}
                    placeholder="Ej. 1"
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="per-persona">Persona</label>
                  <input
                    id="per-persona"
                    type="number"
                    required
                    value={formData.PER_Persona}
                    onChange={set('PER_Persona')}
                    placeholder="Ej. 1"
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="tim-tipo">Tipo de Movimiento</label>
                  <select
                    id="tim-tipo"
                    required
                    value={formData.TIM_Tipo_Movimiento}
                    onChange={set('TIM_Tipo_Movimiento')}
                    disabled={saving}
                  >
                    <option value="">Seleccione...</option>
                    {tiposMovimiento.map((t) => (
                      <option key={t.TIM_Tipo_Movimiento} value={t.TIM_Tipo_Movimiento}>
                        {t.TIM_Descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="mem-medio">Medio de Movimiento</label>
                  <select
                    id="mem-medio"
                    required
                    value={formData.MEM_Medio_Movimiento}
                    onChange={set('MEM_Medio_Movimiento')}
                    disabled={saving}
                  >
                    <option value="">Seleccione...</option>
                    {mediosMovimiento.map((m) => (
                      <option key={m.MEM_Medio_Movimiento} value={m.MEM_Medio_Movimiento}>
                        {m.MEM_Descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="input-group">
              <label htmlFor="esm-estado">Estado de Movimiento</label>
              <select
                id="esm-estado"
                required
                value={formData.ESM_Estado_Movimiento}
                onChange={set('ESM_Estado_Movimiento')}
                disabled={saving}
              >
                <option value="">Seleccione...</option>
                {estadosMovimiento.map((e) => (
                  <option key={e.ESM_Estado_Movimiento} value={e.ESM_Estado_Movimiento}>
                    {e.ESM_Descripcion}
                  </option>
                ))}
              </select>
            </div>

            {!movimientoToEdit && (
              <>
                <div className="input-group">
                  <label htmlFor="mov-ref">Número de Referencia</label>
                  <input
                    id="mov-ref"
                    required
                    value={formData.MOV_Numero_Referencia}
                    onChange={set('MOV_Numero_Referencia')}
                    placeholder="Ej. REF-001"
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="mov-monto">Monto</label>
                  <input
                    id="mov-monto"
                    type="number"
                    step="0.01"
                    required
                    value={formData.MOV_Monto}
                    onChange={set('MOV_Monto')}
                    placeholder="Ej. 100.00"
                    disabled={saving}
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label htmlFor="mov-desc">Descripción</label>
              <input
                id="mov-desc"
                required
                value={formData.MOV_Descripcion}
                onChange={set('MOV_Descripcion')}
                placeholder="Ej. Depósito en efectivo"
                disabled={saving}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Guardando...' : movimientoToEdit ? 'Guardar Cambios' : 'Crear Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default MovimientoModal;