import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, CheckCircle, ArrowLeftRight } from 'lucide-react';
import {
  getMovimientosPorCuenta,
  createMovimiento,
  anularMovimiento
} from '../../services/MovimientoService';

import { getTiposMovimiento } from '../../services/TipoMovimientoService';
import { getMediosMovimiento } from '../../services/MedioMovimientoService';
import { getEstadosMovimiento } from '../../services/EstadoMovimientoService';
import { getPersonas } from '../../services/PersonaService';

import MovimientoModal from './MovimientoModal';
import MovimientoTable from './MovimientoTable';
import {
  getDescripcion,
  getReferencia,
  getTipoDescripcion,
  getMedioDescripcion,
  getPersonaNombre,
  getMonto,
  getRecargo,
  esIngreso
} from './MovimientoHelpers';

const MovimientoTab = ({
  cuentaId,
  numeroCuenta,
  simbolo = 'Q'
}) => {
  const [movimientos, setMovimientos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [mediosMovimiento, setMediosMovimiento] = useState([]);
  const [estadosMovimiento, setEstadosMovimiento] = useState([]);
  const [personas, setPersonas] = useState([]);

  const fetchMovimientos = async () => {
    if (!cuentaId) return;

    try {
      setLoading(true);
      const data = await getMovimientosPorCuenta(cuentaId);
      const lista = Array.isArray(data) ? data : [];
      setMovimientos(lista);
      setFiltered(lista);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los movimientos de la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const [tm, mm, em, p] = await Promise.all([
        getTiposMovimiento(),
        getMediosMovimiento(),
        getEstadosMovimiento(),
        getPersonas()
      ]);

      setTiposMovimiento(Array.isArray(tm) ? tm : []);
      setMediosMovimiento(Array.isArray(mm) ? mm : []);
      setEstadosMovimiento(Array.isArray(em) ? em : []);
      setPersonas(Array.isArray(p) ? p : []);
    } catch (err) {
      console.error('Error cargando catálogos de movimiento:', err);
    }
  };

  useEffect(() => {
    fetchMovimientos();
    fetchCatalogos();
  }, [cuentaId]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) {
        setFiltered(movimientos);
        return;
      }

      const q = search.toLowerCase();

      setFiltered(
        movimientos.filter(m =>
          String(getDescripcion(m) || '').toLowerCase().includes(q) ||
          String(getReferencia(m) || '').toLowerCase().includes(q) ||
          String(getTipoDescripcion(m) || '').toLowerCase().includes(q) ||
          String(getMedioDescripcion(m) || '').toLowerCase().includes(q) ||
          String(getPersonaNombre(m) || '').toLowerCase().includes(q)
        )
      );
    }, 250);

    return () => clearTimeout(t);
  }, [search, movimientos]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = async (formData) => {
    try {
      await createMovimiento(formData);
      setIsModalOpen(false);
      showSuccess('Movimiento creado correctamente.');
      await fetchMovimientos();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.mensaje || 'Error al guardar el movimiento.');
    }
  };

  const handleAnular = async (id) => {
    if (!window.confirm('¿Deseas anular este movimiento?')) return;

    try {
      await anularMovimiento(id);
      showSuccess('Movimiento anulado correctamente.');
      await fetchMovimientos();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.mensaje || 'Error al anular el movimiento.');
    }
  };

  const totalIngresos = useMemo(() => {
    return movimientos
      .filter(m => esIngreso(m))
      .reduce((sum, m) => sum + getMonto(m), 0);
  }, [movimientos]);

  const totalEgresos = useMemo(() => {
    return movimientos
      .filter(m => !esIngreso(m))
      .reduce((sum, m) => sum + getMonto(m), 0);
  }, [movimientos]);

  const totalRecargos = useMemo(() => {
    return movimientos.reduce((sum, m) => sum + getRecargo(m), 0);
  }, [movimientos]);

  return (
    <div>
      <div className="tab-toolbar">
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por descripción, referencia, persona, medio o tipo."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={() => setIsModalOpen(true)} type="button">
          <Plus size={16} />
          Nuevo movimiento
        </button>
      </div>

      <div className="kpi-grid" style={{ padding: '18px 20px 0', marginBottom: 16 }}>
        <div className="kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div>
            <div className="kpi-label">Total movimientos</div>
            <div className="kpi-value">{movimientos.length}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#e0f2fe' }}>
            <ArrowLeftRight size={20} color="#0284c7" />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #15803d' }}>
          <div>
            <div className="kpi-label">Ingresos</div>
            <div className="kpi-value" style={{ color: '#15803d', fontSize: '15px' }}>
              {simbolo} {totalIngresos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="kpi-icon" style={{ background: '#dcfce7' }}>
            <ArrowLeftRight size={20} color="#15803d" />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #b91c1c' }}>
          <div>
            <div className="kpi-label">Egresos</div>
            <div className="kpi-value" style={{ color: '#b91c1c', fontSize: '15px' }}>
              {simbolo} {totalEgresos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="kpi-icon" style={{ background: '#fee2e2' }}>
            <ArrowLeftRight size={20} color="#b91c1c" />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #92400e' }}>
          <div>
            <div className="kpi-label">Recargos</div>
            <div className="kpi-value" style={{ color: '#92400e', fontSize: '15px' }}>
              {simbolo} {totalRecargos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="kpi-icon" style={{ background: '#fef3c7' }}>
            <ArrowLeftRight size={20} color="#92400e" />
          </div>
        </div>
      </div>

      {success && (
        <div className="success-banner" style={{ margin: '0 20px 16px' }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="error-banner" style={{ margin: '0 20px 16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Cargando movimientos.</div>
      ) : (
        <MovimientoTable
          movimientos={filtered}
          onAnular={handleAnular}
          simbolo={simbolo}
        />
      )}

      <MovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        cuentaId={cuentaId}
        numeroCuenta={numeroCuenta}
        personas={personas}
        tiposMovimiento={tiposMovimiento}
        mediosMovimiento={mediosMovimiento}
        estadosMovimiento={estadosMovimiento}
      />
    </div>
  );
};

export default MovimientoTab;