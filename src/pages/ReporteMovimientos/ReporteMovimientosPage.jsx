import { useEffect, useMemo, useState } from "react";
import {
    FileSpreadsheet,
    FileText,
    Search,
    ArrowLeftRight,
    TrendingUp,
    TrendingDown,
    Receipt,
} from "lucide-react";

import ReporteMovimientosFilter from "./ReporteMovimientosFilter";
import ReporteMovimientosTable from "./ReporteMovimientosTable";
import { exportToExcel, exportToPDF } from "./ReporteMovimientosUtils";
import { getReporteMovimientos } from "../../services/ReporteMovimientoService";
import { getTiposMovimiento } from "../../services/TipoMovimientoService";
import { getMediosMovimiento } from "../../services/MedioMovimientoService";
import { getEstadosMovimiento } from "../../services/EstadoMovimientoService";
import { getCuentas } from "../../services/CuentaBancariaService";

import "./ReporteMovimientos.css";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
    }
    return "";
};

const getFechaLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getPeriodoActual = () => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
};

const getRangoMes = (periodo) => {
    if (!periodo) return { fechaInicio: "", fechaFin: "" };

    const [year, month] = periodo.split("-").map(Number);
    const inicio = new Date(year, month - 1, 1);
    const fin = new Date(year, month, 0);

    return {
        fechaInicio: getFechaLocal(inicio),
        fechaFin: getFechaLocal(fin),
    };
};

const getCuentaId = (c) =>
    getValue(c, ["cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta", "cub_cuenta"]);

const getMonedaTexto = (obj) =>
    String(
        getValue(obj, [
            "tmO_Descripcion",
            "tMO_Descripcion",
            "TMO_Descripcion",
            "tmo_descripcion",
            "tipoMoneda",
            "TipoMoneda",
            "moneda",
            "Moneda",
        ])
    ).toLowerCase();

const getSimboloDesdeTexto = (texto = "") => {
    const moneda = String(texto).toLowerCase();

    if (
        moneda.includes("dólar") ||
        moneda.includes("dolar") ||
        moneda.includes("usd")
    ) {
        return "$";
    }

    return "Q";
};

const getSimboloCuenta = (cuentas, cuentaId) => {
    const cuenta = cuentas.find(
        (c) => String(getCuentaId(c)) === String(cuentaId)
    );

    return getSimboloDesdeTexto(getMonedaTexto(cuenta));
};

