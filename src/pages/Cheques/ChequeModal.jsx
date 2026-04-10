import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Check } from 'lucide-react';

export const getId = (c) => c?.chE_Cheque ?? c?.CHE_Cheque ?? c?.che_Cheque ?? c?.che_cheque;
export const getMovimiento = (c) => c?.moV_Movimiento ?? c?.MOV_Movimiento ?? c?.mov_Movimiento ?? c?.mov_movimiento ?? '';
export const getNumeroCheque = (c) => c?.chE_Numero_Cheque ?? c?.CHE_Numero_Cheque ?? c?.che_Numero_Cheque ?? c?.che_numero_cheque ?? '';
export const getMontoLetras = (c) => c?.chE_Monto_Letras ?? c?.CHE_Monto_Letras ?? c?.che_Monto_Letras ?? c?.che_monto_letras ?? '';
export const getFechaEmision = (c) => c?.chE_Fecha_Emision ?? c?.CHE_Fecha_Emision ?? c?.che_Fecha_Emision ?? c?.che_fecha_emision ?? '';
export const getFechaCobro = (c) => c?.chE_Fecha_Cobro ?? c?.CHE_Fecha_Cobro ?? c?.che_Fecha_Cobro ?? c?.che_fecha_cobro ?? '';
export const getFechaVencimiento = (c) => c?.chE_Fecha_Vencimiento ?? c?.CHE_Fecha_Vencimiento ?? c?.che_Fecha_Vencimiento ?? c?.che_fecha_vencimiento ?? '';
export const getEstadoCheque = (c) => c?.esC_Estado_Cheque ?? c?.ESC_Estado_Cheque ?? c?.esc_Estado_Cheque ?? c?.esc_estado_cheque ?? '';
export const getChequera = (c) => c?.chQ_Chequera ?? c?.CHQ_Chequera ?? c?.chq_Chequera ?? c?.chq_chequera ?? '';
export const getBeneficiario = (c) => c?.chE_Beneficiario ?? c?.CHE_Beneficiario ?? c?.che_Beneficiario ?? c?.che_beneficiario ?? '';
export const getConcepto = (c) => c?.chE_Concepto ?? c?.CHE_Concepto ?? c?.che_Concepto ?? c?.che_concepto ?? '';

const INITIAL = {
  MOV_Movimiento: '',
  CHE_Numero_Cheque: '',
  CHE_Monto_Letras: '',
  CHE_Fecha_Emision: '',
  CHE_Fecha_Cobro: '',
  CHE_Fecha_Vencimiento: '',
  ESC_Estado_Cheque: '',
  CHQ_Chequera: '',
  CHE_Beneficiario: '',
  CHE_Concepto: ''
};

const ChequeModal = ({ isOpen, onClose, onSave, chequeToEdit }) => {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (chequeToEdit) {
      setForm({
        MOV_Movimiento: String(getMovimiento(chequeToEdit) ?? ''),
        CHE_Numero_Cheque: getNumeroCheque(chequeToEdit),
        CHE_Monto_Letras: getMontoLetras(chequeToEdit),
        CHE_Fecha_Emision: String(getFechaEmision(chequeToEdit)).split('T')[0] || '',
        CHE_Fecha_Cobro: String(getFechaCobro(chequeToEdit)).split('T')[0] || '',
        CHE_Fecha_Vencimiento: String(getFechaVencimiento(chequeToEdit)).split('T')[0] || '',
        ESC_Estado_Cheque: String(getEstadoCheque(chequeToEdit) ?? ''),
        CHQ_Chequera: String(getChequera(chequeToEdit) ?? ''),
        CHE_Beneficiario: getBeneficiario(chequeToEdit),
        CHE_Concepto: getConcepto(chequeToEdit)
      });
    } else {
      setForm(INITIAL);
    }
  }, [isOpen, chequeToEdit]);

  if (!isOpen) return null;

  const setText = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const valido =
    Number(form.MOV_Movimiento) > 0 &&
    Number(form.CHQ_Chequera) > 0 &&
    form.CHE_Numero_Cheque.trim() !== '' &&
    Number(form.ESC_Estado_Cheque) > 0;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        MOV_Movimiento: Number(form.MOV_Movimiento),
        CHE_Numero_Cheque: form.CHE_Numero_Cheque,
        CHE_Monto_Letras: form.CHE_Monto_Letras,
        CHE_Fecha_Emision: form.CHE_Fecha_Emision || null,
        CHE_Fecha_Cobro: form.CHE_Fecha_Cobro || null,
        CHE_Fecha_Vencimiento: form.CHE_Fecha_Vencimiento || null,
        ESC_Estado_Cheque: Number(form.ESC_Estado_Cheque),
        CHQ_Chequera: Number(form.CHQ_Chequera),
        CHE_Beneficiario: form.CHE_Beneficiario,
        CHE_Concepto: form.CHE_Concepto
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
            <div className="modal-icon"><FileText size={20} /></div>
            <div>
              <h2>{chequeToEdit ? 'Editar cheque' : 'Nuevo cheque'}</h2>
              <p>Gestiona la información del cheque</p>
            </div>
          </div>

          <button className="close-btn" onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="input-group">
              <label>Movimiento *</label>
              <input
                type="number"
                value={form.MOV_Movimiento}
                onChange={setText('MOV_Movimiento')}
                placeholder="Id del movimiento"
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label>Chequera *</label>
              <input
                type="number"
                value={form.CHQ_Chequera}
                onChange={setText('CHQ_Chequera')}
                placeholder="Id de chequera"
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Número cheque *</label>
              <input
                value={form.CHE_Numero_Cheque}
                onChange={setText('CHE_Numero_Cheque')}
                placeholder="Ej. 000123"
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label>Estado cheque *</label>
              <input
                type="number"
                value={form.ESC_Estado_Cheque}
                onChange={setText('ESC_Estado_Cheque')}
                placeholder="Id estado"
                disabled={saving}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Beneficiario</label>
            <input
              value={form.CHE_Beneficiario}
              onChange={setText('CHE_Beneficiario')}
              placeholder="Nombre del beneficiario"
              disabled={saving}
            />
          </div>

          <div className="input-group">
            <label>Concepto</label>
            <input
              value={form.CHE_Concepto}
              onChange={setText('CHE_Concepto')}
              placeholder="Concepto del cheque"
              disabled={saving}
            />
          </div>

          <div className="input-group">
            <label>Monto en letras</label>
            <input
              value={form.CHE_Monto_Letras}
              onChange={setText('CHE_Monto_Letras')}
              placeholder="Ej. Cien quetzales exactos"
              disabled={saving}
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Fecha emisión</label>
              <input
                type="date"
                value={form.CHE_Fecha_Emision}
                onChange={setText('CHE_Fecha_Emision')}
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label>Fecha cobro</label>
              <input
                type="date"
                value={form.CHE_Fecha_Cobro}
                onChange={setText('CHE_Fecha_Cobro')}
                disabled={saving}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Fecha vencimiento</label>
            <input
              type="date"
              value={form.CHE_Fecha_Vencimiento}
              onChange={setText('CHE_Fecha_Vencimiento')}
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
            {chequeToEdit ? 'Guardar cambios' : 'Crear cheque'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChequeModal;