import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Shield } from "lucide-react";

import {
    getNombre,
    getDescripcion,
} from "./RolPage";

const INITIAL_FORM = {
    ROL_NOMBRE: "",
    ROL_DESCRIPCION: "",
};

export default function RolModal({
    isOpen,
    onClose,
    onSave,
    rolToEdit,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (rolToEdit) {
            setForm({
                ROL_NOMBRE: getNombre(rolToEdit),
                ROL_DESCRIPCION: getDescripcion(rolToEdit),
            });
        } else {
            setForm(INITIAL_FORM);
        }
    }, [isOpen, rolToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!form.ROL_NOMBRE.trim()) {
            alert("El nombre del rol es obligatorio.");
            return;
        }

        setSaving(true);

        try {
            await onSave(form);
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
                            <Shield size={20} />
                        </div>

                        <div>
                            <h2>{rolToEdit ? "Editar rol" : "Nuevo rol"}</h2>
                            <p>Administración de roles del sistema</p>
                        </div>
                    </div>

                    <button
                        className="close-btn"
                        onClick={onClose}
                        disabled={saving}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="input-group">
                        <label>Nombre del rol *</label>

                        <input
                            type="text"
                            value={form.ROL_NOMBRE}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    ROL_NOMBRE: e.target.value,
                                }))
                            }
                            placeholder="Ej. Administrador"
                            disabled={saving}
                        />
                    </div>

                    <div className="input-group">
                        <label>Descripción</label>

                        <input
                            type="text"
                            value={form.ROL_DESCRIPCION}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    ROL_DESCRIPCION: e.target.value,
                                }))
                            }
                            placeholder="Descripción del rol"
                            disabled={saving}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancelar
                    </button>

                    <button
                        className="btn-save"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}