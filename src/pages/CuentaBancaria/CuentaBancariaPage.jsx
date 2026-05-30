import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search, CheckCircle, CreditCard } from "lucide-react";

import {
    getCuentas,
    createCuenta,
    updateCuenta,
    deleteCuenta,
    reactivarCuenta,
} from "../../services/CuentaBancariaService";

import { getBancos } from "../../services/BancoService";
import { getTiposCuenta } from "../../services/TipoCuentaService";
import { getTiposMoneda } from "../../services/TipoMonedaService";
import { getEstadosCuenta } from "../../services/EstadoCuentaService";

import CuentaBancariaTable from "./CuentaBancariaTable";

import CuentaBancariaModal, {
    getId,
    getNumero,
    getBancoNombre,
    getNombre,
    getApellido,
    getTipoCuenta,
    getSimbolo,
    getSaldoActual,
    isActivo,
} from "./CuentaBancariaModal";

import CuentaBancariaView from "./CuentaBancariaDetalle";
import "./CuentaBancaria.css";

const getMonedaDescripcion = (cuenta) =>
    cuenta?.tmO_Descripcion ??
    cuenta?.tMO_Descripcion ??
    cuenta?.TMO_Descripcion ??
    cuenta?.moneda ??
    cuenta?.Moneda ??
    "Moneda";

const CuentaBancariaPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [cuentas, setCuentas] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cuentaEdit, setCuentaEdit] = useState(null);

    const [bancos, setBancos] = useState([]);
    const [tiposCuenta, setTiposCuenta] = useState([]);
    const [tiposMoneda, setTiposMoneda] = useState([]);
    const [estadosCuenta, setEstadosCuenta] = useState([]);

    useEffect(() => {
        fetchCuentas();
        fetchCatalogos();
    }, []);

    const fetchCuentas = async () => {
        try {
            setLoading(true);

            const data = await getCuentas();
            const lista = Array.isArray(data) ? data : [];

            setCuentas(lista);
            setFiltered(lista);
            setError(null);
        } catch {
            setError("No se pudieron cargar las cuentas bancarias.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogos = async () => {
        try {
            const [b, tc, tm, ec] = await Promise.all([
                getBancos(),
                getTiposCuenta(),
                getTiposMoneda(),
                getEstadosCuenta(),
            ]);

            setBancos(b || []);
            setTiposCuenta(tc || []);
            setTiposMoneda(tm || []);
            setEstadosCuenta(ec || []);
        } catch {}
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!search.trim()) {
                setFiltered(cuentas);
                return;
            }

            const q = search.toLowerCase();

            setFiltered(
                cuentas.filter(
                    (c) =>
                        getNumero(c).toLowerCase().includes(q) ||
                        getBancoNombre(c).toLowerCase().includes(q) ||
                        `${getNombre(c)} ${getApellido(c)}`
                            .toLowerCase()
                            .includes(q) ||
                        getTipoCuenta(c).toLowerCase().includes(q) ||
                        getMonedaDescripcion(c).toLowerCase().includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, cuentas]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(""), 3000);
    };

    const handleSave = async (formData) => {
        try {
            if (cuentaEdit) {
                await updateCuenta(getId(cuentaEdit), formData);
                showSuccess("Cuenta bancaria actualizada correctamente.");
            } else {
                await createCuenta(formData);
                showSuccess("Cuenta bancaria creada correctamente.");
            }

            setIsModalOpen(false);
            setCuentaEdit(null);

            await fetchCuentas();
        } catch {
            alert("Error al guardar.");
        }
    };

    const handleToggleStatus = async (idCuenta, nuevoActivo) => {
        if (
            !window.confirm(
                `¿Deseas ${
                    nuevoActivo ? "activar" : "desactivar"
                } esta cuenta?`
            )
        ) {
            return;
        }

        try {
            if (nuevoActivo) await reactivarCuenta(idCuenta);
            else await deleteCuenta(idCuenta);

            showSuccess(
                `Cuenta ${
                    nuevoActivo ? "activada" : "desactivada"
                } correctamente.`
            );

            await fetchCuentas();
        } catch {
            alert("Error al cambiar el estado.");
        }
    };

    const cuentaDetalle = id
        ? cuentas.find((c) => String(getId(c)) === String(id))
        : null;

    if (id) {
        return (
            <div className="cuentabancaria-container">
                {loading ? (
                    <div className="loading-state">
                        Cargando cuenta bancaria...
                    </div>
                ) : cuentaDetalle ? (
                    <CuentaBancariaView
                        cuenta={cuentaDetalle}
                        onBack={() => navigate("/cuentas-bancarias")}
                    />
                ) : (
                    <div className="empty-state">
                        No se encontró la cuenta bancaria.
                    </div>
                )}
            </div>
        );
    }

    const monedaColors = [
        { color: "#0284c7", bg: "#e0f2fe" },
        { color: "#15803d", bg: "#dcfce7" },
        { color: "#7c3aed", bg: "#ede9fe" },
        { color: "#d97706", bg: "#fef3c7" },
        { color: "#dc2626", bg: "#fee2e2" },
    ];

    const totalesPorMoneda = Object.values(
        cuentas.reduce((acc, cuenta) => {
            const simbolo = getSimbolo(cuenta) || "";
            const moneda = getMonedaDescripcion(cuenta);
            const key = `${simbolo}-${moneda}`;

            if (!acc[key]) {
                acc[key] = {
                    simbolo,
                    moneda,
                    total: 0,
                };
            }

            acc[key].total += getSaldoActual(cuenta);
            return acc;
        }, {})
    );

    const kpis = [
        ...totalesPorMoneda.map((moneda, index) => {
            const style = monedaColors[index % monedaColors.length];

            return {
                label: `Total ${moneda.moneda}`,
                val: `${moneda.simbolo} ${moneda.total.toLocaleString(
                    "es-GT",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }
                )}`,
                color: style.color,
                bg: style.bg,
                money: true,
            };
        }),
        {
            label: "Cuentas activas",
            val: cuentas.filter((c) => isActivo(c)).length,
            color: "#7c3aed",
            bg: "#ede9fe",
        },
        {
            label: "Total cuentas",
            val: cuentas.length,
            color: "#64748b",
            bg: "#f1f5f9",
        },
    ];

    return (
        <div className="cuentabancaria-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Cuentas bancarias</h1>
                    <span className="record-count">
                        {filtered.length} registros
                    </span>
                </div>

                <button
                    className="btn-primary"
                    onClick={() => {
                        setCuentaEdit(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus size={18} /> Nueva cuenta
                </button>
            </div>

            <div className="kpi-grid">
                {kpis.map((s, i) => (
                    <div
                        key={`${s.label}-${i}`}
                        className="kpi-card"
                        style={{
                            borderLeft: `4px solid ${s.color}`,
                        }}
                    >
                        <div>
                            <div className="kpi-label">{s.label}</div>

                            <div
                                className="kpi-value"
                                style={{
                                    color: s.color,
                                    fontSize: s.money ? "15px" : "22px",
                                }}
                            >
                                {s.val}
                            </div>
                        </div>

                        <div
                            className="kpi-icon"
                            style={{
                                background: s.bg,
                            }}
                        >
                            <CreditCard size={20} color={s.color} />
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
                        placeholder="Buscar por número, banco, titular, tipo o moneda..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    Cargando cuentas bancarias...
                </div>
            ) : (
                <CuentaBancariaTable
                    cuentas={filtered}
                    onView={(c) => navigate(`/cuentas-bancarias/${getId(c)}`)}
                    onEdit={(c) => {
                        setCuentaEdit(c);
                        setIsModalOpen(true);
                    }}
                    onToggleStatus={handleToggleStatus}
                />
            )}

            <CuentaBancariaModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCuentaEdit(null);
                }}
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