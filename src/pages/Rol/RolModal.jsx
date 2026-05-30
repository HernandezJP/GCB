import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Shield,
    Save,
    CircleX,
    AlertCircle
} from "lucide-react";

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

    const [nombreError, setNombreError] = useState(false);
    const [descripcionError, setDescripcionError] = useState(false);

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

        setNombreError(false);
        setDescripcionError(false);

    }, [isOpen, rolToEdit]);

    if (!isOpen) return null;

    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

    const handleSubmit = async () => {
        const nombre = form.ROL_NOMBRE.trim();
        const descripcion = form.ROL_DESCRIPCION.trim();

        if (!nombre) {
            alert("El nombre del rol es obligatorio.");
            return;
        }

        if (!soloLetras.test(nombre)) {
            alert(
                "El nombre del rol solo puede contener letras y espacios."
            );
            return;
        }

        if (
            descripcion &&
            !soloLetras.test(descripcion)
        ) {
            alert(
                "La descripción solo puede contener letras y espacios."
            );
            return;
        }

        setSaving(true);

        try {
            await onSave({
                ROL_NOMBRE: nombre,
                ROL_DESCRIPCION: descripcion,
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
                        <div className="modal-icon">
                            <Shield size={20} />
                        </div>

                        <div>
                            <h2>
                                {rolToEdit
                                    ? "Editar rol"
                                    : "Nuevo rol"}
                            </h2>
                            <p>
                                Administración de roles del sistema
                            </p>
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
                    {/* NOMBRE */}
                    <div className="input-group">
                        <label>Nombre del rol *</label>

                        <input
                            type="text"
                            value={form.ROL_NOMBRE}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (soloLetras.test(value)) {
                                    setForm((prev) => ({
                                        ...prev,
                                        ROL_NOMBRE: value,
                                    }));

                                    setNombreError(false);
                                } else {
                                    setNombreError(true);
                                }
                            }}
                            placeholder="Ej. Administrador"
                            disabled={saving}
                        />

                        {nombreError && (
                            <small
                                style={{
                                    color: "#ef4444",
                                    fontSize: "12px",
                                    marginTop: "5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}
                            >
                                <AlertCircle size={12} />
                                Solo se permiten letras y espacios.
                            </small>
                        )}
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="input-group">
                        <label>Descripción</label>

                        <input
                            type="text"
                            value={form.ROL_DESCRIPCION}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (soloLetras.test(value)) {
                                    setForm((prev) => ({
                                        ...prev,
                                        ROL_DESCRIPCION: value,
                                    }));

                                    setDescripcionError(false);
                                } else {
                                    setDescripcionError(true);
                                }
                            }}
                            placeholder="Descripción del rol"
                            disabled={saving}
                        />

                        {descripcionError && (
                            <small
                                style={{
                                    color: "#ef4444",
                                    fontSize: "12px",
                                    marginTop: "5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}
                            >
                                <AlertCircle size={12} />
                                Solo se permiten letras y espacios.
                            </small>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={saving}
                    >
                        <CircleX size={16} />
                        Cancelar
                    </button>

                    <button
                        className="btn-save"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}