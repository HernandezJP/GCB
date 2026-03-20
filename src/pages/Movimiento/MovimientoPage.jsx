import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  getMovimientos,
  createMovimiento,
  updateMovimiento,
  deleteMovimiento
} from '../../services/MovimientoService';

import { getTiposMovimiento } from '../../services/TipoMovimientoService';
import { getMediosMovimiento } from '../../services/MedioMovimientoService';
import { getEstadosMovimiento } from '../../services/EstadoMovimientoService';

import MovimientoTable from './MovimientoTable';
import MovimientoModal from './MovimientoModal';
import MovimientoDetalle from './MovimientoDetalle';
import './Movimiento.css';

export const getId = (m) => m?.MOV_Movimiento ?? null;
export const getDescripcion = (m) => m?.MOV_Descripcion ?? '';
export const getEstadoId = (m) => m?.ESM_Estado_Movimiento ?? null;
export const getFecha = (m) => m?.MOV_Fecha ?? null;
export const getMonto = (m) => m?.MOV_Monto ?? 0;
export const getSaldo = (m) => m?.MOV_Saldo ?? 0;
export const getReferencia = (m) => m?.MOV_Numero_Referencia ?? '';
export const getTipoId = (m) => m?.TIM_Tipo_Movimiento ?? null;
export const getMedioId = (m) => m?.MEM_Medio_Movimiento ?? null;
export const getCuenta = (m) => m?.CUB_Cuenta ?? '';
export const getPersona = (m) => m?.PER_Persona ?? '';

const MovimientoPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [mediosMovimiento, setMediosMovimiento] = useState([]);
  const [estadosMovimiento, setEstadosMovimiento] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movimientoToEdit, setMovimientoToEdit] = useState(null);
  const [movimientoDetail, setMovimientoDetail] = useState(null);

  const fetchCatalogos = async () => {
    try {
      const [tipos, medios, estados] = await Promise.all([
        getTiposMovimiento(),
        getMediosMovimiento(),
        getEstadosMovimiento()
      ]);

      setTiposMovimiento(tipos || []);
      setMediosMovimiento(medios || []);
      setEstadosMovimiento(estados || []);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };

  const fetchMovimientosData = async () => {
    try {
      setLoading(true);
      const data = await getMovimientos();
      setMovimientos(data || []);
      setFilteredMovimientos(data || []);
      setError(null);
    } catch (err) {
      console.error('Error al obtener movimientos:', err);
      setError('No se pudieron cargar los movimientos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogos();
    fetchMovimientosData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredMovimientos(movimientos);
        return;
      }

      const q = searchTerm.toLowerCase();
      setFilteredMovimientos(
        movimientos.filter((m) =>
          getDescripcion(m).toLowerCase().includes(q) ||
          getReferencia(m).toLowerCase().includes(q)
        )
      );
    }, 300);

    return () => clearTimeout(t);
  }, [searchTerm, movimientos]);

  const handleAddNew = () => {
    setMovimientoToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (m) => {
    setMovimientoToEdit(m);
    setIsModalOpen(true);
  };

  const handleView = (m) => {
    setMovimientoDetail(m);
  };

  const handleToggleStatus = async (id) => {
    if (id === undefined || id === null) {
      alert('Error interno: ID no detectado.');
      return;
    }

    if (!window.confirm('¿Deseas eliminar lógicamente este movimiento?')) return;

    try {
      await deleteMovimiento(id);
      await fetchMovimientosData();
    } catch (err) {
      console.error('Error al eliminar movimiento:', err);
      const msg = err.response?.data?.mensaje || 'Error al procesar.';
      alert(`Error: ${msg}`);
    }
  };

  const handleSaveModal = async (formData) => {
    try {
      if (movimientoToEdit) {
        const id = getId(movimientoToEdit);
        if (id === undefined || id === null) {
          alert('Error: ID no detectado.');
          return;
        }

        await updateMovimiento(id, {
          MOV_Descripcion: formData.MOV_Descripcion,
          ESM_Estado_Movimiento: Number(formData.ESM_Estado_Movimiento)
        });
      } else {
        await createMovimiento({
          CUB_Cuenta: Number(formData.CUB_Cuenta),
          PER_Persona: Number(formData.PER_Persona),
          TIM_Tipo_Movimiento: Number(formData.TIM_Tipo_Movimiento),
          MEM_Medio_Movimiento: Number(formData.MEM_Medio_Movimiento),
          ESM_Estado_Movimiento: Number(formData.ESM_Estado_Movimiento),
          MOV_Numero_Referencia: formData.MOV_Numero_Referencia,
          MOV_Descripcion: formData.MOV_Descripcion,
          MOV_Monto: Number(formData.MOV_Monto)
        });
      }

      setIsModalOpen(false);
      await fetchMovimientosData();
    } catch (err) {
      console.error('Error al guardar movimiento:', err);
      const msg = err.response?.data?.mensaje || 'Error al guardar.';
      alert(`Error: ${msg}`);
    }
  };

  if (movimientoDetail) {
    return (
      <div className="movimiento-container">
        <MovimientoDetalle
          movimiento={movimientoDetail}
          tiposMovimiento={tiposMovimiento}
          mediosMovimiento={mediosMovimiento}
          estadosMovimiento={estadosMovimiento}
          onBack={() => setMovimientoDetail(null)}
        />
      </div>
    );
  }

  return (
    <div className="movimiento-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Gestión de Movimientos</h1>
          <span className="record-count">{filteredMovimientos.length} registros</span>
        </div>

        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={18} />
          Nuevo Movimiento
        </button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por descripción o referencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Cargando movimientos...</div>
      ) : (
        <MovimientoTable
          movimientos={filteredMovimientos}
          tiposMovimiento={tiposMovimiento}
          mediosMovimiento={mediosMovimiento}
          estadosMovimiento={estadosMovimiento}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onView={handleView}
        />
      )}

      <MovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        movimientoToEdit={movimientoToEdit}
        tiposMovimiento={tiposMovimiento}
        mediosMovimiento={mediosMovimiento}
        estadosMovimiento={estadosMovimiento}
      />
    </div>
  );
};

export default MovimientoPage;