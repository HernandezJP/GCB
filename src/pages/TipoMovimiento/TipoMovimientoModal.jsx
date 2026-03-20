import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shuffle } from 'lucide-react';
import { getDescripcion } from './TipoMovimientoPage';

const INITIAL = { TIM_Descripcion: '' };

const TipoMovimientoModal = ({ isOpen, onClose, onSave, movimientoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving,   setSaving]   = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                movimientoToEdit
                    ? { TIM_Descripcion: getDescripcion(movimientoToEdit) }
                    : INITIAL
            );
        }
    }, [movimientoToEdit, isOpen]);

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
                        <div className="modal-icon"><Shuffle size={20} /></div>
                        <h2>{movimientoToEdit ? 'Editar Tipo de Movimiento' : 'Nuevo Tipo de Movimiento'}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="tim-desc">
                                <Shuffle size={13} /> Descripción
                            </label>
                            <input
                                id="tim-desc"
                                required
                                value={formData.TIM_Descripcion}
                                onChange={set('TIM_Descripcion')}
                                placeholder="Ej. Ingreso, Egreso..."
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Guardando...' : movimientoToEdit ? 'Guardar Cambios' : 'Crear Tipo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default TipoMovimientoModal;