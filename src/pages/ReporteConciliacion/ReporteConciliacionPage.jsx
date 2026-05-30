import { useEffect, useMemo, useState } from "react";
import {
    FileSpreadsheet,
    FileText,
    Wallet,
    CheckCircle,
    AlertTriangle,
    Clock,
} from "lucide-react";

import ReporteConciliacionFilter from "./ReporteConciliacionFilter";
import ReporteConciliacionTable from "./ReporteConciliacionTable";
import { exportToExcel, exportToPDF } from "./ReporteConciliacionUtils";

import { getReporteConciliaciones } from "../../services/ReporteConciliacionService";
import { getCuentas } from "../../services/CuentaBancariaService";
import { getEstadosConciliacion } from "../../services/EstadoConciliacionService";

import "./ReporteConciliacion.css";

const getPeriodoActual = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
};

const normalizarPeriodo = (periodo) => {
    if (!periodo) return "";

    return String(periodo).slice(0, 7);
};

const getFechaConciliacion = (item) => {
    return (
        item.coN_Fecha_Creacion ||
        item.coN_Fecha ||
        item.con_Fecha_Creacion ||
        item.fechaCreacion ||
        item.fecha ||
        ""
    );
};

export default function ReporteConciliacionPage() {
    const [data, setData] = useState([]);
    const [cuentas, setCuentas] = useState([]);
    const [estados, setEstados] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filtros, setFiltros] = useState({
        cuentaId: "",
        estadoConciliacion: "",
        modoFecha: "mes",
        periodo: getPeriodoActual(),
        fechaInicio: "",
        fechaFin: "",
        busqueda: "",
    });

    const cargarCatalogos = async () => {
        try {
            const [cuentasResult, estadosResult] = await Promise.all([
                getCuentas(),
                getEstadosConciliacion(),
            ]);

            setCuentas(cuentasResult ?? []);
            setEstados(estadosResult ?? []);
        } catch (error) {
            console.error("Error al cargar catálogos:", error);
            setError("No se pudieron cargar los catálogos del reporte.");
        }
    };

    const obtenerReporte = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getReporteConciliaciones(filtros);
            setData(result ?? []);
        } catch (error) {
            console.error("Error al obtener reporte:", error);
            setError("No se pudo cargar el reporte de conciliaciones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCatalogos();
        obtenerReporte();
    }, []);

    const dataFiltrada = useMemo(() => {
        let result = [...data];

        if (filtros.estadoConciliacion) {
            result = result.filter(
                (x) =>
                    String(x.estadoConciliacion ?? "").toLowerCase() ===
                    String(filtros.estadoConciliacion).toLowerCase()
            );
        }

        if (filtros.modoFecha === "mes" && filtros.periodo) {
            result = result.filter((x) => {
                const periodoItem = normalizarPeriodo(x.coN_Periodo);

                return periodoItem === filtros.periodo;
            });
        }

        if (filtros.modoFecha === "rango") {
            result = result.filter((x) => {
                const fechaValor = getFechaConciliacion(x);

                if (!fechaValor) return true;

                const fecha = new Date(fechaValor);

                if (Number.isNaN(fecha.getTime())) return true;

                const fechaSolo = new Date(
                    fecha.getFullYear(),
                    fecha.getMonth(),
                    fecha.getDate()
                );

                if (filtros.fechaInicio) {
                    const inicio = new Date(filtros.fechaInicio);

                    if (fechaSolo < inicio) return false;
                }

                if (filtros.fechaFin) {
                    const fin = new Date(filtros.fechaFin);

                    if (fechaSolo > fin) return false;
                }

                return true;
            });
        }

        const texto = filtros.busqueda.trim().toLowerCase();

        if (texto) {
            result = result.filter((item) =>
                [
                    item.cuB_Numero_Cuenta,
                    item.banco,
                    item.coN_Periodo,
                    item.estadoConciliacion,
                ]
                    .filter(Boolean)
                    .some((valor) =>
                        String(valor).toLowerCase().includes(texto)
                    )
            );
        }

        return result;
    }, [data, filtros]);

    const totalSaldoBanco = dataFiltrada.reduce(
        (acc, item) => acc + Number(item.coN_Saldo_Banco ?? 0),
        0
    );

    const totalSaldoLibros = dataFiltrada.reduce(
        (acc, item) => acc + Number(item.coN_Saldo_Libros ?? 0),
        0
    );

    const totalDiferencia = dataFiltrada.reduce(
        (acc, item) => acc + Number(item.coN_Diferencia ?? 0),
        0
    );

    const totalConciliados = dataFiltrada.reduce(
        (acc, item) => acc + Number(item.totalConciliados ?? 0),
        0
    );

    const totalPendientes = dataFiltrada.reduce(
        (acc, item) =>
            acc +
            Number(item.totalPendientesBanco ?? 0) +
            Number(item.totalPendientesLibros ?? 0),
        0
    );

    return (
        <div className="cuentabancaria-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Reporte de Conciliaciones</h1>
                    <span className="record-count">
                        {dataFiltrada.length} registros
                    </span>
                </div>

                <div className="reporte-actions">
                    <button
                        className="btn-secondary"
                        disabled={!dataFiltrada.length}
                        onClick={() => exportToExcel(dataFiltrada)}
                    >
                        <FileSpreadsheet size={18} />
                        Excel
                    </button>

                    <button
                        className="btn-primary"
                        disabled={!dataFiltrada.length}
                        onClick={() => exportToPDF(dataFiltrada)}
                    >
                        <FileText size={18} />
                        PDF
                    </button>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <ReporteConciliacionFilter
                filtros={filtros}
                setFiltros={setFiltros}
                cuentas={cuentas}
                estados={estados}
                onBuscar={obtenerReporte}
            />

            <div className="kpi-grid">
                {[
                    {
                        label: "Conciliaciones",
                        val: dataFiltrada.length,
                        color: "#0284c7",
                        bg: "#e6f1fb",
                        icon: <Wallet size={20} color="#0284c7" />,
                    },
                    {
                        label: "Saldo Banco",
                        val: `Q ${totalSaldoBanco.toLocaleString("es-GT", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        color: "#15803d",
                        bg: "#dcfce7",
                        icon: <Wallet size={20} color="#15803d" />,
                    },
                    {
                        label: "Saldo Libros",
                        val: `Q ${totalSaldoLibros.toLocaleString("es-GT", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        color: "#d97706",
                        bg: "#fef3c7",
                        icon: <FileText size={20} color="#d97706" />,
                    },
                    {
                        label: "Diferencia",
                        val: `Q ${totalDiferencia.toLocaleString("es-GT", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        color: "#dc2626",
                        bg: "#fee2e2",
                        icon: <AlertTriangle size={20} color="#dc2626" />,
                    },
                    {
                        label: "Conciliados",
                        val: totalConciliados,
                        color: "#7c3aed",
                        bg: "#ede9fe",
                        icon: <CheckCircle size={20} color="#7c3aed" />,
                    },
                    {
                        label: "Pendientes",
                        val: totalPendientes,
                        color: "#64748b",
                        bg: "#f1f5f9",
                        icon: <Clock size={20} color="#64748b" />,
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
                                style={{
                                    color: s.color,
                                    fontSize:
                                        typeof s.val === "number"
                                            ? "22px"
                                            : "15px",
                                }}
                            >
                                {s.val}
                            </div>
                        </div>

                        <div className="kpi-icon" style={{ background: s.bg }}>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="loading-state">Cargando reporte...</div>
            ) : (
                <ReporteConciliacionTable data={dataFiltrada} />
            )}
        </div>
    );
}