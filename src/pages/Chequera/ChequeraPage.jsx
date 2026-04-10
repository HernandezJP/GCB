import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, CheckCircle, Loader } from 'lucide-react';
import {
    getChequeras,
    deleteChequera,
    reactivarChequera,
    createChequera
} from '../../services/ChequeraService';
import { getCuentas } from '../../services/CuentaBancariaService';
import { getBancos } from '../../services/BancoService';
import ChequeraTable, { getQEstado } from './ChequeraTable';
import ChequeraDetalle from './ChequeraDetalle';
import ChequeraModal from './ChequeraModal';
import './Chequera.css';

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v != null) return v;
    }
    return null;
};

const getChequeraCuentaId = (q) =>
    g(q, 'cuB_Cuenta', 'cUB_Cuenta', 'CUB_Cuenta');

const getCuentaId = (c) =>
    g(c, 'cuB_Cuenta', 'cUB_Cuenta', 'CUB_Cuenta');

const getCuentaNumero = (c) =>
    g(c, 'cuB_Numero_Cuenta', 'cUB_Numero_Cuenta', 'CUB_Numero_Cuenta');

const getCuentaBancoId = (c) =>
    g(c, 'bAN_Banco', 'ban_Banco', 'BAN_Banco');

const getBancoId = (b) =>
    g(b, 'bAN_Banco', 'ban_Banco', 'BAN_Banco');

const getBancoNombre = (b) =>
    g(b, 'bAN_Nombre', 'ban_nombre', 'BAN_Nombre', 'ban_Nombre');

const getCuentaTitular = (c) => {
    const nombreCompleto =
        g(
            c,
            'nombreCompleto',
            'NombreCompleto',
            'cUB_Nombre_Completo',
            'cuB_Nombre_Completo',
            'CUB_Nombre_Completo'
        ) ?? '';

    if (nombreCompleto && String(nombreCompleto).trim().toLowerCase() !== 'string') {
        return String(nombreCompleto).trim();
    }

    const partes = [
        g(c, 'cuB_Primer_Nombre', 'cUB_Primer_Nombre', 'CUB_Primer_Nombre'),
        g(c, 'cuB_Segundo_Nombre', 'cUB_Segundo_Nombre', 'CUB_Segundo_Nombre'),
        g(c, 'cuB_Primer_Apellido', 'cUB_Primer_Apellido', 'CUB_Primer_Apellido'),
        g(c, 'cuB_Segundo_Apellido', 'cUB_Segundo_Apellido', 'CUB_Segundo_Apellido'),
    ].filter(Boolean);

    return partes.join(' ').trim();
};

const buildCuentaLabel = (c, bancos) => {
    const numero = getCuentaNumero(c) ?? 'Sin número';
    const bancoId = getCuentaBancoId(c);

    const bancoObj = bancos.find(b =>
        String(getBancoId(b)) === String(bancoId)
    );

    const bancoNombre = getBancoNombre(bancoObj);
    const titular = getCuentaTitular(c);

    let label = numero;

    if (bancoNombre) {
        label += ` - ${bancoNombre}`;
    }

    if (titular) {
        label += ` - ${titular}`;
    }

    return label;
};

