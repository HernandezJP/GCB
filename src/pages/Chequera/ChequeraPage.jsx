import React, { useEffect, useState } from 'react';
import { Plus, Search, CheckCircle, BookOpen, ArrowLeft } from 'lucide-react';
import {
  getChequeras,
  createChequera,
  updateChequera,
  deleteChequera,
  reactivarChequera
} from '../../services/ChequeraService';
import ChequeraTable from './ChequeraTable';
import ChequeraModal, {
  getId,
  getSerie,
  getCuenta,
  getEstado,
  getNumeroDesde,
  getNumeroHasta,
  getUltimoUsado,
  getFechaRecepcion,
  isActiva
} from './ChequeraModal';
import './Chequera.css';

const ChequeraDetail = ({ chequera, onBack, onEdit }) => {
  const desde = Number(getNumeroDesde(chequera));
  const hasta = Number(getNumeroHasta(chequera));
  const ultimo = Number(getUltimoUsado(chequera));
  const disponibles = Math.max(hasta - ultimo, 0);

  return (
    <div>
      <button className="btn-secondary" style={{ marginBottom: 16 }} onClick={onBack}>
        <ArrowLeft size={15} /> Volver a chequeras
      </button>

      <div className="detalle-card">
        <div className="detalle-header">
          <div className="detalle-icon">
            <BookOpen size={26} />
          </div>

          <div>
            <h2>Chequera {getSerie(chequera)}</h2>
            <p className="detalle-subtitle">
              Cuenta #{getCuenta(chequera)}
              {' · '}Rango {desde} - {hasta}
            </p>
          </div>

          <div className="detalle-status">
            <span className={`status-pill ${isActiva(chequera) ? 'pill-green' : 'pill-red'}`}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isActiva(chequera) ? '#22c55e' : '#ef4444',
                  display: 'inline-block',
                  marginRight: 8
                }}
              />
              {isActiva(chequera) ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        <div className="detalle-stats">
          {[
            { label: 'Serie', val: getSerie(chequera) || '—' },
            { label: 'Cuenta', val: getCuenta(chequera) || '—' },
            { label: 'Último usado', val: ultimo },
            { label: 'Disponibles', val: disponibles, color: disponibles > 0 ? '#15803d' : '#b91c1c' },
            { label: 'Fecha recepción', val: String(getFechaRecepcion(chequera)).split('T')[0] || '—' },
            { label: 'Estado', val: isActiva(chequera) ? 'Activa' : 'Inactiva' }
          ].map((s, i) => (
            <div key={i} className="detalle-stat">
              <div className="detalle-stat-label">{s.label}</div>
              <div className="detalle-stat-value" style={{ color: s.color || '#0f172a' }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>

        <div className="tab-content">
          <div className="tab-toolbar">
            <strong style={{ color: '#0f172a', fontSize: 14 }}>Información de la chequera</strong>
            <button className="btn-primary" onClick={() => onEdit(chequera)}>
              Editar chequera
            </button>
          </div>

          <div style={{ padding: 24, color: '#64748b', fontSize: 14 }}>
            Esta vista muestra el resumen general de la chequera seleccionada.
          </div>
        </div>
      </div>
    </div>
  );
};

const ChequeraPage = () => {
  const [chequeras, setChequeras] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chequeraEdit, setChequeraEdit] = useState(null);
  const [chequeraDetalle, setChequeraDetalle] = useState(null);

  useEffect(() => {
    fetchChequeras();
  }, []);

  const fetchChequeras = async () => {
    try {
      setLoading(true);
      const data = await getChequeras();
      setChequeras(data || []);
      setFiltered(data || []);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar las chequeras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) {
        setFiltered(chequeras);
        return;
      }

      const q = search.toLowerCase();

      setFiltered(
        chequeras.filter((c) =>
          String(getSerie(c) || '').toLowerCase().includes(q) ||
          String(getCuenta(c) || '').toLowerCase().includes(q) ||
          String(getEstado(c) || '').toLowerCase().includes(q)
        )
      );
    }, 300);

    return () => clearTimeout(t);
  }, [search, chequeras]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = async (formData) => {
    try {
      if (chequeraEdit) {
        await updateChequera(getId(chequeraEdit), formData);
        showSuccess('Chequera actualizada correctamente.');
      } else {
        await createChequera(formData);
        showSuccess('Chequera creada correctamente.');
      }

      setIsModalOpen(false);
      setChequeraEdit(null);
      await fetchChequeras();
    } catch (err) {
      alert(err?.response?.data?.mensaje || 'Error al guardar la chequera.');
    }
  };

  const handleToggleStatus = async (id, nuevoActivo) => {
    if (!window.confirm(`¿Deseas ${nuevoActivo ? 'activar' : 'desactivar'} esta chequera?`)) return;

    try {
      if (nuevoActivo) {
        await reactivarChequera(id);
        showSuccess('Chequera reactivada correctamente.');
      } else {
        await deleteChequera(id);
        showSuccess('Chequera desactivada correctamente.');
      }

      if (chequeraDetalle && getId(chequeraDetalle) === id) {
        setChequeraDetalle(null);
      }

      await fetchChequeras();
    } catch (err) {
      alert(err?.response?.data?.mensaje || 'Error al cambiar el estado.');
    }
  };

  const totalChequeras = chequeras.length;
  const activas = chequeras.filter((c) => getEstado(c) === 'A').length;
  const disponibles = chequeras.reduce((acc, c) => {
    const hasta = Number(getNumeroHasta(c));
    const ultimo = Number(getUltimoUsado(c));
    return acc + Math.max(hasta - ultimo, 0);
  }, 0);

  if (chequeraDetalle) {
    return (
      <div className="chequera-container">
        <ChequeraDetail
          chequera={chequeraDetalle}
          onBack={() => setChequeraDetalle(null)}
          onEdit={(c) => {
            setChequeraEdit(c);
            setIsModalOpen(true);
          }}
        />

        <ChequeraModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setChequeraEdit(null);
          }}
          onSave={handleSave}
          chequeraToEdit={chequeraEdit}
        />
      </div>
    );
  }

  return (
    <div className="chequera-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Chequeras</h1>
          <span className="record-count">{filtered.length} registros</span>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setChequeraEdit(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Nueva chequera
        </button>
      </div>

      <div className="kpi-grid">
        {[
          { label: 'Total chequeras', val: totalChequeras, color: '#0284c7', bg: '#eff6ff' },
          { label: 'Chequeras activas', val: activas, color: '#7c3aed', bg: '#f3e8ff' },
          { label: 'Cheques disponibles', val: disponibles, color: '#16a34a', bg: '#dcfce7' }
        ].map((s, i) => (
          <div key={i} className="kpi-card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div>
              <div className="kpi-label">{s.label}</div>
              <div className="kpi-value" style={{ color: s.color }}>
                {s.val}
              </div>
            </div>
            <div className="kpi-icon" style={{ background: s.bg }}>
              <BookOpen size={20} color={s.color} />
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
            placeholder="Buscar por serie, cuenta o estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Cargando chequeras...</div>
      ) : (
        <ChequeraTable
          chequeras={filtered}
          onView={setChequeraDetalle}
          onEdit={(c) => {
            setChequeraEdit(c);
            setIsModalOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <ChequeraModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setChequeraEdit(null);
        }}
        onSave={handleSave}
        chequeraToEdit={chequeraEdit}
      />
    </div>
  );
};

export default ChequeraPage;