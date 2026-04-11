import React, { useState, useEffect, useMemo } from 'react';
import { Search, FileText, CheckCircle, Loader } from 'lucide-react';
import {
    getCheques,
    getChequesPorCuenta,
    cambiarEstadoCheque,
    createCheque
} from '../../services/ChequeService';
import api from '../../api/axios';
import ChequeTable, {
    getChId,
    getChNumero,
    getChBenef,
    getChMonto,
    getChEstado
} from './ChequeTable';
import ChequeDetalle from './ChequeDetalle';
import ChequeModal from './ChequeModal';
import { getChequeras } from '../../services/ChequeraService';
import { getCuentas } from '../../services/CuentaBancariaService';
import { getPersonas } from '../../services/PersonaService';
import { getBancos } from '../../services/BancoService';
import './Cheque.css';

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v != null) return v;
    }
    return null;
};

const getChequeCuentaId = (c) =>
    g(c, 'cUB_Cuenta', 'cuB_Cuenta', 'CUB_Cuenta');

const getChequeChequeraId = (c) =>
    g(c, 'chQ_Chequera', 'cHQ_Chequera', 'CHQ_Chequera');

const getChequeraId = (q) =>
    g(q, 'chQ_Chequera', 'cHQ_Chequera', 'CHQ_Chequera');

const getChequeraSerie = (q) =>
    g(q, 'chQ_Serie', 'cHQ_Serie', 'CHQ_Serie');

const getCuentaId = (c) =>
    g(c, 'cUB_Cuenta', 'cuB_Cuenta', 'CUB_Cuenta');

const getCuentaNumero = (c) =>
    g(c, 'cUB_Numero_Cuenta', 'cuB_Numero_Cuenta', 'CUB_Numero_Cuenta');

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
        g(c, 'cUB_Primer_Nombre', 'cuB_Primer_Nombre', 'CUB_Primer_Nombre'),
        g(c, 'cUB_Segundo_Nombre', 'cuB_Segundo_Nombre', 'CUB_Segundo_Nombre'),
        g(c, 'cUB_Primer_Apellido', 'cuB_Primer_Apellido', 'CUB_Primer_Apellido'),
        g(c, 'cUB_Segundo_Apellido', 'cuB_Segundo_Apellido', 'CUB_Segundo_Apellido'),
        g(c, 'peR_Primer_Nombre', 'pER_Primer_Nombre', 'PER_Primer_Nombre'),
        g(c, 'peR_Segundo_Nombre', 'pER_Segundo_Nombre', 'PER_Segundo_Nombre'),
        g(c, 'peR_Primer_Apellido', 'pER_Primer_Apellido', 'PER_Primer_Apellido'),
        g(c, 'peR_Segundo_Apellido', 'pER_Segundo_Apellido', 'PER_Segundo_Apellido'),
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

