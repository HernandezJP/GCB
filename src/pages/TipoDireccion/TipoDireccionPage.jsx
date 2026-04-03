import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  getTiposDireccion,
  createTipoDireccion,
  updateTipoDireccion,
  deleteTipoDireccion,
} from '../../services/TipoDireccionService';

import TipoDireccionTable from './TipoDireccionTable';
import TipoDireccionModal from './TipoDireccionModal';
import TipoDireccionDetalle from './TipoDireccionDetalle';
import './TipoDireccion.css';

export const getId = (t) => t?.tdI_Tipo_Direccion ?? t?.TDI_Tipo_Direccion;
export const getDescripcion = (t) => t?.tdI_Descripcion ?? t?.TDI_Descripcion ?? '';
export const getEstado = (t) => t?.tdI_Estado ?? t?.TDI_Estado ?? 'I';
export const getFechaCreacion = (t) => t?.tdI_Fecha_Creacion ?? t?.TDI_Fecha_Creacion ?? '';
export const isActivo = (t) => getEstado(t) === 'A';

const TipoDireccionPage = () => {
  const [tipos, setTipos] = useState([]);
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoToEdit, setTipoToEdit] = useState(null);
  const [tipoDetail, setTipoDetail] = useState(null);

  const fetchTipos = async () => {
    try {
      setLoading(true);
      const data = await getTiposDireccion();
      setTipos(data);
      setFilteredTipos(data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener tipos de dirección:', err);
      setError('No se pudieron cargar los tipos de dirección.');
      setTipos([]);
      setFilteredTipos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredTipos(tipos);
        return;
      }

      const q = searchTerm.toLowerCase();
      setFilteredTipos(
        tipos.filter((t) => getDescripcion(t).toLowerCase().includes(q))
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, tipos]);

  const handleAddNew = () => {
    setTipoToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tipo) => {
    setTipoToEdit(tipo);
    setIsModalOpen(true);
  };

  const handleView = (tipo) => {
    setTipoDetail(tipo);
  };

  const handleToggleStatus = async (id, nuevoActivo) => {
    if (id === undefined || id === null) {
      alert('Error interno: ID no detectado.');
      return;
    }

    if (nuevoActivo) {
      alert('La reactivación aún no está implementada en el backend.');
      return;
    }

    if (!window.confirm('¿Deseas desactivar este tipo de dirección?')) return;

    try {
      await deleteTipoDireccion(id);
      await fetchTipos();
    } catch (err) {
      console.error('Error al desactivar tipo de dirección:', err);
      const msg =
        err.response?.data?.title ||
        err.response?.data?.message ||
        err.response?.data ||
        'Error al procesar.';
      alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
  };

  const handleSaveModal = async (formData) => {
    try {
      if (tipoToEdit) {
        const id = getId(tipoToEdit);

        if (id === undefined || id === null) {
          alert('Error: ID no detectado.');
          return;
        }

        await updateTipoDireccion(id, {
          TDI_Tipo_Direccion: id,
          TDI_Descripcion: formData.TDI_Descripcion,
          TDI_Estado: formData.TDI_Estado,
        });
      } else {
        await createTipoDireccion({
          TDI_Descripcion: formData.TDI_Descripcion,
          TDI_Estado: formData.TDI_Estado,
        });
      }

      setIsModalOpen(false);
      setTipoToEdit(null);
      await fetchTipos();
    } catch (err) {
      console.error('Error al guardar tipo de dirección:', err);
      const msg =
        err.response?.data?.title ||
        err.response?.data?.message ||
        err.response?.data ||
        'Error al guardar.';
      alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
  };

  if (tipoDetail) {
    return (
      <div className="tipodir-container">
        <TipoDireccionDetalle
          tipo={tipoDetail}
          onBack={() => setTipoDetail(null)}
        />
      </div>
    );
  }

  return (
    <div className="tipodir-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Tipos de Dirección</h1>
          <span className="record-count">{filteredTipos.length} registros</span>
        </div>

        <button type="button" className="btn-primary" onClick={handleAddNew}>
          <Plus size={18} />
          Nuevo Tipo
        </button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Cargando tipos de dirección...</div>
      ) : (
        <TipoDireccionTable
          tipos={filteredTipos}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onView={handleView}
        />
      )}

      <TipoDireccionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTipoToEdit(null);
        }}
        onSave={handleSaveModal}
        tipoToEdit={tipoToEdit}
      />
    </div>
  );
};

export default TipoDireccionPage;