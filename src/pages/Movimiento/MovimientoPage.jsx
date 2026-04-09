import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, CheckCircle, ArrowLeftRight } from 'lucide-react';

import {
  getMovimientos,
  createMovimiento,
  anularMovimiento,
} from '../../services/MovimientoService';

import { getCuentas } from '../../services/CuentaBancariaService';
import { getTiposMovimiento } from '../../services/TipoMovimientoService';
import { getMediosMovimiento } from '../../services/MedioMovimientoService';
import { getEstadosMovimiento } from '../../services/EstadoMovimientoService';
import { getPersonas } from '../../services/PersonaService';

import MovimientoTable from './MovimientoTable';
import MovimientoModal from './MovimientoModal';
import MovimientoDetalle from './MovimientoDetalle';

import {
  getDescripcion,
  getReferencia,
  getTipoDescripcion,
  getMedioDescripcion,
  getPersonaNombre,
  getMonto,
  esIngreso,
} from './MovimientoHelpers';

import './Movimiento.css';

const getCuentaId = (c) =>
  c?.cUB_Cuenta ?? c?.cuB_Cuenta ?? c?.cub_cuenta ?? 0;

const getNumeroCuenta = (c) =>
  c?.cUB_Numero_Cuenta ?? c?.cuB_Numero_Cuenta ?? c?.cub_numero_cuenta ?? '';

const getBancoNombre = (c) =>
  c?.bAN_Nombre ?? c?.baN_Nombre ?? c?.ban_nombre ?? '';

const getNombre = (c) =>
  c?.cUB_Primer_Nombre ?? c?.cuB_Primer_Nombre ?? c?.cub_primer_nombre ?? '';

const getApellido = (c) =>
  c?.cUB_Primer_Apellido ?? c?.cuB_Primer_Apellido ?? c?.cub_primer_apellido ?? '';

const getTitular = (c) => `${getNombre(c)} ${getApellido(c)}`.trim();

const MovimientoPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movimientoDetalle, setMovimientoDetalle] = useState(null);

  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [mediosMovimiento, setMediosMovimiento] = useState([]);
  const [estadosMovimiento, setEstadosMovimiento] = useState([]);
  const [personas, setPersonas] = useState([]);

  const [cuentas, setCuentas] = useState([]);
  const [cuentaSeleccionadaId, setCuentaSeleccionadaId] = useState('');

  useEffect(() => {
    fetchMovimientos();
    fetchCatalogos();
  }, []);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const data = await getMovimientos();
      const lista = Array.isArray(data) ? data : [];
      setMovimientos(lista);
      setFiltered(lista);
      setError(null);
    } catch (err) {
      console.error('Error cargando movimientos:', err);
      setError('No se pudieron cargar los movimientos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const [tipos, medios, estados, personasResp, cuentasResp] = await Promise.all([
        getTiposMovimiento(),
        getMediosMovimiento(),
        getEstadosMovimiento(),
        getPersonas(),
        getCuentas(),
      ]);

      const listaCuentas = Array.isArray(cuentasResp) ? cuentasResp : [];

      setTiposMovimiento(Array.isArray(tipos) ? tipos : []);
      setMediosMovimiento(Array.isArray(medios) ? medios : []);
      setEstadosMovimiento(Array.isArray(estados) ? estados : []);
      setPersonas(Array.isArray(personasResp) ? personasResp : []);
      setCuentas(listaCuentas);

      if (listaCuentas.length > 0) {
        setCuentaSeleccionadaId(String(getCuentaId(listaCuentas[0])));
      }
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!search.trim()) {
        setFiltered(movimientos);
        return;
      }

      const q = search.toLowerCase();

      setFiltered(
        movimientos.filter((m) => {
          const descripcion = String(getDescripcion(m) || '').toLowerCase();
          const referencia = String(getReferencia(m) || '').toLowerCase();
          const tipo = String(getTipoDescripcion(m) || '').toLowerCase();
          const medio = String(getMedioDescripcion(m) || '').toLowerCase();
          const persona = String(getPersonaNombre(m) || '').toLowerCase();

          return (
            descripcion.includes(q) ||
            referencia.includes(q) ||
            tipo.includes(q) ||
            medio.includes(q) ||
            persona.includes(q)
          );
        })
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [search, movimientos]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const cuentaSeleccionada = useMemo(() => {
    return cuentas.find(c => String(getCuentaId(c)) === String(cuentaSeleccionadaId)) || null;
  }, [cuentas, cuentaSeleccionadaId]);

  const handleOpenCreate = () => {
    if (!cuentaSeleccionadaId) {
      alert('Debes seleccionar una cuenta antes de crear el movimiento.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      await createMovimiento(formData);
      showSuccess('Movimiento creado correctamente.');
      setIsModalOpen(false);
      await fetchMovimientos();
    } catch (err) {
      console.error('Error guardando movimiento:', err);
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
      console.error('Error anulando movimiento:', err);
      alert(err?.response?.data?.mensaje || 'Error al anular el movimiento.');
    }
  };

  const totalIngresos = movimientos
    .filter((m) => esIngreso(m))
    .reduce((sum, m) => sum + getMonto(m), 0);

  const totalEgresos = movimientos
    .filter((m) => !esIngreso(m))
    .reduce((sum, m) => sum + getMonto(m), 0);

  if (movimientoDetalle) {
    return (
      <div className="movimiento-container">
        <MovimientoDetalle
          movimiento={movimientoDetalle}
          onBack={() => setMovimientoDetalle(null)}
        />
      </div>
    );
  }

  return (
    <div className="movimiento-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Movimientos</h1>
          <span className="record-count">{movimientos.length} registros</span>
        </div>

        <button className="btn-primary" onClick={handleOpenCreate} type="button">
          <Plus size={16} />
          Nuevo movimiento
        </button>
      </div>

      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <div className="input-group" style={{ minWidth: 340 }}>
          <label>Cuenta para registrar</label>
          <select
            value={cuentaSeleccionadaId}
            onChange={(e) => setCuentaSeleccionadaId(e.target.value)}
          >
            <option value="">Seleccionar cuenta</option>
            {cuentas.map((c) => (
              <option key={getCuentaId(c)} value={String(getCuentaId(c))}>
                {getNumeroCuenta(c)} · {getBancoNombre(c)} · {getTitular(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por descripción, referencia, persona, medio o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="kpi-grid">
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
            <div className="kpi-label">Total ingresos</div>
            <div className="kpi-value" style={{ color: '#15803d' }}>
              Q {totalIngresos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="kpi-icon" style={{ background: '#dcfce7' }}>
            <ArrowLeftRight size={20} color="#15803d" />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #b91c1c' }}>
          <div>
            <div className="kpi-label">Total egresos</div>
            <div className="kpi-value" style={{ color: '#b91c1c' }}>
              Q {totalEgresos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="kpi-icon" style={{ background: '#fee2e2' }}>
            <ArrowLeftRight size={20} color="#b91c1c" />
          </div>
        </div>
      </div>

      {success && (
        <div className="success-banner">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Cargando movimientos...</div>
      ) : (
        <MovimientoTable
          movimientos={filtered}
          onView={setMovimientoDetalle}
          onAnular={handleAnular}
        />
      )}

      <MovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        cuentaId={cuentaSeleccionada ? getCuentaId(cuentaSeleccionada) : ''}
        numeroCuenta={cuentaSeleccionada ? getNumeroCuenta(cuentaSeleccionada) : ''}
        personas={personas}
        tiposMovimiento={tiposMovimiento}
        mediosMovimiento={mediosMovimiento}
        estadosMovimiento={estadosMovimiento}
      />
    </div>
  );
};

export default MovimientoPage;