const ChequePage = ({ cuentaId = null, modoDetalleCuenta = false }) => {
    const [cheques, setCheques] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroCuenta, setFiltroCuenta] = useState(
        cuentaId ? String(cuentaId) : ''
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [detalle, setDetalle] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [cuentas, setCuentas] = useState([]);
    const [bancos, setBancos] = useState([]);
    const [chequeras, setChequeras] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [estadosCheque, setEstadosCheque] = useState([]);

    useEffect(() => {
        if (cuentaId) {
            setFiltroCuenta(String(cuentaId));
        } else {
            setFiltroCuenta('');
        }
    }, [cuentaId]);

    const fetchCheques = async () => {
        try {
            setLoading(true);
            setError('');

            const data =
                modoDetalleCuenta && cuentaId
                    ? await getChequesPorCuenta(cuentaId)
                    : await getCheques();

            setCheques(data ?? []);
        } catch {
            setError('Error al cargar los cheques.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogos = async () => {
        try {
            const [cu, ba, ch, pe, ec] = await Promise.all([
                getCuentas(),
                getBancos(),
                getChequeras(),
                getPersonas(),
                api.get('/estados-cheque').then(r => r.data),
            ]);

            setCuentas(cu ?? []);
            setBancos(ba ?? []);
            setChequeras(ch ?? []);
            setPersonas(pe ?? []);
            setEstadosCheque(ec ?? []);
        } catch {
            // catálogos opcionales
        }
    };

    useEffect(() => {
        fetchCheques();
        fetchCatalogos();
    }, [cuentaId, modoDetalleCuenta]);

    const chequesConSerie = useMemo(() => {
        return cheques.map(ch => {
            const chequeraId = getChequeChequeraId(ch);

            const chequera = chequeras.find(q =>
                String(getChequeraId(q)) === String(chequeraId)
            );

            const serie = getChequeraSerie(chequera);

            return {
                ...ch,
                chQ_Serie: ch?.chQ_Serie ?? ch?.cHQ_Serie ?? ch?.CHQ_Serie ?? serie ?? '',
            };
        });
    }, [cheques, chequeras]);

    useEffect(() => {
        let result = [...chequesConSerie];

        if (!modoDetalleCuenta && filtroCuenta) {
            result = result.filter(c =>
                String(getChequeCuentaId(c)) === String(filtroCuenta)
            );
        }

        if (filtroEstado) {
            result = result.filter(c => getChEstado(c) === filtroEstado);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c =>
                String(getChNumero(c) ?? '').toLowerCase().includes(q) ||
                String(getChBenef(c) ?? '').toLowerCase().includes(q) ||
                String(c?.chQ_Serie ?? '').toLowerCase().includes(q)
            );
        }

        setFiltered(result);
    }, [chequesConSerie, search, filtroEstado, filtroCuenta, modoDetalleCuenta]);

    const cuentasFiltradasModal = useMemo(() => {
        if (!modoDetalleCuenta || !cuentaId) return cuentas;

        return cuentas.filter(c =>
            String(getCuentaId(c)) === String(cuentaId)
        );
    }, [cuentas, cuentaId, modoDetalleCuenta]);

    const chequerasFiltradasModal = useMemo(() => {
        if (!modoDetalleCuenta || !cuentaId) return chequeras;

        return chequeras.filter(q =>
            String(g(q, 'cUB_Cuenta', 'cuB_Cuenta', 'CUB_Cuenta')) === String(cuentaId)
        );
    }, [chequeras, cuentaId, modoDetalleCuenta]);

    const showOk = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3500);
    };

    const showErr = (msg) => {
        setError(msg);
        setTimeout(() => setError(''), 4000);
    };

    const handleCambiarEstado = async (chequeId, estadoId) => {
        const est = estadosCheque.find(e => {
            const eid =
                e?.eSC_Estado_Cheque ??
                e?.esC_Estado_Cheque ??
                e?.ESC_Estado_Cheque;
            return String(eid) === String(estadoId);
        });

        const desc =
            est?.eSC_Descripcion ??
            est?.esC_Descripcion ??
            est?.ESC_Descripcion ??
            'cambiar estado';

        if (!window.confirm(`¿Deseas ${String(desc).toLowerCase()} este cheque?`)) return;

        try {
            await cambiarEstadoCheque(chequeId, {
                ESC_Estado_Cheque: parseInt(estadoId, 10)
            });

            showOk(`Estado del cheque actualizado a: ${desc}`);

            if (detalle) setDetalle(null);

            await fetchCheques();
        } catch (err) {
            showErr(err?.response?.data?.mensaje ?? 'Error al cambiar el estado.');
        }
    };

    const handleSave = async (dto) => {
        setSaving(true);
        try {
            const dtoFinal =
                modoDetalleCuenta && cuentaId
                    ? { ...dto, CUB_Cuenta: parseInt(cuentaId, 10) }
                    : dto;

            await createCheque(dtoFinal);
            setModalOpen(false);
            showOk('Cheque emitido correctamente. Movimiento de egreso y saldo actualizados.');
            await fetchCheques();
        } catch (err) {
            showErr(err?.response?.data?.mensaje ?? 'Error al emitir el cheque.');
        } finally {
            setSaving(false);
        }
    };

    const baseKpis = filtered;

    const emitidos = baseKpis.filter(c => {
        const e = getChEstado(c);
        return e === 'Emitido' || e === 'Activo' || e === 'Pendiente';
    }).length;

    const cobrados = baseKpis.filter(c => {
        const e = getChEstado(c);
        return e === 'Depositado' || e === 'Cobrado';
    }).length;

    const cancelados = baseKpis.filter(c =>
        getChEstado(c) === 'Cancelado'
    ).length;

    const totalMonto = baseKpis
        .filter(c => getChEstado(c) !== 'Cancelado')
        .reduce((s, c) => s + (Number(getChMonto(c)) || 0), 0);

    const estadosUnicos = [...new Set(chequesConSerie.map(getChEstado).filter(Boolean))];

    if (detalle) {
        return (
            <div className="cheque-container">
                {success && (
                    <div className="che-success">
                        <CheckCircle size={15} />
                        {success}
                    </div>
                )}

                {error && <div className="che-error">{error}</div>}

                <ChequeDetalle
                    cheque={detalle}
                    onBack={() => setDetalle(null)}
                    onCambiarEstado={(estadoId) =>
                        handleCambiarEstado(getChId(detalle), estadoId)
                    }
                    estadosCheque={estadosCheque}
                />
            </div>
        );
    }

    return (
        <div className="cheque-container">
            <div className="che-page-header">
                <div>
                    <h1>{modoDetalleCuenta ? 'Cheques de la cuenta' : 'Cheques'}</h1>
                    <p className="che-page-subtitle">
                        {modoDetalleCuenta
                            ? 'Consulta de cheques asociados a esta cuenta bancaria'
                            : 'Consulta general de todos los cheques emitidos en el sistema'}
                    </p>
                </div>

                <button className="btn-primary" onClick={() => setModalOpen(true)}>
                    + Emitir cheque
                </button>
            </div>

            <div className="che-kpi-grid">
                {[
                    { label: 'Total', val: filtered.length, color: '#0284c7', bg: '#e0f2fe' },
                    { label: 'Emitidos', val: emitidos, color: '#1d4ed8', bg: '#dbeafe' },
                    { label: 'Cobrados', val: cobrados, color: '#15803d', bg: '#dcfce7' },
                    { label: 'Cancelados', val: cancelados, color: '#64748b', bg: '#f1f5f9' },
                    {
                        label: 'Total emitido',
                        val: `Q ${totalMonto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
                        color: '#b91c1c',
                        bg: '#fee2e2'
                    },
                ].map((s, i) => (
                    <div
                        key={i}
                        className="che-kpi-card"
                        style={{ borderLeftColor: s.color }}
                    >
                        <div>
                            <div className="che-kpi-label">{s.label}</div>
                            <div
                                className="che-kpi-value"
                                style={{
                                    color: s.color,
                                    fontSize: i === 4 ? '13px' : '20px'
                                }}
                            >
                                {s.val}
                            </div>
                        </div>

                        <div className="che-kpi-icon" style={{ background: s.bg }}>
                            <FileText size={18} color={s.color} />
                        </div>
                    </div>
                ))}
            </div>

            {success && (
                <div className="che-success">
                    <CheckCircle size={15} />
                    {success}
                </div>
            )}

            {error && <div className="che-error">{error}</div>}

            <div className="che-toolbar">
                {!modoDetalleCuenta && (
                    <select
                        className="che-filter-select che-filter-account"
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

                <div className="che-search-wrap">
                    <Search size={15} className="che-search-icon" />
                    <input
                        className="che-search-input"
                        placeholder="Buscar por número, serie o beneficiario."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="che-filter-select"
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    {estadosUnicos.map(e => (
                        <option key={e} value={e}>
                            {e}
                        </option>
                    ))}
                </select>

                <span className="che-toolbar-count">
                    {filtered.length} registros
                </span>
            </div>

            {loading ? (
                <div className="che-loading">
                    <Loader size={22} color="#0284c7" />
                    <span>Cargando cheques.</span>
                </div>
            ) : (
                <ChequeTable
                    cheques={filtered}
                    onVer={setDetalle}
                    onImprimir={setDetalle}
                    onCambiarEstado={handleCambiarEstado}
                    estadosCheque={estadosCheque}
                />
            )}

            <ChequeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                saving={saving}
                cuentas={cuentasFiltradasModal}
                chequeras={chequerasFiltradasModal}
                personas={personas}
                estadosCheque={estadosCheque}
            />
        </div>
    );
};

export default ChequePage;