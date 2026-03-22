//modal
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText } from 'lucide-react';
import { getDescripcion } from './EstadoConciliacionPage';

const INITIAL = { ECO_Descripcion: '' };

const EstadoConciliacionModal = ({ isOpen, onClose, onSave, estadoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving,   setSaving]   = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                estadoToEdit
                    ? { ECO_Descripcion: getDescripcion(estadoToEdit) }
                    : INITIAL
            );
        }
    }, [estadoToEdit, isOpen]);

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
                            <FileText size={20} />
                        </div>
                        <h2>{estadoToEdit ? 'Editar Estado de Conciliacion' : 'Nuevo Estado de Conciliacion'}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="esc-desc">
                                <FileText size={13} />
                                Descripción
                            </label>
                            <input
                                id="esc-desc"
                                required
                                value={formData.ECO_Descripcion}
                                onChange={e => setFormData({ ECO_Descripcion: e.target.value })}
                                placeholder="Ej. Conciliada"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Guardando...' : estadoToEdit ? 'Guardar Cambios' : 'Crear Estado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EstadoConciliacionModal;