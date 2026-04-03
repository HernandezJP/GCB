import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, ArrowLeft, CreditCard,
         ArrowLeftRight, FileText, BookOpen, FileCheck } from 'lucide-react';
import {
    getCuentas, createCuenta, updateCuenta,
    deleteCuenta, reactivarCuenta
} from '../../services/CuentaBancariaService';
import { getBancos }        from '../../services/bancoService';
import { getTiposCuenta }   from '../../services/tipoCuentaService';
import { getTiposMoneda }   from '../../services/tipoMonedaService';
import { getEstadosCuenta } from '../../services/estadoCuentaService';

import CuentaBancariaTable  from './CuentaBancariaTable';
import CuentaBancariaModal, {
    getId, getBancoNombre, getNumero, getNombre, getApellido,
    getTipoCuenta, getMoneda, getSimbolo, getSaldoInicial,
    getSaldoActual, getEstadoDesc, isActivo
} from './CuentaBancariaModal';
import './CuentaBancaria.css';

// ── Tabs de la cuenta ─────────────────────────────────────────────
const TABS = [
    { key:'movimientos',  label:'Movimientos',  icon:<ArrowLeftRight size={14}/> },
    { key:'cheques',      label:'Cheques',       icon:<FileText size={14}/> },
    { key:'chequeras',    label:'Chequeras',     icon:<BookOpen size={14}/> },
    { key:'conciliacion', label:'Conciliación',  icon:<FileCheck size={14}/> },
];

// ── Placeholder tabs (se reemplazarán con los componentes reales) ──
const TabPlaceholder = ({ label }) => (
    <div style={{ padding:'40px', textAlign:'center', color:'#94a3b8', fontSize:14 }}>
        Módulo de <strong>{label}</strong> — conectar con el tab correspondiente.
    </div>
);

