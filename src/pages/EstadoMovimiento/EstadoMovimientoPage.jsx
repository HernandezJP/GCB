import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  getEstadosMovimiento,
  createEstadoMovimiento,
  updateEstadoMovimiento,
  deleteEstadoMovimiento
} from '../../services/EstadoMovimientoService';

import EstadoMovimientoTable from './EstadoMovimientoTable';
import EstadoMovimientoModal from './EstadoMovimientoModal';
import EstadoMovimientoDetalle from './EstadoMovimientoDetalle';
import './EstadoMovimiento.css';

export const getId = (t) => t?.ESM_Estado_Movimiento ?? null;
export const getDescripcion = (t) => t?.ESM_Descripcion ?? '';
export const getEstado = (t) => t?.ESM_Estado ?? '';
export const getFecha = (t) => t?.ESM_Fecha_Creacion ?? null;
export const isActivo = (t) => getEstado(t) === 'A';

const EstadoMovimientoPage = () => {
  const [estados, setEstados] = useState([]);
  const [filteredEstados, setFilteredEstados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estadoToEdit, setEstadoToEdit] = useState(null);
  const [estadoDetail, setEstadoDetail] = useState(null);

  const fetchEstados = async () => {
    try {
      setLoading(true);
      const data = await getEstadosMovimiento();
      setEstados(data || []);
      setFilteredEstados(data || []);
      setError(null);
    } catch (err) {
      console.error('Error al obtener estados de movimiento:', err);
      setError('No se pudieron cargar los estados de movimiento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstados();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredEstados(estados);
        return;
      }

      const q = searchTerm.toLowerCase();
      setFilteredEstados(
        estados.filter((e) =>
          getDescripcion(e).toLowerCase().includes(q)
        )
      );
    }, 300);

    return () => clearTimeout(t);
  }, [searchTerm, estados]);

  const handleAddNew = () => {
    setEstadoToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (e) => {
    setEstadoToEdit(e);
    setIsModalOpen(true);
  };

  const handleView = (e) => {
    setEstadoDetail(e);
  };

  const handleToggleStatus = async (id, activoActual) => {
    if (id === undefined || id === null) {
      alert('Error interno: ID no detectado.');
      return;
    }

    if (!activoActual) {
      alert('Este registro ya está inactivo y este módulo no tiene reactivación.');
      return;
    }

    if (!window.confirm('¿Deseas desactivar este estado de movimiento?')) return;

    try {
      await deleteEstadoMovimiento(id);
      await fetchEstados();
    } catch (err) {
      console.error('Error al desactivar estado de movimiento:', err);
      const msg = err.response?.data?.mensaje || 'Error al procesar.';
      alert(`Error: ${msg}`);
    }
  };

  const handleSaveModal = async (formData) => {
    try {
      if (estadoToEdit) {
        const id = getId(estadoToEdit);
        if (id === undefined || id === null) {
          alert('Error: ID no detectado.');
          return;
        }

        await updateEstadoMovimiento(id, {
          ESM_Descripcion: formData.ESM_Descripcion,
          ESM_Estado: getEstado(estadoToEdit) || 'A'
        });
      } else {
        await createEstadoMovimiento({
          ESM_Descripcion: formData.ESM_Descripcion
        });
      }

      setIsModalOpen(false);
      await fetchEstados();
    } catch (err) {
      console.error('Error al guardar estado de movimiento:', err);
      const msg = err.response?.data?.mensaje || 'Error al guardar.';
      alert(`Error: ${msg}`);
    }
  };

  if (estadoDetail) {
    return (
      <div className="estadomovimiento-container">
        <EstadoMovimientoDetalle
          estado={estadoDetail}
          onBack={() => setEstadoDetail(null)}
        />
      </div>
    );
  }

  return (
    <div className="estadomovimiento-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Gestión de Estados de Movimiento</h1>
          <span className="record-count">{filteredEstados.length} registros</span>
        </div>

        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={18} />
          Nuevo Estado de Movimiento
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
        <div className="loading-state">Cargando estados de movimiento...</div>
      ) : (
        <EstadoMovimientoTable
          estados={filteredEstados}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onView={handleView}
        />
      )}

      <EstadoMovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        estadoToEdit={estadoToEdit}
      />
    </div>
  );
};

export default EstadoMovimientoPage;