import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeftRight } from 'lucide-react';
import { getDescripcion } from './MedioMovimientoPage';

const INITIAL = { MEM_Descripcion: '' };

const MedioMovimientoModal = ({ isOpen, onClose, onSave, medioToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving,   setSaving]   = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                medioToEdit
                    ? { MEM_Descripcion: getDescripcion(medioToEdit) }
                    : INITIAL
            );
        }
    }, [medioToEdit, isOpen]);

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
                        <div className="modal-icon"><ArrowLeftRight size={20} /></div>
                        <h2>{medioToEdit ? 'Editar Medio de Movimiento' : 'Nuevo Medio de Movimiento'}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="mem-desc">
                                <ArrowLeftRight size={13} /> Descripción
                            </label>
                            <input
                                id="mem-desc"
                                required
                                value={formData.MEM_Descripcion}
                                onChange={set('MEM_Descripcion')}
                                placeholder="Ej. Efectivo"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Guardando...' : medioToEdit ? 'Guardar Cambios' : 'Crear Medio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default MedioMovimientoModal;  