// ── Vista detalle de una cuenta ───────────────────────────────────
const CuentaDetalle = ({ cuenta, onBack }) => {
    const [tab,     setTab]     = useState('movimientos');
    const simbolo               = getSimbolo(cuenta);
    const titular               = `${getNombre(cuenta)} ${getApellido(cuenta)}`.trim();

    return (
        <div>
            <button className="btn-secondary" style={{ marginBottom:16 }} onClick={onBack}>
                <ArrowLeft size={15} /> Volver a cuentas
            </button>

            <div className="detalle-card">
                {/* Header */}
                <div className="detalle-header">
                    <div className="detalle-icon"><CreditCard size={26} /></div>
                    <div>
                        <h2>{getBancoNombre(cuenta)}</h2>
                        <p className="detalle-subtitle">
                            <code style={{ fontFamily:'monospace', fontWeight:700, color:'#0284c7' }}>
                                {getNumero(cuenta)}
                            </code>
                            {' · '}{getTipoCuenta(cuenta)}
                            {' · '}{getMoneda(cuenta)}
                        </p>
                    </div>
                    <div className="detalle-status">
                        <span className={`status-pill ${isActivo(cuenta)?'pill-green':'pill-red'}`}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:isActivo(cuenta)?'#22c55e':'#ef4444', display:'inline-block' }}/>
                            {isActivo(cuenta) ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="detalle-stats">
                    {[
                        { label:'Titular',       val: titular || '—' },
                        { label:'Estado cuenta', val: getEstadoDesc(cuenta) || '—' },
                        { label:'Saldo inicial',
                          val:`${simbolo} ${getSaldoInicial(cuenta).toLocaleString('es-GT',{minimumFractionDigits:2})}` },
                        { label:'Saldo actual',
                          val:`${simbolo} ${getSaldoActual(cuenta).toLocaleString('es-GT',{minimumFractionDigits:2})}`,
                          color: getSaldoActual(cuenta) < 0 ? '#b91c1c' : '#15803d' },
                    ].map((s,i) => (
                        <div key={i} className="detalle-stat">
                            <div className="detalle-stat-label">{s.label}</div>
                            <div className="detalle-stat-value" style={{ color: s.color||'#0f172a' }}>{s.val}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="tabs-bar">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            className={`tab-btn ${tab===t.key?'active':''}`}
                            onClick={() => setTab(t.key)}
                        >
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>

                {/* Contenido tab */}
                <div className="tab-content">
                    {tab === 'movimientos'  && <TabPlaceholder label="Movimientos" />}
                    {tab === 'cheques'      && <TabPlaceholder label="Cheques" />}
                    {tab === 'chequeras'    && <TabPlaceholder label="Chequeras" />}
                    {tab === 'conciliacion' && <TabPlaceholder label="Conciliación" />}
                </div>
            </div>
        </div>
    );
};

// ── Página principal ──────────────────────────────────────────────
const CuentaBancariaPage = () => {
    const [cuentas,       setCuentas]       = useState([]);
    const [filtered,      setFiltered]      = useState([]);
    const [search,        setSearch]        = useState('');
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState(null);
    const [success,       setSuccess]       = useState('');
    const [isModalOpen,   setIsModalOpen]   = useState(false);
    const [cuentaEdit,    setCuentaEdit]    = useState(null);
    const [cuentaDetalle, setCuentaDetalle] = useState(null);

    const [bancos,        setBancos]        = useState([]);
    const [tiposCuenta,   setTiposCuenta]   = useState([]);
    const [tiposMoneda,   setTiposMoneda]   = useState([]);
    const [estadosCuenta, setEstadosCuenta] = useState([]);

    const fetchCuentas = async () => {
        try {
            setLoading(true);
            const data = await getCuentas();
            if (data?.length > 0) {
                console.group('🏦 CuentaBancaria API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.groupEnd();
            }
            setCuentas(data);
            setFiltered(data);
            setError(null);
        } catch (err) {
            console.error('Error al obtener cuentas:', err);
            setError('No se pudieron cargar las cuentas bancarias.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogos = async () => {
        try {
            const [b, tc, tm, ec] = await Promise.all([
                getBancos(), getTiposCuenta(), getTiposMoneda(), getEstadosCuenta()
            ]);
            setBancos(b||[]);
            setTiposCuenta(tc||[]);
            setTiposMoneda(tm||[]);
            setEstadosCuenta(ec||[]);
        } catch (err) {
            console.error('Error al cargar catálogos:', err);
        }
    };

    useEffect(() => { fetchCuentas(); fetchCatalogos(); }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            if (!search.trim()) { setFiltered(cuentas); return; }
            const q = search.toLowerCase();
            setFiltered(cuentas.filter(c =>
                getNumero(c).toLowerCase().includes(q) ||
                getBancoNombre(c).toLowerCase().includes(q) ||
                `${getNombre(c)} ${getApellido(c)}`.toLowerCase().includes(q) ||
                getTipoCuenta(c).toLowerCase().includes(q)
            ));
        }, 300);
        return () => clearTimeout(t);
    }, [search, cuentas]);

    const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

    const handleSave = async (formData) => {
        try {
            if (cuentaEdit) {
                await updateCuenta(getId(cuentaEdit), {
                    CUB_Primer_Nombre:    formData.CUB_Primer_Nombre,
                    CUB_Segundo_Nombre:   formData.CUB_Segundo_Nombre,
                    CUB_Primer_Apellido:  formData.CUB_Primer_Apellido,
                    CUB_Segundo_Apellido: formData.CUB_Segundo_Apellido,
                    ESC_Estado_Cuenta:    formData.ESC_Estado_Cuenta,
                });
                showSuccess('Cuenta bancaria actualizada correctamente.');
            } else {
                await createCuenta(formData);
                showSuccess('Cuenta bancaria creada correctamente.');
            }
            setIsModalOpen(false);
            setCuentaEdit(null);
            await fetchCuentas();
        } catch (err) {
            const msg = err.response?.data?.mensaje || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) { alert('Error: ID no detectado.'); return; }
        if (!window.confirm(`¿Deseas ${nuevoActivo?'activar':'desactivar'} esta cuenta?`)) return;
        try {
            if (nuevoActivo) await reactivarCuenta(id);
            else             await deleteCuenta(id);
            showSuccess(`Cuenta ${nuevoActivo?'activada':'desactivada'} correctamente.`);
            await fetchCuentas();
        } catch (err) {
            alert('Error al cambiar el estado.');
        }
    };

    const totalGTQ = cuentas.filter(c => getSimbolo(c)==='Q').reduce((s,c) => s+getSaldoActual(c), 0);
    const totalUSD = cuentas.filter(c => getSimbolo(c)==='$').reduce((s,c) => s+getSaldoActual(c), 0);

    // Vista detalle
    if (cuentaDetalle) {
        return (
            <div className="cuentabancaria-container">
                <CuentaDetalle
                    cuenta={cuentaDetalle}
                    onBack={() => setCuentaDetalle(null)}
                />
            </div>
        );
    }

    return (
        <div className="cuentabancaria-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Cuentas bancarias</h1>
                    <span className="record-count">{filtered.length} registros</span>
                </div>
                <button className="btn-primary" onClick={() => { setCuentaEdit(null); setIsModalOpen(true); }}>
                    <Plus size={18} /> Nueva cuenta
                </button>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                {[
                    { label:'Total GTQ',       val:`Q ${totalGTQ.toLocaleString('es-GT',{minimumFractionDigits:2})}`, color:'#0284c7', bg:'#e6f1fb' },
                    { label:'Total USD',       val:`$ ${totalUSD.toLocaleString('en-US',{minimumFractionDigits:2})}`, color:'#15803d', bg:'#dcfce7' },
                    { label:'Cuentas activas', val:cuentas.filter(c=>isActivo(c)).length,                              color:'#7c3aed', bg:'#ede9fe' },
                    { label:'Total cuentas',   val:cuentas.length,                                                      color:'#64748b', bg:'#f1f5f9' },
                ].map((s,i) => (
                    <div key={i} className="kpi-card" style={{ borderLeft:`4px solid ${s.color}` }}>
                        <div>
                            <div className="kpi-label">{s.label}</div>
                            <div className="kpi-value" style={{ color:s.color, fontSize:i<2?'15px':'22px' }}>{s.val}</div>
                        </div>
                        <div className="kpi-icon" style={{ background:s.bg }}>
                            <CreditCard size={20} color={s.color}/>
                        </div>
                    </div>
                ))}
            </div>

            {success && (
                <div className="success-banner"><CheckCircle size={16}/>{success}</div>
            )}
            {error && <div className="error-banner">{error}</div>}

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={15} className="search-icon"/>
                    <input
                        type="text"
                        placeholder="Buscar por número, banco, titular o tipo..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading
                ? <div className="loading-state">Cargando cuentas bancarias...</div>
                : <CuentaBancariaTable
                    cuentas={filtered}
                    onView={setCuentaDetalle}
                    onEdit={c => { setCuentaEdit(c); setIsModalOpen(true); }}
                    onToggleStatus={handleToggleStatus}
                  />
            }

            <CuentaBancariaModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setCuentaEdit(null); }}
                onSave={handleSave}
                cuentaToEdit={cuentaEdit}
                bancos={bancos}
                tiposCuenta={tiposCuenta}
                tiposMoneda={tiposMoneda}
                estadosCuenta={estadosCuenta}
            />
        </div>
    );
};

export default CuentaBancariaPage;