const formatMoney = (value, simbolo = "Q") =>
    `${simbolo} ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function ReporteMovimientosPage() {
    const [data, setData] = useState([]);

    const [resumen, setResumen] = useState({
        saldoInicial: 0,
        totalCreditos: 0,
        totalDebitos: 0,
        totalRecargos: 0,
        saldoFinal: 0,
        totalMovimientos: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [cuentas, setCuentas] = useState([]);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [mediosMovimiento, setMediosMovimiento] = useState([]);
    const [estadosMovimiento, setEstadosMovimiento] = useState([]);

    const [filtros, setFiltros] = useState({
        cuentaId: "",
        tipoMovimientoId: "",
        medioMovimientoId: "",
        estadoMovimientoId: "",
        personaId: "",
        modoFecha: "mes",
        periodo: getPeriodoActual(),
        fechaInicio: "",
        fechaFin: "",
        busqueda: "",
    });

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (filtros.cuentaId) params.cuentaId = filtros.cuentaId;
            if (filtros.tipoMovimientoId) params.tipoMovimientoId = filtros.tipoMovimientoId;
            if (filtros.medioMovimientoId) params.medioMovimientoId = filtros.medioMovimientoId;
            if (filtros.estadoMovimientoId) params.estadoMovimientoId = filtros.estadoMovimientoId;
            if (filtros.personaId) params.personaId = filtros.personaId;

            if (filtros.modoFecha === "mes") {
                const rango = getRangoMes(filtros.periodo);
                params.fechaInicio = rango.fechaInicio;
                params.fechaFin = rango.fechaFin;
            } else {
                if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
                if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
            }

            const [reporte, cuentasData, tiposData, mediosData, estadosData] =
                await Promise.all([
                    getReporteMovimientos(params),
                    getCuentas(),
                    getTiposMovimiento(),
                    getMediosMovimiento(),
                    getEstadosMovimiento(),
                ]);

            const movimientos = getValue(reporte, ["movimientos", "Movimientos"]);

            setData(Array.isArray(movimientos) ? movimientos : []);

            setResumen({
                saldoInicial: Number(getValue(reporte, ["saldoInicial", "SaldoInicial"]) || 0),
                totalCreditos: Number(getValue(reporte, ["totalCreditos", "TotalCreditos"]) || 0),
                totalDebitos: Number(getValue(reporte, ["totalDebitos", "TotalDebitos"]) || 0),
                totalRecargos: Number(getValue(reporte, ["totalRecargos", "TotalRecargos"]) || 0),
                saldoFinal: Number(getValue(reporte, ["saldoFinal", "SaldoFinal"]) || 0),
                totalMovimientos: Number(getValue(reporte, ["totalMovimientos", "TotalMovimientos"]) || 0),
            });

            setCuentas(cuentasData || []);
            setTiposMovimiento(tiposData || []);
            setMediosMovimiento(mediosData || []);
            setEstadosMovimiento(estadosData || []);
        } catch (error) {
            console.error("Error al cargar reporte de movimientos:", error);
            console.error("RESPUESTA BACKEND =>", error?.response?.data);

            setError(
                error?.response?.data?.mensaje ||
                "No se pudo cargar la información de movimientos."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const dataFiltrada = useMemo(() => {
        const texto = filtros.busqueda.trim().toLowerCase();

        if (!texto) return data;

        return data.filter((item) =>
            [
                getValue(item, ["cuB_Numero_Cuenta", "cUB_Numero_Cuenta"]),
                getValue(item, ["persona", "Persona"]),
                getValue(item, ["tipoMovimiento", "TipoMovimiento"]),
                getValue(item, ["medioMovimiento", "MedioMovimiento"]),
                getValue(item, ["estadoMovimiento", "EstadoMovimiento"]),
                getValue(item, ["moV_Descripcion", "mOV_Descripcion"]),
                getValue(item, ["moV_Numero_Referencia", "mOV_Numero_Referencia"]),
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(texto)
                )
        );
    }, [data, filtros.busqueda]);

    

    const simboloMoneda = filtros.cuentaId
        ? getSimboloCuenta(cuentas, filtros.cuentaId)
        : "";

    const resumenPorMoneda = useMemo(() => {
        const resumenMonedas = {
            quetzales: {
                simbolo: "Q",
                saldoFinal: 0,
            },
            dolares: {
                simbolo: "$",
                saldoFinal: 0,
            },
        };

        data.forEach((item) => {
            const simbolo = getSimboloDesdeTexto(getMonedaTexto(item));
            const key = simbolo === "$" ? "dolares" : "quetzales";

            const saldo = Number(
                getValue(item, ["moV_Saldo", "mOV_Saldo", "mov_saldo"]) || 0
            );

            resumenMonedas[key].saldoFinal = saldo;
        });

        return resumenMonedas;
    }, [data]);

    const dataOrdenada = useMemo(() => {
    return [...dataFiltrada].sort((a, b) => {
        const fechaA = new Date(
            getValue(a, ["moV_Fecha", "mOV_Fecha", "mov_fecha"])
        );

        const fechaB = new Date(
            getValue(b, ["moV_Fecha", "mOV_Fecha", "mov_fecha"])
        );

        return fechaB - fechaA;
    });
}, [dataFiltrada]);

    return (
        <div className="cuentabancaria-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Reporte de Movimientos</h1>

                    <span className="record-count">
                        {dataFiltrada.length} registros
                    </span>
                </div>

                <div className="reporte-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => exportToExcel(dataOrdenada, resumen)}
                        disabled={!dataFiltrada.length}
                    >
                        <FileSpreadsheet size={18} />
                        Excel
                    </button>

                    <button
                        className="btn-primary"
                        onClick={() => exportToPDF(dataOrdenada, resumen)}
                        disabled={!dataFiltrada.length}
                    >
                        <FileText size={18} />
                        PDF
                    </button>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <ReporteMovimientosFilter
                filtros={filtros}
                setFiltros={setFiltros}
                cuentas={cuentas}
                tiposMovimiento={tiposMovimiento}
                mediosMovimiento={mediosMovimiento}
                estadosMovimiento={estadosMovimiento}
                onBuscar={cargarDatos}
            />

            <div className="kpi-grid">
                {filtros.cuentaId ? (
                    [
                        {
                            label: "Saldo inicial",
                            val: formatMoney(resumen.saldoInicial, simboloMoneda),
                            color: "#0284c7",
                            bg: "#e6f1fb",
                            icon: <ArrowLeftRight size={20} color="#0284c7" />,
                        },
                        {
                            label: "Total créditos",
                            val: formatMoney(resumen.totalCreditos, simboloMoneda),
                            color: "#15803d",
                            bg: "#dcfce7",
                            icon: <TrendingUp size={20} color="#15803d" />,
                        },
                        {
                            label: "Total débitos",
                            val: formatMoney(resumen.totalDebitos, simboloMoneda),
                            color: "#dc2626",
                            bg: "#fee2e2",
                            icon: <TrendingDown size={20} color="#dc2626" />,
                        },
                        {
                            label: "Saldo actual",
                            val: formatMoney(resumen.saldoFinal, simboloMoneda),
                            color: "#7c3aed",
                            bg: "#ede9fe",
                            icon: <Receipt size={20} color="#7c3aed" />,
                        },
                    ].map((s, i) => (
                        <div
                            key={i}
                            className="kpi-card"
                            style={{ borderLeft: `4px solid ${s.color}` }}
                        >
                            <div>
                                <div className="kpi-label">{s.label}</div>
                                <div
                                    className="kpi-value"
                                    style={{ color: s.color, fontSize: "15px" }}
                                >
                                    {s.val}
                                </div>
                            </div>

                            <div className="kpi-icon" style={{ background: s.bg }}>
                                {s.icon}
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        <div
                            className="kpi-card"
                            style={{ borderLeft: "4px solid #15803d" }}
                        >
                            <div>
                                <div className="kpi-label">Total Quetzales</div>
                                <div
                                    className="kpi-value"
                                    style={{ color: "#15803d", fontSize: "15px" }}
                                >
                                    {formatMoney(
                                        resumenPorMoneda.quetzales.saldoFinal,
                                        "Q"
                                    )}
                                </div>
                            </div>

                            <div className="kpi-icon" style={{ background: "#dcfce7" }}>
                                <Receipt size={20} color="#15803d" />
                            </div>
                        </div>

                        <div
                            className="kpi-card"
                            style={{ borderLeft: "4px solid #0284c7" }}
                        >
                            <div>
                                <div className="kpi-label">Total Dólares</div>
                                <div
                                    className="kpi-value"
                                    style={{ color: "#0284c7", fontSize: "15px" }}
                                >
                                    {formatMoney(
                                        resumenPorMoneda.dolares.saldoFinal,
                                        "$"
                                    )}
                                </div>
                            </div>

                            <div className="kpi-icon" style={{ background: "#e0f2fe" }}>
                                <Receipt size={20} color="#0284c7" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="toolbar reporte-toolbar">
                <div className="search-bar reporte-search">
                    <Search size={15} className="search-icon" />

                    <input
                        type="text"
                        placeholder="Buscar movimientos..."
                        value={filtros.busqueda}
                        onChange={(e) =>
                            setFiltros({
                                ...filtros,
                                busqueda: e.target.value,
                            })
                        }
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando reporte...</div>
            ) : (
                <ReporteMovimientosTable data={dataOrdenada} />
            )}
        </div>
    );
}