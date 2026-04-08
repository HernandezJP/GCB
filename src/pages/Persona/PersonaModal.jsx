import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, User, Check, ArrowLeft, ChevronRight } from "lucide-react";

const INITIAL_FORM = {
  TIP_Tipo_Persona: "",
  PER_Primer_Nombre: "",
  PER_Segundo_Nombre: "",
  PER_Primer_Apellido: "",
  PER_Segundo_Apellido: "",
  PER_Razon_Social: "",
  PER_NIT: "",
  PER_DPI: "",
  PER_Estado: "A",
  Telefonos: [
    {
      TIT_Tipo_Telefono: "",
      TEP_Numero: "",
      TEP_Principal: "S",
      TEP_Estado: "A",
    },
  ],
  Direcciones: [
    {
      TDI_Tipo_Direccion: "",
      DIR_Departamento: "",
      DIR_Municipio: "",
      DIR_Colonia: "",
      DIR_Zona: "",
      DIR_Numero_Casa: "",
      DIR_Detalle: "",
      DIR_Principal: "S",
    },
  ],
};

const STEPS = ["Datos básicos", "Contacto", "Confirmar"];

const getTipoPersonaId = (t) =>
  t?.tiP_Tipo_Persona ?? t?.TIP_Tipo_Persona ?? t?.tip_Tipo_Persona ?? 0;

const getTipoPersonaDesc = (t) =>
  t?.tiP_Descripcion ?? t?.TIP_Descripcion ?? t?.tip_Descripcion ?? "";

const getTipoTelefonoId = (t) =>
  t?.tiT_Tipo_Telefono ?? t?.TIT_Tipo_Telefono ?? t?.tit_Tipo_Telefono ?? 0;

const getTipoTelefonoDesc = (t) =>
  t?.tiT_Descripcion ?? t?.TIT_Descripcion ?? t?.tit_Descripcion ?? "";

const getTipoDireccionId = (t) =>
  t?.tdI_Tipo_Direccion ?? t?.TDI_Tipo_Direccion ?? t?.tdi_Tipo_Direccion ?? 0;

const getTipoDireccionDesc = (t) =>
  t?.tdI_Descripcion ?? t?.TDI_Descripcion ?? t?.tdi_Descripcion ?? "";