const ChequeraPage = ({ cuentaId = null, modoDetalleCuenta = false }) => {
    const [chequeras, setChequeras] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [filtroCuenta, setFiltroCuenta] = useState(cuentaId ? String(cuentaId) : '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [detalle, setDetalle] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [cuentas, setCuentas] = useState([]);
    const [bancos, setBancos] = useState([]);

    useEffect(() => {
        if (cuentaId) setFiltroCuenta(String(cuentaId));
        else setFiltroCuenta('');
    }, [cuentaId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [data, cuentasData, bancosData] = await Promise.all([
                getChequeras(),
                getCuentas(),
                getBancos(),
            ]);

            setChequeras(data ?? []);
            setCuentas(cuentasData ?? []);
            setBancos(bancosData ?? []);
        } catch {
            setError('Error al cargar las chequeras.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [cuentaId, modoDetalleCuenta]);

    useEffect(() => {
        let result = [...chequeras];

        const cuentaFiltroReal = modoDetalleCuenta
            ? String(cuentaId ?? '')
            : filtroCuenta;

        if (cuentaFiltroReal) {
            result = result.filter(q =>
                String(getChequeraCuentaId(q)) === String(cuentaFiltroReal)
            );
        }

        if (search.trim()) {
            const q = search.toLowerCase();

            result = result.filter(c => {
                const serie = String(
                    g(c, 'chQ_Serie', 'cHQ_Serie', 'CHQ_Serie') ?? ''
                ).toLowerCase();

                const numDesde = String(
                    g(c, 'chQ_Numero_Desde', 'cHQ_Numero_Desde', 'CHQ_Numero_Desde') ?? ''
                );

                const numHasta = String(
                    g(c, 'chQ_Numero_Hasta', 'cHQ_Numero_Hasta', 'CHQ_Numero_Hasta') ?? ''
                );

                const cuentaNumero = String(
                    g(c, 'cuB_Numero_Cuenta', 'cUB_Numero_Cuenta', 'CUB_Numero_Cuenta') ?? ''
                );

                const banco = String(
                    g(c, 'bAN_Nombre', 'ban_nombre', 'BAN_Nombre') ?? ''
                ).toLowerCase();

                const titular = String(
                    g(c, 'titular', 'Titular', 'nombreCompleto', 'NombreCompleto') ?? ''
                ).toLowerCase();

                return (
                    serie.includes(q) ||
                    numDesde.includes(q) ||
                    numHasta.includes(q) ||
                    cuentaNumero.includes(q) ||
                    banco.includes(q) ||
                    titular.includes(q)
                );
            });
        }

        setFiltered(result);
    }, [chequeras, search, filtroCuenta, cuentaId, modoDetalleCuenta]);

    const cuentasFiltradasModal = useMemo(() => {
        if (!modoDetalleCuenta || !cuentaId) return cuentas;

        return cuentas.filter(c =>
            String(getCuentaId(c)) === String(cuentaId)
        );
    }, [cuentas, cuentaId, modoDetalleCuenta]);

    const showOk = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3500);
    };

    const showErr = (msg) => {
        setError(msg);
        setTimeout(() => setError(''), 4000);
    };

    const handleToggle = async (id, estaActivo) => {
        if (!window.confirm(`¿${estaActivo ? 'Desactivar' : 'Reactivar'} esta chequera?`)) return;

        try {
            if (estaActivo) await deleteChequera(id);
            else await reactivarChequera(id);

            showOk(`Chequera ${estaActivo ? 'desactivada' : 'reactivada'} correctamente.`);
            await fetchData();
        } catch (err) {
            showErr(err.response?.data?.mensaje ?? 'Error al cambiar el estado.');
        }
    };

    const handleSave = async (dto) => {
        setSaving(true);
        try {
            const dtoFinal =
                modoDetalleCuenta && cuentaId
                    ? { ...dto, cuB_Cuenta: Number(cuentaId) }
                    : dto;

            await createChequera(dtoFinal);
            setModalOpen(false);
            showOk('Chequera registrada correctamente.');
            await fetchData();
        } catch (err) {
            showErr(err.response?.data?.mensaje ?? 'Error al registrar la chequera.');
        } finally {
            setSaving(false);
        }
    };

    const activas = filtered.filter(c => {
        const e = getQEstado(c);
        return e === 'A' || e === 'Activa' || e === 'Activo';
    }).length;

    const agotadas = filtered.filter(c => {
        const desde = Number(g(c, 'chQ_Numero_Desde', 'cHQ_Numero_Desde', 'CHQ_Numero_Desde') ?? 0);
        const hasta = Number(g(c, 'chQ_Numero_Hasta', 'cHQ_Numero_Hasta', 'CHQ_Numero_Hasta') ?? 0);
        const ultimo = Number(g(c, 'chQ_Ultimo_Usado', 'cHQ_Ultimo_Usado', 'CHQ_Ultimo_Usado') ?? 0);
        return ultimo >= hasta && hasta >= desde;
    }).length;

    const inactivas = filtered.filter(c => {
        const e = getQEstado(c);
        return e === 'I' || e === 'Inactiva' || e === 'Desactivada';
    }).length;

    if (detalle) {
        return (
            <div className="chequera-container">
                <ChequeraDetalle chequera={detalle} onBack={() => setDetalle(null)} />
            </div>
        );
    }

    return (
        <div className="chequera-container">
            <div className="chq-page-header">
                <div>
                    <h1>{modoDetalleCuenta ? 'Chequeras de la cuenta' : 'Chequeras'}</h1>
                    <p className="chq-page-subtitle">
                        {modoDetalleCuenta
                            ? 'Consulta de chequeras asociadas a esta cuenta bancaria'
                            : 'Consulta general de todas las chequeras del sistema'}
                    </p>
                </div>

                <button className="btn-primary" onClick={() => setModalOpen(true)}>
                    + Registrar chequera
                </button>
            </div>

            <div className="chq-kpi-grid">
                {[
                    { label: 'Total', val: filtered.length, color: '#0284c7', bg: '#e0f2fe' },
                    { label: 'Activas', val: activas, color: '#15803d', bg: '#dcfce7' },
                    { label: 'Agotadas', val: agotadas, color: '#92400e', bg: '#fef3c7' },
                    { label: 'Inactivas', val: inactivas, color: '#64748b', bg: '#f1f5f9' },
                ].map((s, i) => (
                    <div key={i} className="chq-kpi-card" style={{ borderLeftColor: s.color }}>
                        <div>
                            <div className="chq-kpi-label">{s.label}</div>
                            <div className="chq-kpi-value" style={{ color: s.color }}>{s.val}</div>
                        </div>
                        <div className="chq-kpi-icon" style={{ background: s.bg }}>
                            <BookOpen size={18} color={s.color} />
                        </div>
                    </div>
                ))}
            </div>

            {success && <div className="chq-success"><CheckCircle size={15} />{success}</div>}
            {error && <div className="chq-error">{error}</div>}

            <div className="chq-toolbar">
                {!modoDetalleCuenta && (
                    <select
                        className="chq-filter-select chq-filter-account"
                        value={filtroCuenta}
                        onChange={(e) => setFiltroCuenta(e.target.value)}
                    >
                        <option value="">Todas las cuentas</option>
                        {cuentas.map((c, idx) => {
                            const id = getCuentaId(c);

                            return (
                                <option key={id ?? `cuenta-${idx}`} value={id ?? ''}>
                                    {buildCuentaLabel(c, bancos)}
                                </option>
                            );
                        })}
                    </select>
                )}

                <div className="chq-search-wrap">
                    <Search size={15} className="chq-search-icon" />
                    <input
                        className="chq-search-input"
                        placeholder="Buscar por serie, banco, cuenta o titular..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <span className="chq-toolbar-count">
                    {filtered.length} registros
                </span>
            </div>

            {loading ? (
                <div className="chq-loading">
                    <Loader size={22} color="#0284c7" />
                    <span>Cargando chequeras...</span>
                </div>
            ) : (
                <ChequeraTable
                    chequeras={filtered}
                    onVer={setDetalle}
                    onToggle={handleToggle}
                />
            )}

            <ChequeraModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                saving={saving}
                cuentas={cuentasFiltradasModal}
            />
        </div>
    );
};

export default ChequeraPage;