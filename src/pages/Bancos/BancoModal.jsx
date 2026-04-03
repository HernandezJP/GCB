import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Hash } from 'lucide-react';
import { getNombre, getSwift } from './BancoPage';

const INITIAL = { BAN_Nombre: '', BAN_Codigo_Swift: '' };

const BancoModal = ({ isOpen, onClose, onSave, bancoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving,   setSaving]   = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                bancoToEdit
                    ? {
                        // Usar helpers para leer el casing real de la API
                        BAN_Nombre:       getNombre(bancoToEdit),
                        BAN_Codigo_Swift: getSwift(bancoToEdit),
                      }
                    : INITIAL
            );
        }
    }, [bancoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(formData); }
        finally { setSaving(false); }
    };

    const set = (field) => (e) =>
        setFormData(prev => ({ ...prev, [field]: e.target.value }));

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon">
                            <Building2 size={20} />
                        </div>
                        <h2>{bancoToEdit ? 'Editar Banco' : 'Nuevo Banco'}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="ban-nombre">
                                <Building2 size={13} />
                                Nombre del Banco
                            </label>
                            <input
                                id="ban-nombre"
                                required
                                value={formData.BAN_Nombre}
                                onChange={set('BAN_Nombre')}
                                placeholder="Ej. Banco Industrial"
                                disabled={saving}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="ban-swift">
                                <Hash size={13} />
                                Código SWIFT / BIC
                            </label>
                            <input
                                id="ban-swift"
                                required
                                value={formData.BAN_Codigo_Swift}
                                onChange={set('BAN_Codigo_Swift')}
                                placeholder="Ej. BINDGTGX"
                                maxLength={11}
                                style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '1px' }}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Guardando...' : bancoToEdit ? 'Guardar Cambios' : 'Crear Banco'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default BancoModal;