const PersonaModal = ({
  isOpen,
  onClose,
  onSave,
  personaToEdit,
  tiposPersona = [],
  tiposTelefono = [],
  tiposDireccion = []
}) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!isOpen) return;

    if (personaToEdit) {
      const telefonos = personaToEdit?.telefonos ?? personaToEdit?.Telefonos ?? [];
      const direcciones = personaToEdit?.direcciones ?? personaToEdit?.Direcciones ?? [];

      setForm({
        TIP_Tipo_Persona:
          personaToEdit?.tiP_Tipo_Persona ??
          personaToEdit?.TIP_Tipo_Persona ??
          "",

        PER_Primer_Nombre:
          personaToEdit?.peR_Primer_Nombre ??
          personaToEdit?.PER_Primer_Nombre ??
          "",

        PER_Segundo_Nombre:
          personaToEdit?.peR_Segundo_Nombre ??
          personaToEdit?.PER_Segundo_Nombre ??
          "",

        PER_Primer_Apellido:
          personaToEdit?.peR_Primer_Apellido ??
          personaToEdit?.PER_Primer_Apellido ??
          "",

        PER_Segundo_Apellido:
          personaToEdit?.peR_Segundo_Apellido ??
          personaToEdit?.PER_Segundo_Apellido ??
          "",

        PER_Razon_Social:
          personaToEdit?.peR_Razon_Social ??
          personaToEdit?.PER_Razon_Social ??
          "",

        PER_NIT:
          personaToEdit?.peR_NIT ??
          personaToEdit?.PER_NIT ??
          "",

        PER_DPI:
          personaToEdit?.peR_DPI ??
          personaToEdit?.PER_DPI ??
          "",

        PER_Estado:
          personaToEdit?.peR_Estado ??
          personaToEdit?.PER_Estado ??
          "A",

        Telefonos:
          telefonos.length > 0
            ? telefonos.map((t) => ({
                TIT_Tipo_Telefono:
                  t?.tiT_Tipo_Telefono ??
                  t?.TIT_Tipo_Telefono ??
                  "",
                TEP_Numero: t?.teP_Numero ?? t?.TEP_Numero ?? "",
                TEP_Principal: t?.teP_Principal ?? t?.TEP_Principal ?? "N",
                TEP_Estado: t?.teP_Estado ?? t?.TEP_Estado ?? "A",
              }))
            : [
                {
                  TIT_Tipo_Telefono: tiposTelefono[0] ? getTipoTelefonoId(tiposTelefono[0]) : "",
                  TEP_Numero: "",
                  TEP_Principal: "S",
                  TEP_Estado: "A",
                },
              ],

        Direcciones:
          direcciones.length > 0
            ? direcciones.map((d) => ({
                TDI_Tipo_Direccion:
                  d?.tdI_Tipo_Direccion ??
                  d?.TDI_Tipo_Direccion ??
                  "",
                DIR_Departamento: d?.diR_Departamento ?? d?.DIR_Departamento ?? "",
                DIR_Municipio: d?.diR_Municipio ?? d?.DIR_Municipio ?? "",
                DIR_Colonia: d?.diR_Colonia ?? d?.DIR_Colonia ?? "",
                DIR_Zona: d?.diR_Zona ?? d?.DIR_Zona ?? "",
                DIR_Numero_Casa: d?.diR_Numero_Casa ?? d?.DIR_Numero_Casa ?? "",
                DIR_Detalle: d?.diR_Detalle ?? d?.DIR_Detalle ?? "",
                DIR_Principal: d?.diR_Principal ?? d?.DIR_Principal ?? "N",
              }))
            : [
                {
                  TDI_Tipo_Direccion: tiposDireccion[0] ? getTipoDireccionId(tiposDireccion[0]) : "",
                  DIR_Departamento: "",
                  DIR_Municipio: "",
                  DIR_Colonia: "",
                  DIR_Zona: "",
                  DIR_Numero_Casa: "",
                  DIR_Detalle: "",
                  DIR_Principal: "S",
                },
              ],
      });
    } else {
      setForm({
        ...INITIAL_FORM,
        TIP_Tipo_Persona: tiposPersona[0] ? getTipoPersonaId(tiposPersona[0]) : "",
        Telefonos: [
          {
            TIT_Tipo_Telefono: tiposTelefono[0] ? getTipoTelefonoId(tiposTelefono[0]) : "",
            TEP_Numero: "",
            TEP_Principal: "S",
            TEP_Estado: "A",
          },
        ],
        Direcciones: [
          {
            TDI_Tipo_Direccion: tiposDireccion[0] ? getTipoDireccionId(tiposDireccion[0]) : "",
            DIR_Departamento: "",
            DIR_Municipio: "",
            DIR_Colonia: "",
            DIR_Zona: "",
            DIR_Numero_Casa: "",
            DIR_Detalle: "",
            DIR_Principal: "S",
          },
        ],
      });
    }

    setStep(0);
  }, [isOpen, personaToEdit, tiposPersona, tiposTelefono, tiposDireccion]);

  if (!isOpen) return null;

  const setText = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const updateTelefono = (index, key, value) => {
    setForm((prev) => {
      const nuevos = [...prev.Telefonos];
      nuevos[index] = { ...nuevos[index], [key]: value };
      return { ...prev, Telefonos: nuevos };
    });
  };

  const updateDireccion = (index, key, value) => {
    setForm((prev) => {
      const nuevas = [...prev.Direcciones];
      nuevas[index] = { ...nuevas[index], [key]: value };
      return { ...prev, Direcciones: nuevas };
    });
  };

  const ok0 =
    String(form.TIP_Tipo_Persona).trim() !== "" &&
    form.PER_Primer_Nombre.trim() !== "" &&
    form.PER_Primer_Apellido.trim() !== "";

  const ok1 =
    form.Telefonos.length > 0 &&
    form.Direcciones.length > 0 &&
    String(form.Telefonos[0]?.TIT_Tipo_Telefono ?? "").trim() !== "" &&
    (form.Telefonos[0]?.TEP_Numero ?? "").trim() !== "" &&
    String(form.Direcciones[0]?.TDI_Tipo_Direccion ?? "").trim() !== "" &&
    (form.Direcciones[0]?.DIR_Departamento ?? "").trim() !== "";

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const StepDot = ({ idx }) => {
    const done = idx < step;
    const active = idx === step;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div className={`step-dot ${done ? "done" : active ? "active" : "idle"}`}>
          {done ? <Check size={13} /> : idx + 1}
        </div>
        <span
          className="step-label"
          style={{ color: active ? "#0284c7" : done ? "#15803d" : "#64748b" }}
        >
          {STEPS[idx]}
        </span>
      </div>
    );
  };

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <User size={20} />
            </div>
            <div>
              <h2>{personaToEdit ? "Editar persona" : "Nueva persona"}</h2>
              <p>Paso {step + 1} de {STEPS.length}</p>
            </div>
          </div>

          <button className="close-btn" onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="stepper">
            {STEPS.map((_, i) => (
              <React.Fragment key={i}>
                <StepDot idx={i} />
                {i < STEPS.length - 1 && (
                  <div
                    className="step-line"
                    style={{ background: i < step ? "#15803d" : "#e2e8f0" }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="form-row">
                <div className="input-group">
                  <label>Tipo de persona *</label>
                  <select
                    value={form.TIP_Tipo_Persona}
                    onChange={setText("TIP_Tipo_Persona")}
                    disabled={saving}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposPersona.map((tp) => (
                      <option key={getTipoPersonaId(tp)} value={getTipoPersonaId(tp)}>
                        {getTipoPersonaDesc(tp)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Estado *</label>
                  <select
                    value={form.PER_Estado}
                    onChange={setText("PER_Estado")}
                    disabled={saving}
                  >
                    <option value="A">Activo</option>
                    <option value="I">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Primer nombre *</label>
                  <input
                    value={form.PER_Primer_Nombre}
                    onChange={setText("PER_Primer_Nombre")}
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label>Segundo nombre</label>
                  <input
                    value={form.PER_Segundo_Nombre}
                    onChange={setText("PER_Segundo_Nombre")}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Primer apellido *</label>
                  <input
                    value={form.PER_Primer_Apellido}
                    onChange={setText("PER_Primer_Apellido")}
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label>Segundo apellido</label>
                  <input
                    value={form.PER_Segundo_Apellido}
                    onChange={setText("PER_Segundo_Apellido")}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Razón social</label>
                <input
                  value={form.PER_Razon_Social}
                  onChange={setText("PER_Razon_Social")}
                  disabled={saving}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>NIT</label>
                  <input
                    value={form.PER_NIT}
                    onChange={setText("PER_NIT")}
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label>DPI</label>
                  <input
                    value={form.PER_DPI}
                    onChange={setText("PER_DPI")}
                    disabled={saving}
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="form-row">
                <div className="input-group">
                  <label>Tipo de teléfono *</label>
                  <select
                    value={form.Telefonos[0]?.TIT_Tipo_Telefono ?? ""}
                    onChange={(e) => updateTelefono(0, "TIT_Tipo_Telefono", Number(e.target.value))}
                    disabled={saving}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposTelefono.map((tt) => (
                      <option key={getTipoTelefonoId(tt)} value={getTipoTelefonoId(tt)}>
                        {getTipoTelefonoDesc(tt)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Teléfono principal *</label>
                  <select
                    value={form.Telefonos[0]?.TEP_Principal ?? "S"}
                    onChange={(e) => updateTelefono(0, "TEP_Principal", e.target.value)}
                    disabled={saving}
                  >
                    <option value="S">Sí</option>
                    <option value="N">No</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Número *</label>
                <input
                  value={form.Telefonos[0]?.TEP_Numero ?? ""}
                  onChange={(e) => updateTelefono(0, "TEP_Numero", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Tipo de dirección *</label>
                  <select
                    value={form.Direcciones[0]?.TDI_Tipo_Direccion ?? ""}
                    onChange={(e) => updateDireccion(0, "TDI_Tipo_Direccion", Number(e.target.value))}
                    disabled={saving}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposDireccion.map((td) => (
                      <option key={getTipoDireccionId(td)} value={getTipoDireccionId(td)}>
                        {getTipoDireccionDesc(td)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Dirección principal *</label>
                  <select
                    value={form.Direcciones[0]?.DIR_Principal ?? "S"}
                    onChange={(e) => updateDireccion(0, "DIR_Principal", e.target.value)}
                    disabled={saving}
                  >
                    <option value="S">Sí</option>
                    <option value="N">No</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Departamento *</label>
                  <input
                    value={form.Direcciones[0]?.DIR_Departamento ?? ""}
                    onChange={(e) => updateDireccion(0, "DIR_Departamento", e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label>Municipio</label>
                  <input
                    value={form.Direcciones[0]?.DIR_Municipio ?? ""}
                    onChange={(e) => updateDireccion(0, "DIR_Municipio", e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Colonia</label>
                  <input
                    value={form.Direcciones[0]?.DIR_Colonia ?? ""}
                    onChange={(e) => updateDireccion(0, "DIR_Colonia", e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label>Zona</label>
                  <input
                    value={form.Direcciones[0]?.DIR_Zona ?? ""}
                    onChange={(e) => updateDireccion(0, "DIR_Zona", e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Número casa</label>
                  <input
                    value={form.Direcciones[0]?.DIR_Numero_Casa ?? ""}
                    onChange={(e) => updateDireccion(0, "DIR_Numero_Casa", e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="input-group">
                  <label>Detalle</label>
                  <input
                    value={form.Direcciones[0]?.DIR_Detalle ?? ""}
                    onChange={(e) => updateDireccion(0, "DIR_Detalle", e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: 16
              }}
            >
              <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#0f172a", fontSize: 13 }}>
                Resumen de la persona
              </p>

              {[
                ["Tipo persona", tiposPersona.find(x => Number(getTipoPersonaId(x)) === Number(form.TIP_Tipo_Persona)) ? getTipoPersonaDesc(tiposPersona.find(x => Number(getTipoPersonaId(x)) === Number(form.TIP_Tipo_Persona))) : "—"],
                ["Nombre", `${form.PER_Primer_Nombre} ${form.PER_Segundo_Nombre} ${form.PER_Primer_Apellido} ${form.PER_Segundo_Apellido}`.replace(/\s+/g, " ").trim()],
                ["NIT", form.PER_NIT || "—"],
                ["DPI", form.PER_DPI || "—"],
                ["Tipo teléfono", tiposTelefono.find(x => Number(getTipoTelefonoId(x)) === Number(form.Telefonos[0]?.TIT_Tipo_Telefono)) ? getTipoTelefonoDesc(tiposTelefono.find(x => Number(getTipoTelefonoId(x)) === Number(form.Telefonos[0]?.TIT_Tipo_Telefono))) : "—"],
                ["Número", form.Telefonos[0]?.TEP_Numero || "—"],
                ["Tipo dirección", tiposDireccion.find(x => Number(getTipoDireccionId(x)) === Number(form.Direcciones[0]?.TDI_Tipo_Direccion)) ? getTipoDireccionDesc(tiposDireccion.find(x => Number(getTipoDireccionId(x)) === Number(form.Direcciones[0]?.TDI_Tipo_Direccion))) : "—"],
                ["Departamento", form.Direcciones[0]?.DIR_Departamento || "—"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: "1px solid #dcfce7",
                    fontSize: 13
                  }}
                >
                  <span style={{ color: "#64748b" }}>{k}</span>
                  <span style={{ fontWeight: 500, color: "#0f172a" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 0 && (
            <button
              className="btn-secondary"
              onClick={() => setStep((s) => s - 1)}
              disabled={saving}
            >
              <ArrowLeft size={14} />
              Atrás
            </button>
          )}

          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Cancelar
          </button>

          {step < 2 ? (
            <button
              className="btn-save"
              style={{ opacity: (step === 0 ? ok0 : ok1) ? 1 : 0.5 }}
              onClick={() => {
                if (step === 0 ? ok0 : ok1) setStep((s) => s + 1);
              }}
              disabled={saving || (step === 0 ? !ok0 : !ok1)}
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          ) : (
            <button className="btn-save" onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando..." : (
                <>
                  <Check size={14} />
                  {personaToEdit ? "Guardar cambios" : "Crear persona"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PersonaModal;