import React, { useEffect, useState } from 'react';
import { Plus, Search, CheckCircle, Scale } from 'lucide-react';

import {
  getConciliacionesPorCuenta,
  getConciliacionById,
  getDetalleConciliacion,
  procesarConciliacion,
  registrarEnLibros,
  marcarEnTransito,
  aceptarManual,
  recalcularEstadoConciliacion,
  cerrarConciliacion,
} from '../../services/ConciliacionService';

import ConciliacionTable from './ConciliacionTable';
import ConciliacionCargaModal from './ConciliacionCargaModal';
import ConciliacionDetalle from './ConciliacionDetalle';

import {
  getConciliacionId,
  getPeriodo,
  getEstadoConciliacionDescripcion,
  getDiferencia,
} from './ConciliacionHelpers';

const ConciliacionTab = ({ cuentaId, numeroCuenta, simbolo = 'Q' }) => {
  const [conciliaciones, setConciliaciones] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [conciliacionDetalle, setConciliacionDetalle] = useState(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (cuentaId) fetchConciliaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentaId]);

  const fetchConciliaciones = async () => {
    try {
      setLoading(true);
      const data = await getConciliacionesPorCuenta(cuentaId);
      const lista = Array.isArray(data) ? data : [];
      setConciliaciones(lista);
      setFiltered(lista);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las conciliaciones de esta cuenta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!search.trim()) {
        setFiltered(conciliaciones);
        return;
      }

      const q = search.toLowerCase();

      setFiltered(
        conciliaciones.filter((c) => {
          const periodo = String(getPeriodo(c) || '').toLowerCase();
          const estado = String(getEstadoConciliacionDescripcion(c) || '').toLowerCase();
          return periodo.includes(q) || estado.includes(q);
        })
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [search, conciliaciones]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleProcesar = async (formData) => {
    try {
      const resp = await procesarConciliacion(formData);
      showSuccess(resp?.mensaje || 'Conciliación procesada correctamente.');
      setIsModalOpen(false);
      await fetchConciliaciones();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.mensaje || 'Error al procesar la conciliación.');
    }
  };

  const handleView = async (item) => {
    try {
      const id = getConciliacionId(item);
      const [cab, det] = await Promise.all([
        getConciliacionById(id),
        getDetalleConciliacion(id),
      ]);

      setConciliacionDetalle(cab);
      setDetalle(Array.isArray(det) ? det : []);
    } catch (err) {
      console.error(err);
      alert('No se pudo cargar el detalle de la conciliación.');
    }
  };

  const recargarDetalle = async (id) => {
    const [cab, det] = await Promise.all([
      getConciliacionById(id),
      getDetalleConciliacion(id),
    ]);

    setConciliacionDetalle(cab);
    setDetalle(Array.isArray(det) ? det : []);
    await fetchConciliaciones();
  };

  const handleRegistrarEnLibros = async (detalleId) => {
    try {
      await registrarEnLibros(detalleId);
      showSuccess('Movimiento registrado en libros correctamente.');
      await recargarDetalle(getConciliacionId(conciliacionDetalle));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.mensaje || 'Error al registrar el movimiento en libros.');
    }
  };

  const handleMarcarEnTransito = async (detalleId) => {
    try {
      await marcarEnTransito(detalleId);
      showSuccess('Detalle marcado en tránsito correctamente.');
      await recargarDetalle(getConciliacionId(conciliacionDetalle));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.mensaje || 'Error al marcar en tránsito.');
    }
  };

  const handleAceptarManual = async (detalleId) => {
    try {
      await aceptarManual(detalleId);
      showSuccess('Detalle aceptado manualmente.');
      await recargarDetalle(getConciliacionId(conciliacionDetalle));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.mensaje || 'Error al aceptar manualmente.');
    }
  };

  const handleRecalcular = async (id) => {
    try {
      await recalcularEstadoConciliacion(id);
      showSuccess('Estado recalculado correctamente.');
      if (conciliacionDetalle && getConciliacionId(conciliacionDetalle) === id) {
        await recargarDetalle(id);
      } else {
        await fetchConciliaciones();
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.mensaje || 'Error al recalcular la conciliación.');
    }
  };

  const handleCerrar = async (id) => {
    if (!window.confirm('¿Deseas cerrar esta conciliación?')) return;

    try {
      await cerrarConciliacion(id);
      showSuccess('Conciliación cerrada correctamente.');
      if (conciliacionDetalle && getConciliacionId(conciliacionDetalle) === id) {
        await recargarDetalle(id);
      } else {
        await fetchConciliaciones();
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.mensaje || 'Error al cerrar la conciliación.');
    }
  };

  const totalConciliadas = conciliaciones.filter((c) =>
    String(getEstadoConciliacionDescripcion(c)).toLowerCase().includes('conciliada')
  ).length;

  const totalDiferencias = conciliaciones.filter((c) =>
    String(getEstadoConciliacionDescripcion(c)).toLowerCase().includes('diferencia')
  ).length;

  const totalCerradas = conciliaciones.filter((c) =>
    String(getEstadoConciliacionDescripcion(c)).toLowerCase().includes('cerrada')
  ).length;

  const totalDescuadre = conciliaciones.reduce((sum, c) => sum + Math.abs(getDiferencia(c)), 0);

  if (conciliacionDetalle) {
    return (
      <div style={{ padding: 20 }}>
        <ConciliacionDetalle
          conciliacion={conciliacionDetalle}
          detalle={detalle}
          onBack={() => {
            setConciliacionDetalle(null);
            setDetalle([]);
          }}
          onRegistrarEnLibros={handleRegistrarEnLibros}
          onMarcarEnTransito={handleMarcarEnTransito}
          onAceptarManual={handleAceptarManual}
          onRecalcular={() => handleRecalcular(getConciliacionId(conciliacionDetalle))}
          onCerrar={() => handleCerrar(getConciliacionId(conciliacionDetalle))}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-left">
          <h1 style={{ fontSize: '1.2rem' }}>Conciliación de la cuenta</h1>
          <span className="record-count">{filtered.length} registros · {numeroCuenta}</span>
        </div>

        <button className="btn-primary" onClick={() => setIsModalOpen(true)} type="button">
          <Plus size={16} />
          Nueva conciliación
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div>
            <div className="kpi-label">Total conciliaciones</div>
            <div className="kpi-value">{conciliaciones.length}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#e0f2fe' }}>
            <Scale size={20} color="#0284c7" />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #15803d' }}>
          <div>
            <div className="kpi-label">Conciliadas</div>
            <div className="kpi-value" style={{ color: '#15803d' }}>{totalConciliadas}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#dcfce7' }}>
            <CheckCircle size={20} color="#15803d" />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #b91c1c' }}>
          <div>
            <div className="kpi-label">Con diferencias</div>
            <div className="kpi-value" style={{ color: '#b91c1c' }}>{totalDiferencias}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#fee2e2' }}>
            <Scale size={20} color="#b91c1c" />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div>
            <div className="kpi-label">Cerradas</div>
            <div className="kpi-value" style={{ color: '#7c3aed' }}>{totalCerradas}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#ede9fe' }}>
            <Scale size={20} color="#7c3aed" />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #64748b' }}>
          <div>
            <div className="kpi-label">Descuadre total</div>
            <div className="kpi-value" style={{ color: '#64748b' }}>
              {simbolo} {totalDescuadre.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="kpi-icon" style={{ background: '#f1f5f9' }}>
            <Scale size={20} color="#64748b" />
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

      <div className="toolbar">
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por período o estado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Cargando conciliaciones...</div>
      ) : (
        <ConciliacionTable
          conciliaciones={filtered}
          onView={handleView}
          onRecalcular={handleRecalcular}
          onCerrar={handleCerrar}
        />
      )}

      <ConciliacionCargaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleProcesar}
        cuentas={[
          {
            cUB_Cuenta: cuentaId,
            cUB_Numero_Cuenta: numeroCuenta,
            bAN_Nombre: '',
            cUB_Primer_Nombre: '',
            cUB_Primer_Apellido: '',
          }
        ]}
        cuentaIdInicial={cuentaId}
      />
    </div>
  );
};

export default ConciliacionTab;