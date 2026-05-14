import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Users } from "lucide-react";

import {
    getRolId,
    getPrimerNombre,
    getSegundoNombre,
    getPrimerApellido,
    getSegundoApellido,
    getEmail,
} from "./UsuarioPage";

const INITIAL_FORM = {
    ROL_ROL: "",
    USU_PRIMER_NOMBRE: "",
    USU_SEGUNDO_NOMBRE: "",
    USU_PRIMER_APELLIDO: "",
    USU_SEGUNDO_APELLIDO: "",
    USU_EMAIL: "",
    USU_PASSWORD: "",
};

const getRolCatalogoId = (r) =>
    r?.roL_ROL ?? r?.rOL_ROL ?? r?.ROL_ROL ?? 0;

const getRolCatalogoNombre = (r) =>
    r?.roL_NOMBRE ?? r?.rOL_NOMBRE ?? r?.ROL_NOMBRE ?? "";

const getRolCatalogoEstado = (r) =>
    r?.roL_ESTADO ?? r?.rOL_ESTADO ?? r?.ROL_ESTADO ?? "A";

export default function UsuarioModal({
    isOpen,
    onClose,
    onSave,
    usuarioToEdit,
    roles = [],
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (usuarioToEdit) {
            setForm({
                ROL_ROL: String(getRolId(usuarioToEdit) ?? ""),
                USU_PRIMER_NOMBRE: getPrimerNombre(usuarioToEdit),
                USU_SEGUNDO_NOMBRE: getSegundoNombre(usuarioToEdit),
                USU_PRIMER_APELLIDO: getPrimerApellido(usuarioToEdit),
                USU_SEGUNDO_APELLIDO: getSegundoApellido(usuarioToEdit),
                USU_EMAIL: getEmail(usuarioToEdit),
                USU_PASSWORD: "",
            });
        } else {
            setForm(INITIAL_FORM);
        }
    }, [isOpen, usuarioToEdit]);

    if (!isOpen) return null;

    const setText = (key) => (e) => {
        setForm((prev) => ({
            ...prev,
            [key]: e.target.value,
        }));
    };

    const handleSubmit = async () => {
        if (!form.ROL_ROL) {
            alert("Debes seleccionar un rol.");
            return;
        }

        if (!form.USU_PRIMER_NOMBRE.trim()) {
            alert("El primer nombre es obligatorio.");
            return;
        }

        if (!form.USU_PRIMER_APELLIDO.trim()) {
            alert("El primer apellido es obligatorio.");
            return;
        }

        if (!form.USU_EMAIL.trim()) {
            alert("El correo electrónico es obligatorio.");
            return;
        }

        if (!usuarioToEdit && !form.USU_PASSWORD.trim()) {
            alert("La contraseña es obligatoria.");
            return;
        }

        setSaving(true);

        try {
            await onSave(form);
        } finally {
            setSaving(false);
        }
    };

    const rolesActivos = roles.filter((r) => getRolCatalogoEstado(r) === "A");

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon">
                            <Users size={20} />
                        </div>

                        <div>
                            <h2>{usuarioToEdit ? "Editar usuario" : "Nuevo usuario"}</h2>
                            <p>Administración de usuarios del sistema</p>
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
                        <label>Rol *</label>

                        <select
                            value={form.ROL_ROL}
                            onChange={setText("ROL_ROL")}
                            disabled={saving}
                        >
                            <option value="">Seleccionar rol...</option>

                            {rolesActivos.map((rol) => (
                                <option
                                    key={getRolCatalogoId(rol)}
                                    value={String(getRolCatalogoId(rol))}
                                >
                                    {getRolCatalogoNombre(rol)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>Primer nombre *</label>
                            <input
                                value={form.USU_PRIMER_NOMBRE}
                                onChange={setText("USU_PRIMER_NOMBRE")}
                                placeholder="Primer nombre"
                                disabled={saving}
                            />
                        </div>

                        <div className="input-group">
                            <label>Segundo nombre</label>
                            <input
                                value={form.USU_SEGUNDO_NOMBRE}
                                onChange={setText("USU_SEGUNDO_NOMBRE")}
                                placeholder="Segundo nombre"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>Primer apellido *</label>
                            <input
                                value={form.USU_PRIMER_APELLIDO}
                                onChange={setText("USU_PRIMER_APELLIDO")}
                                placeholder="Primer apellido"
                                disabled={saving}
                            />
                        </div>

                        <div className="input-group">
                            <label>Segundo apellido</label>
                            <input
                                value={form.USU_SEGUNDO_APELLIDO}
                                onChange={setText("USU_SEGUNDO_APELLIDO")}
                                placeholder="Segundo apellido"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Correo electrónico *</label>
                        <input
                            type="email"
                            value={form.USU_EMAIL}
                            onChange={setText("USU_EMAIL")}
                            placeholder="usuario@correo.com"
                            disabled={saving}
                        />
                    </div>

                    <div className="input-group">
                        <label>
                            {usuarioToEdit
                                ? "Nueva contraseña"
                                : "Contraseña *"}
                        </label>

                        <input
                            type="password"
                            value={form.USU_PASSWORD}
                            onChange={setText("USU_PASSWORD")}
                            placeholder={
                                usuarioToEdit
                                    ? "Dejar vacío para no cambiar"
                                    : "Contraseña"
                            }
                            disabled={saving}
                        />
                    </div>

                    {usuarioToEdit && (
                        <div className="usuario-password-note">
                            Si no deseas cambiar la contraseña, deja este campo vacío.
                        </div>
                    )}
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