import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Coins, Tag } from 'lucide-react';
import { getDescripcion, getSimbolo } from './TipoMonedaPage';

const INITIAL = { TMO_Descripcion: '', TMO_Simbolo: '' };

const TipoMonedaModal = ({ isOpen, onClose, onSave, monedaToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving,   setSaving]   = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                monedaToEdit
                    ? { TMO_Descripcion: getDescripcion(monedaToEdit), TMO_Simbolo: getSimbolo(monedaToEdit) }
                    : INITIAL
            );
        }
    }, [monedaToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(formData); }
        finally { setSaving(false); }
    };

    const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon"><Coins size={20} /></div>
                        <h2>{monedaToEdit ? 'Editar Tipo de Moneda' : 'Nuevo Tipo de Moneda'}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="tmo-desc">
                                <Coins size={13} /> Descripción
                            </label>
                            <input
                                id="tmo-desc"
                                required
                                value={formData.TMO_Descripcion}
                                onChange={set('TMO_Descripcion')}
                                placeholder="Ej. Quetzal"
                                disabled={saving}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="tmo-simbolo">
                                <Tag size={13} /> Símbolo
                            </label>
                            <input
                                id="tmo-simbolo"
                                required
                                value={formData.TMO_Simbolo}
                                onChange={set('TMO_Simbolo')}
                                placeholder="Ej. Q, $, €, £"
                                maxLength={10}
                                disabled={saving}
                                style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '1px' }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Guardando...' : monedaToEdit ? 'Guardar Cambios' : 'Crear Moneda'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default TipoMonedaModal;