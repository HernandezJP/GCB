import React, { useEffect, useState } from "react";
import { Plus, Search, CheckCircle, User } from "lucide-react";

import {
  getPersonas,
  getPersonaDetalle,
  createPersona,
  updatePersona,
  deletePersona
} from "../../services/PersonaService";

import PersonaTable from "./PersonaTable";
import PersonaModal from "./PersonaModal";
import PersonaDetalle from "./PersonaDetalle";
import "./Persona.css";

import { getTiposPersona } from "../../services/TipoPersonaService";
import { getTiposTelefono } from "../../services/TipoTelefonoService";
import { getTiposDireccion } from "../../services/TipoDireccionService";

const getId = (p) => p?.peR_Persona ?? 0;
const getEstado = (p) => p?.peR_Estado ?? "A";
const getNit = (p) => p?.peR_NIT ?? "";
const getDpi = (p) => p?.peR_DPI ?? "";
const getTipoPersona = (p) => p?.tipoPersonaDescripcion ?? "";

const getNombreCompleto = (p) => {
  const nombreApi = p?.nombreCompleto ?? "";
  if (nombreApi.trim()) return nombreApi;

  return `${p?.peR_Primer_Nombre ?? ""} ${p?.peR_Segundo_Nombre ?? ""} ${p?.peR_Primer_Apellido ?? ""} ${p?.peR_Segundo_Apellido ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
};

const PersonaPage = () => {
  const [personas, setPersonas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personaEdit, setPersonaEdit] = useState(null);
  const [personaDetalle, setPersonaDetalle] = useState(null);

  const [tiposPersona, setTiposPersona] = useState([]);
  const [tiposTelefono, setTiposTelefono] = useState([]);
  const [tiposDireccion, setTiposDireccion] = useState([]);

  useEffect(() => {
    fetchPersonas();
    fetchCatalogos();
  }, []);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPersonas();

      setPersonas(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando personas:", err);
      setError("No se pudieron cargar las personas.");
      setPersonas([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const [tp, tt, td] = await Promise.all([
        getTiposPersona(),
        getTiposTelefono(),
        getTiposDireccion()
      ]);

      setTiposPersona(Array.isArray(tp) ? tp : []);
      setTiposTelefono(Array.isArray(tt) ? tt : []);
      setTiposDireccion(Array.isArray(td) ? td : []);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.trim().toLowerCase();

      if (!q) {
        setFiltered(personas);
        return;
      }

      const filtradas = personas.filter((p) =>
        getNombreCompleto(p).toLowerCase().includes(q) ||
        getNit(p).toLowerCase().includes(q) ||
        getDpi(p).toLowerCase().includes(q) ||
        getTipoPersona(p).toLowerCase().includes(q)
      );

      setFiltered(filtradas);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, personas]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleOpenCreate = () => {
    setPersonaEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (persona) => {
    try {
      const detalle = await getPersonaDetalle(getId(persona));
      setPersonaEdit(detalle);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error obteniendo detalle para editar:", err);
      alert("No se pudo cargar el detalle de la persona.");
    }
  };

  const handleView = async (persona) => {
    try {
      const detalle = await getPersonaDetalle(getId(persona));
      setPersonaDetalle(detalle);
    } catch (err) {
      console.error("Error obteniendo detalle:", err);
      alert("No se pudo cargar el detalle de la persona.");
    }
  };

  const handleSave = async (formData) => {
    try {
      if (personaEdit) {
        const dtoUpdate = {
          TIP_Tipo_Persona: Number(formData.TIP_Tipo_Persona),
          PER_Primer_Nombre: formData.PER_Primer_Nombre || "",
          PER_Segundo_Nombre: formData.PER_Segundo_Nombre || "",
          PER_Primer_Apellido: formData.PER_Primer_Apellido || "",
          PER_Segundo_Apellido: formData.PER_Segundo_Apellido || "",
          PER_Razon_Social: formData.PER_Razon_Social || "",
          PER_NIT: formData.PER_NIT || "",
          PER_DPI: formData.PER_DPI || "",
          PER_Estado: formData.PER_Estado || "A",
        };

        await updatePersona(getId(personaEdit), dtoUpdate);
        showSuccess("Persona actualizada correctamente.");
      } else {
        const dtoCreate = {
          TIP_Tipo_Persona: Number(formData.TIP_Tipo_Persona),
          PER_Primer_Nombre: formData.PER_Primer_Nombre || "",
          PER_Segundo_Nombre: formData.PER_Segundo_Nombre || "",
          PER_Primer_Apellido: formData.PER_Primer_Apellido || "",
          PER_Segundo_Apellido: formData.PER_Segundo_Apellido || "",
          PER_Razon_Social: formData.PER_Razon_Social || "",
          PER_NIT: formData.PER_NIT || "",
          PER_DPI: formData.PER_DPI || "",
          PER_Estado: formData.PER_Estado || "A",
          Telefonos: formData.Telefonos || [],
          Direcciones: formData.Direcciones || [],
        };

        await createPersona(dtoCreate);
        showSuccess("Persona creada correctamente.");
      }

      setIsModalOpen(false);
      setPersonaEdit(null);
      await fetchPersonas();
    } catch (err) {
      console.error("Error guardando persona:", err);
      alert(err?.response?.data?.mensaje || "Error al guardar la persona.");
    }
  };

  const handleDelete = async (id) => {
    const confirmado = window.confirm("¿Deseas desactivar esta persona?");
    if (!confirmado) return;

    try {
      await deletePersona(id);
      showSuccess("Persona desactivada correctamente.");
      await fetchPersonas();
    } catch (err) {
      console.error("Error desactivando persona:", err);
      alert(err?.response?.data?.mensaje || "Error al desactivar la persona.");
    }
  };

  const activas = personas.filter((p) => getEstado(p) === "A").length;
  const inactivas = personas.filter((p) => getEstado(p) === "I").length;

  if (personaDetalle) {
  return (
    <div className="cuentabancaria-container">
      <PersonaDetalle
        persona={personaDetalle}
        onBack={() => setPersonaDetalle(null)}
        tiposTelefono={tiposTelefono}
        tiposDireccion={tiposDireccion}
      />
    </div>
  );
}

  return (
    <div className="cuentabancaria-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Personas</h1>
          <span className="record-count">{filtered.length} registros</span>
        </div>

        <button className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Nueva persona
        </button>
      </div>

      <div className="kpi-grid">
        {[
          {
            label: "Personas activas",
            val: activas,
            color: "#0284c7",
            bg: "#e6f1fb"
          },
          {
            label: "Personas inactivas",
            val: inactivas,
            color: "#ef4444",
            bg: "#fee2e2"
          },
          {
            label: "Total personas",
            val: personas.length,
            color: "#64748b",
            bg: "#f1f5f9"
          }
        ].map((k, i) => (
          <div
            key={i}
            className="kpi-card"
            style={{ borderLeft: `4px solid ${k.color}` }}
          >
            <div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.val}</div>
            </div>
            <div className="kpi-icon" style={{ background: k.bg }}>
              <User size={20} color={k.color} />
            </div>
          </div>
        ))}
      </div>

      {success && (
        <div className="success-banner">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, NIT, DPI o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Cargando personas...</div>
      ) : (
        <PersonaTable
          personas={filtered}
          onView={handleView}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <PersonaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPersonaEdit(null);
        }}
        onSave={handleSave}
        personaToEdit={personaEdit}
        tiposPersona={tiposPersona}
        tiposTelefono={tiposTelefono}
        tiposDireccion={tiposDireccion}
      />
    </div>
  );
};

export default PersonaPage;