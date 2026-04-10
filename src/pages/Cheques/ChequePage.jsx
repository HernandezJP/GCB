import React, { useEffect, useState } from 'react';
import { Plus, Search, CheckCircle, FileText } from 'lucide-react';
import {
  getCheques,
  createCheque,
  updateCheque,
  deleteCheque
} from '../../services/chequeService';
import ChequeTable from './ChequeTable';
import ChequeModal, {
  getId,
  getChequera,
  getBeneficiario
} from './ChequeModal';
import './Cheque.css';

const ChequePage = () => {
  const [cheques, setCheques] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chequeEdit, setChequeEdit] = useState(null);

  useEffect(() => {
    fetchCheques();
  }, []);

  const fetchCheques = async () => {
    try {
      setLoading(true);
      const data = await getCheques();
      setCheques(data || []);
      setFiltered(data || []);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los cheques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) {
        setFiltered(cheques);
        return;
      }

      const q = search.toLowerCase();

      setFiltered(
        cheques.filter((c) =>
          String(c.CHE_Numero_Cheque ?? c.chE_Numero_Cheque ?? '').toLowerCase().includes(q) ||
          String(getChequera(c) ?? '').toLowerCase().includes(q) ||
          String(getBeneficiario(c) ?? '').toLowerCase().includes(q)
        )
      );
    }, 300);

    return () => clearTimeout(t);
  }, [search, cheques]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = async (formData) => {
    try {
      if (chequeEdit) {
        await updateCheque(getId(chequeEdit), formData);
        showSuccess('Cheque actualizado correctamente.');
      } else {
        await createCheque(formData);
        showSuccess('Cheque creado correctamente.');
      }

      setIsModalOpen(false);
      setChequeEdit(null);
      await fetchCheques();
    } catch (err) {
      alert(err?.response?.data?.mensaje || 'Error al guardar el cheque.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este cheque?')) return;

    try {
      await deleteCheque(id);
      showSuccess('Cheque eliminado correctamente.');
      await fetchCheques();
    } catch (err) {
      alert(err?.response?.data?.mensaje || 'Error al eliminar el cheque.');
    }
  };

  const totalCheques = cheques.length;
  const conChequera = cheques.filter(c => Number(getChequera(c)) > 0).length;
  const conBeneficiario = cheques.filter(c => String(getBeneficiario(c) || '').trim() !== '').length;

  return (
    <div className="cheque-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Cheques</h1>
          <span className="record-count">{filtered.length} registros</span>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setChequeEdit(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Nuevo cheque
        </button>
      </div>

      <div className="kpi-grid">
        {[
          { label: 'Total cheques', val: totalCheques, color: '#0284c7', bg: '#eff6ff' },
          { label: 'Con chequera', val: conChequera, color: '#7c3aed', bg: '#f3e8ff' },
          { label: 'Con beneficiario', val: conBeneficiario, color: '#16a34a', bg: '#dcfce7' }
        ].map((s, i) => (
          <div key={i} className="kpi-card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div>
              <div className="kpi-label">{s.label}</div>
              <div className="kpi-value" style={{ color: s.color }}>
                {s.val}
              </div>
            </div>
            <div className="kpi-icon" style={{ background: s.bg }}>
              <FileText size={20} color={s.color} />
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
            placeholder="Buscar por número, chequera o beneficiario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Cargando cheques...</div>
      ) : (
        <ChequeTable
          cheques={filtered}
          onEdit={(c) => {
            setChequeEdit(c);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <ChequeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setChequeEdit(null);
        }}
        onSave={handleSave}
        chequeToEdit={chequeEdit}
      />
    </div>
  );
};

export default ChequePage;