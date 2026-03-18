import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin } from 'lucide-react';
import { getDescripcion, getEstado } from './TipoDireccionPage';

const INITIAL = {
  TDI_Descripcion: '',
  TDI_Estado: 'A',
};

const TipoDireccionModal = ({ isOpen, onClose, onSave, tipoToEdit }) => {
  const [formData, setFormData] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        tipoToEdit
          ? {
              TDI_Descripcion: getDescripcion(tipoToEdit),
              TDI_Estado: getEstado(tipoToEdit),
            }
          : INITIAL
      );
    }
  }, [tipoToEdit, isOpen]);

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

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <MapPin size={20} />
            </div>
            <h2>{tipoToEdit ? 'Editar Tipo de Dirección' : 'Nuevo Tipo de Dirección'}</h2>
          </div>

          <button type="button" onClick={onClose} className="close-btn" disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group">
              <label htmlFor="tdi-desc">
                <MapPin size={13} />
                Descripción
              </label>
              <input
                id="tdi-desc"
                type="text"
                required
                value={formData.TDI_Descripcion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    TDI_Descripcion: e.target.value,
                  })
                }
                placeholder="Ej. Casa, Oficina, Facturación"
                disabled={saving}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>

            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Guardando...' : tipoToEdit ? 'Guardar Cambios' : 'Crear Tipo'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TipoDireccionModal;