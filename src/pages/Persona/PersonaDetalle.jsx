import React, { useState } from "react";
import { ArrowLeft, User, Phone, MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import AddTelefonoModal from "./AddTelefonoModal";
import AddDireccionModal from "./AddDireccionModal";
import EditTelefonoModal from "./EditTelefonoModal";
import EditDireccionModal from "./EditDireccionModal";

import {
  addTelefonoPersona,
  addDireccionPersona,
  updateTelefonoPersona,
  deleteTelefonoPersona,
  updateDireccionPersona,
  deleteDireccionPersona,
  getPersonaDetalle
} from "../../services/PersonaService";

const getId = (p) => p?.peR_Persona ?? p?.PER_Persona ?? 0;
const getEstado = (p) => p?.peR_Estado ?? p?.PER_Estado ?? "A";
const getNit = (p) => p?.peR_NIT ?? p?.PER_NIT ?? "";
const getDpi = (p) => p?.peR_DPI ?? p?.PER_DPI ?? "";
const getTipoPersona = (p) => p?.tipoPersonaDescripcion ?? p?.TipoPersonaDescripcion ?? "";

const getNombreCompleto = (p) => {
  const nombreApi = p?.nombreCompleto ?? p?.NombreCompleto ?? "";
  if (String(nombreApi).trim()) return nombreApi;

  return `${p?.peR_Primer_Nombre ?? p?.PER_Primer_Nombre ?? ""} ${p?.peR_Segundo_Nombre ?? p?.PER_Segundo_Nombre ?? ""} ${p?.peR_Primer_Apellido ?? p?.PER_Primer_Apellido ?? ""} ${p?.peR_Segundo_Apellido ?? p?.PER_Segundo_Apellido ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
};

const getTelefonoId = (t) => t?.teL_Telefono ?? t?.TEL_Telefono ?? 0;
const getDireccionId = (d) => d?.diR_Direccion ?? d?.DIR_Direccion ?? 0;

const PersonaDetalle = ({ persona, onBack, tiposTelefono = [], tiposDireccion = [] }) => {
  const [detalle, setDetalle] = useState(persona);
  const [openTelefono, setOpenTelefono] = useState(false);
  const [openDireccion, setOpenDireccion] = useState(false);

  const [editTelefonoOpen, setEditTelefonoOpen] = useState(false);
  const [editDireccionOpen, setEditDireccionOpen] = useState(false);
  const [telefonoEdit, setTelefonoEdit] = useState(null);
  const [direccionEdit, setDireccionEdit] = useState(null);

  const activo = getEstado(detalle) === "A";
  const telefonos = detalle?.telefonos ?? detalle?.Telefonos ?? [];
  const direcciones = detalle?.direcciones ?? detalle?.Direcciones ?? [];

  const recargarDetalle = async () => {
    const nuevoDetalle = await getPersonaDetalle(getId(detalle));
    setDetalle(nuevoDetalle);
  };

  const handleAddTelefono = async (form) => {
    try {
      await addTelefonoPersona(getId(detalle), form);
      setOpenTelefono(false);
      await recargarDetalle();
      alert("Teléfono agregado correctamente.");
    } catch (err) {
      alert(err?.response?.data?.mensaje || "Error al agregar teléfono.");
    }
  };

  const handleAddDireccion = async (form) => {
    try {
      await addDireccionPersona(getId(detalle), form);
      setOpenDireccion(false);
      await recargarDetalle();
      alert("Dirección agregada correctamente.");
    } catch (err) {
      alert(err?.response?.data?.mensaje || "Error al agregar dirección.");
    }
  };

  const handleEditTelefono = async (form) => {
    try {
      await updateTelefonoPersona(getTelefonoId(telefonoEdit), form);
      setEditTelefonoOpen(false);
      setTelefonoEdit(null);
      await recargarDetalle();
      alert("Teléfono actualizado correctamente.");
    } catch (err) {
      alert(err?.response?.data?.mensaje || "Error al actualizar teléfono.");
    }
  };

  const handleEditDireccion = async (form) => {
    try {
      await updateDireccionPersona(getDireccionId(direccionEdit), form);
      setEditDireccionOpen(false);
      setDireccionEdit(null);
      await recargarDetalle();
      alert("Dirección actualizada correctamente.");
    } catch (err) {
      alert(err?.response?.data?.mensaje || "Error al actualizar dirección.");
    }
  };

  const handleDeleteTelefono = async (telefono) => {
    if (!window.confirm("¿Deseas desactivar este teléfono?")) return;

    try {
      await deleteTelefonoPersona(getTelefonoId(telefono));
      await recargarDetalle();
      alert("Teléfono desactivado correctamente.");
    } catch (err) {
      alert(err?.response?.data?.mensaje || "Error al desactivar teléfono.");
    }
  };

  const handleDeleteDireccion = async (direccion) => {
    if (!window.confirm("¿Deseas desactivar esta dirección?")) return;

    try {
      await deleteDireccionPersona(getDireccionId(direccion));
      await recargarDetalle();
      alert("Dirección desactivada correctamente.");
    } catch (err) {
      alert(err?.response?.data?.mensaje || "Error al desactivar dirección.");
    }
  };

  return (
    <div>
      <button className="btn-secondary" style={{ marginBottom: 16 }} onClick={onBack}>
        <ArrowLeft size={15} />
        Volver a personas
      </button>

      <div className="detalle-card">
        <div className="detalle-header">
          <div className="detalle-icon">
            <User size={26} />
          </div>

          <div>
            <h2>{getNombreCompleto(detalle) || "Sin nombre"}</h2>
            <p className="detalle-subtitle">{getTipoPersona(detalle) || "Sin tipo"}</p>
          </div>

          <div className="detalle-status">
            <span className={`status-pill ${activo ? "pill-green" : "pill-red"}`}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: activo ? "#22c55e" : "#ef4444",
                  display: "inline-block",
                  marginRight: 8
                }}
              />
              {activo ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>

        <div className="detalle-stats">
          <div className="detalle-stat">
            <div className="detalle-stat-label">NIT</div>
            <div className="detalle-stat-value">{getNit(detalle) || "—"}</div>
          </div>

          <div className="detalle-stat">
            <div className="detalle-stat-label">DPI</div>
            <div className="detalle-stat-value">{getDpi(detalle) || "—"}</div>
          </div>

          <div className="detalle-stat">
            <div className="detalle-stat-label">Teléfonos</div>
            <div className="detalle-stat-value">{telefonos.length}</div>
          </div>

          <div className="detalle-stat">
            <div className="detalle-stat-label">Direcciones</div>
            <div className="detalle-stat-value">{direcciones.length}</div>
          </div>
        </div>

        <div className="tab-content">
          <div className="tab-toolbar">
            <strong>Teléfonos registrados</strong>
            <button className="btn-primary" onClick={() => setOpenTelefono(true)}>
              <Plus size={16} />
              Agregar teléfono
            </button>
          </div>

          {telefonos.length === 0 ? (
            <div className="empty-state">No hay teléfonos registrados.</div>
          ) : (
            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Número</th>
                    <th>Principal</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {telefonos.map((t, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{t?.tipoTelefonoDescripcion || "—"}</td>
                      <td>{t?.teP_Numero || "—"}</td>
                      <td>{t?.teP_Principal === "S" ? "Sí" : "No"}</td>
                      <td>{t?.teP_Estado === "A" ? "Activo" : "Inactivo"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-btn edit"
                            onClick={() => {
                              setTelefonoEdit(t);
                              setEditTelefonoOpen(true);
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="icon-btn toggle-on"
                            onClick={() => handleDeleteTelefono(t)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="tab-toolbar">
            <strong>Direcciones registradas</strong>
            <button className="btn-primary" onClick={() => setOpenDireccion(true)}>
              <Plus size={16} />
              Agregar dirección
            </button>
          </div>

          {direcciones.length === 0 ? (
            <div className="empty-state">No hay direcciones registradas.</div>
          ) : (
            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Departamento</th>
                    <th>Municipio</th>
                    <th>Colonia</th>
                    <th>Zona</th>
                    <th>Casa</th>
                    <th>Principal</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {direcciones.map((d, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{d?.tipoDireccionDescripcion || "—"}</td>
                      <td>{d?.diR_Departamento || "—"}</td>
                      <td>{d?.diR_Municipio || "—"}</td>
                      <td>{d?.diR_Colonia || "—"}</td>
                      <td>{d?.diR_Zona || "—"}</td>
                      <td>{d?.diR_Numero_Casa || "—"}</td>
                      <td>{d?.diR_Principal === "S" ? "Sí" : "No"}</td>
                      <td>{d?.diR_Estado === "A" ? "Activo" : "Inactivo"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-btn edit"
                            onClick={() => {
                              setDireccionEdit(d);
                              setEditDireccionOpen(true);
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="icon-btn toggle-on"
                            onClick={() => handleDeleteDireccion(d)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddTelefonoModal
        isOpen={openTelefono}
        onClose={() => setOpenTelefono(false)}
        onSave={handleAddTelefono}
        tiposTelefono={tiposTelefono}
      />

      <AddDireccionModal
        isOpen={openDireccion}
        onClose={() => setOpenDireccion(false)}
        onSave={handleAddDireccion}
        tiposDireccion={tiposDireccion}
      />

      <EditTelefonoModal
        isOpen={editTelefonoOpen}
        onClose={() => {
          setEditTelefonoOpen(false);
          setTelefonoEdit(null);
        }}
        telefono={telefonoEdit}
        onSave={handleEditTelefono}
        tiposTelefono={tiposTelefono}
      />

      <EditDireccionModal
        isOpen={editDireccionOpen}
        onClose={() => {
          setEditDireccionOpen(false);
          setDireccionEdit(null);
        }}
        direccion={direccionEdit}
        onSave={handleEditDireccion}
        tiposDireccion={tiposDireccion}
      />
    </div>
  );
};

export default PersonaDetalle;