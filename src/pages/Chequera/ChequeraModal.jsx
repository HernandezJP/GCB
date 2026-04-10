import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Check } from 'lucide-react';

export const getId = (c) => c?.chQ_Chequera ?? c?.CHQ_Chequera ?? c?.chq_Chequera ?? c?.chq_chequera;
export const getCuenta = (c) => c?.cuB_Cuenta ?? c?.CUB_Cuenta ?? c?.cub_Cuenta ?? c?.cub_cuenta;
export const getSerie = (c) => c?.chQ_Serie ?? c?.CHQ_Serie ?? c?.chq_Serie ?? c?.chq_serie ?? '';
export const getNumeroDesde = (c) => c?.chQ_Numero_Desde ?? c?.CHQ_Numero_Desde ?? c?.chq_Numero_Desde ?? c?.chq_numero_desde ?? 0;
export const getNumeroHasta = (c) => c?.chQ_Numero_Hasta ?? c?.CHQ_Numero_Hasta ?? c?.chq_Numero_Hasta ?? c?.chq_numero_hasta ?? 0;
export const getUltimoUsado = (c) => c?.chQ_Ultimo_Usado ?? c?.CHQ_Ultimo_Usado ?? c?.chq_Ultimo_Usado ?? c?.chq_ultimo_usado ?? 0;
export const getEstado = (c) => c?.chQ_Estado ?? c?.CHQ_Estado ?? c?.chq_Estado ?? c?.chq_estado ?? 'I';
export const getFechaRecepcion = (c) => c?.chQ_Fecha_Recepcion ?? c?.CHQ_Fecha_Recepcion ?? c?.chq_Fecha_Recepcion ?? c?.chq_fecha_recepcion ?? '';
export const getFechaCreacion = (c) => c?.chQ_Fecha_Creacion ?? c?.CHQ_Fecha_Creacion ?? c?.chq_Fecha_Creacion ?? c?.chq_fecha_creacion ?? '';

export const isActiva = (c) => getEstado(c) === 'A';

const INITIAL = {
  CUB_Cuenta: '',
  CHQ_Serie: '',
  CHQ_Numero_Desde: '',
  CHQ_Numero_Hasta: '',
  CHQ_Ultimo_Usado: 0,
  CHQ_Estado: 'A',
  CHQ_Fecha_Recepcion: ''
};

const ChequeraModal = ({ isOpen, onClose, onSave, chequeraToEdit }) => {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (chequeraToEdit) {
      setForm({
        CUB_Cuenta: String(getCuenta(chequeraToEdit) ?? ''),
        CHQ_Serie: getSerie(chequeraToEdit),
        CHQ_Numero_Desde: getNumeroDesde(chequeraToEdit),
        CHQ_Numero_Hasta: getNumeroHasta(chequeraToEdit),
        CHQ_Ultimo_Usado: getUltimoUsado(chequeraToEdit),
        CHQ_Estado: getEstado(chequeraToEdit),
        CHQ_Fecha_Recepcion: String(getFechaRecepcion(chequeraToEdit)).split('T')[0]
      });
    } else {
      setForm(INITIAL);
    }
  }, [isOpen, chequeraToEdit]);

  if (!isOpen) return null;

  const setText = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const valido =
    Number(form.CUB_Cuenta) > 0 &&
    form.CHQ_Serie.trim() !== '' &&
    Number(form.CHQ_Numero_Desde) > 0 &&
    Number(form.CHQ_Numero_Hasta) > 0 &&
    Number(form.CHQ_Numero_Hasta) >= Number(form.CHQ_Numero_Desde) &&
    form.CHQ_Fecha_Recepcion;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        CUB_Cuenta: Number(form.CUB_Cuenta),
        CHQ_Serie: form.CHQ_Serie,
        CHQ_Numero_Desde: Number(form.CHQ_Numero_Desde),
        CHQ_Numero_Hasta: Number(form.CHQ_Numero_Hasta),
        CHQ_Ultimo_Usado: Number(form.CHQ_Ultimo_Usado || 0),
        CHQ_Estado: form.CHQ_Estado,
        CHQ_Fecha_Recepcion: form.CHQ_Fecha_Recepcion
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
            <div className="modal-icon"><BookOpen size={20} /></div>
            <div>
              <h2>{chequeraToEdit ? 'Editar chequera' : 'Nueva chequera'}</h2>
              <p>Gestiona la información de la chequera</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="input-group">
              <label>Cuenta *</label>
              <input
                type="number"
                value={form.CUB_Cuenta}
                onChange={setText('CUB_Cuenta')}
                placeholder="Id de cuenta"
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label>Serie *</label>
              <input
                value={form.CHQ_Serie}
                onChange={setText('CHQ_Serie')}
                placeholder="Ej. A001"
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Número desde *</label>
              <input
                type="number"
                value={form.CHQ_Numero_Desde}
                onChange={setText('CHQ_Numero_Desde')}
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label>Número hasta *</label>
              <input
                type="number"
                value={form.CHQ_Numero_Hasta}
                onChange={setText('CHQ_Numero_Hasta')}
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Último usado</label>
              <input
                type="number"
                value={form.CHQ_Ultimo_Usado}
                onChange={setText('CHQ_Ultimo_Usado')}
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label>Estado *</label>
              <select value={form.CHQ_Estado} onChange={setText('CHQ_Estado')} disabled={saving}>
                <option value="A">Activa</option>
                <option value="I">Inactiva</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Fecha recepción *</label>
            <input
              type="date"
              value={form.CHQ_Fecha_Recepcion}
              onChange={setText('CHQ_Fecha_Recepcion')}
              disabled={saving}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Cancelar
          </button>

          <button className="btn-save" onClick={handleSubmit} disabled={saving || !valido}>
            <Check size={14} />
            {chequeraToEdit ? 'Guardar cambios' : 'Crear chequera'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChequeraModal;