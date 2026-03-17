import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard } from 'lucide-react';
import { getDescripcion } from './TipoCuentaPage';

const INITIAL = { TCU_Descripcion: '' };

const TipoCuentaModal = ({ isOpen, onClose, onSave, tipoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                tipoToEdit
                    ? { TCU_Descripcion: getDescripcion(tipoToEdit) }
                    : INITIAL
            );
        }
    }, [tipoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(formData); }
        finally { setSaving(false); }
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon">
                            <CreditCard size={20} />
                        </div>
                        <h2>{tipoToEdit ? 'Editar Tipo de Cuenta' : 'Nuevo Tipo de Cuenta'}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="tcu-desc">
                                <CreditCard size={13} />
                                Descripción
                            </label>
                            <input
                                id="tcu-desc"
                                required
                                value={formData.TCU_Descripcion}
                                onChange={e => setFormData({ TCU_Descripcion: e.target.value })}
                                placeholder="Ej. Cuenta de Ahorro"
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

export default TipoCuentaModal;