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

import "./ReporteConciliacion.css";

export default function ReporteConciliacionPage() {
    const [data, setData] = useState([]);
    const [cuentas, setCuentas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filtros, setFiltros] = useState({
        cuentaId: "",
        estadoConciliacion: "",
        periodo: "",
        busqueda: "",
    });

    const cargarCatalogos = async () => {
        try {
            const cuentasResult = await getCuentas();
            setCuentas(cuentasResult);
        } catch (error) {
            console.error("Error al cargar cuentas:", error);
            setError("No se pudieron cargar las cuentas bancarias.");
        }
    };

    const obtenerReporte = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getReporteConciliaciones(filtros);
            setData(result);
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
                x => x.estadoConciliacion === filtros.estadoConciliacion
            );
        }

        if (filtros.periodo) {
            result = result.filter(
                x => x.coN_Periodo?.includes(filtros.periodo)
            );
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
                    .some(valor =>
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

    const estados = [
        ...new Set(data.map(x => x.estadoConciliacion).filter(Boolean)),
    ];

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
                <div className="kpi-card kpi-blue">
                    <div>
                        <div className="kpi-label">Conciliaciones</div>
                        <div className="kpi-value">{dataFiltrada.length}</div>
                    </div>
                    <div className="kpi-icon icon-blue">
                        <Wallet size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-green">
                    <div>
                        <div className="kpi-label">Saldo Banco</div>
                        <div className="kpi-value">
                            Q {totalSaldoBanco.toFixed(2)}
                        </div>
                    </div>
                    <div className="kpi-icon icon-green">
                        <Wallet size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-amber">
                    <div>
                        <div className="kpi-label">Saldo Libros</div>
                        <div className="kpi-value">
                            Q {totalSaldoLibros.toFixed(2)}
                        </div>
                    </div>
                    <div className="kpi-icon icon-amber">
                        <FileText size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-red">
                    <div>
                        <div className="kpi-label">Diferencia</div>
                        <div className="kpi-value">
                            Q {totalDiferencia.toFixed(2)}
                        </div>
                    </div>
                    <div className="kpi-icon icon-red">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-green">
                    <div>
                        <div className="kpi-label">Conciliados</div>
                        <div className="kpi-value">{totalConciliados}</div>
                    </div>
                    <div className="kpi-icon icon-green">
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-amber">
                    <div>
                        <div className="kpi-label">Pendientes</div>
                        <div className="kpi-value">{totalPendientes}</div>
                    </div>
                    <div className="kpi-icon icon-amber">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando reporte...</div>
            ) : (
                <ReporteConciliacionTable data={dataFiltrada} />
            )}
        </div>
    );
}