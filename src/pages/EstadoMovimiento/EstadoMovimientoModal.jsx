import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag } from 'lucide-react';
import { getDescripcion } from './EstadoMovimientoPage';

const INITIAL = { ESM_Descripcion: '' };

const EstadoMovimientoModal = ({ isOpen, onClose, onSave, estadoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving,   setSaving]   = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                estadoToEdit
                    ? { ESM_Descripcion: getDescripcion(estadoToEdit) }
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

    const set = (field) => (e) =>
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon"><Tag size={20} /></div>
                        <h2>{estadoToEdit ? 'Editar Estado de Movimiento' : 'Nuevo Estado de Movimiento'}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="esm-desc">
                                <Tag size={13} /> Descripción
                            </label>
                            <input
                                id="esm-desc"
                                required
                                value={formData.ESM_Descripcion}
                                onChange={set('ESM_Descripcion')}
                                placeholder="Ej. Pendiente"
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

export default EstadoMovimientoModal;