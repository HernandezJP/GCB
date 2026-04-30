import { useEffect, useMemo, useState } from "react";
import {
    FileSpreadsheet,
    FileText,
    BookOpen,
    CheckCircle,
    XCircle,
    ListChecks,
} from "lucide-react";

import ReporteChequeraFilter from "./ReporteChequeraFilter";
import ReporteChequeraTable from "./ReporteChequeraTable";
import { exportToExcel, exportToPDF } from "./ReporteChequeraUtils";
import { getReporteChequeras } from "../../services/ReporteChequeraService";

import "./ReporteChequera.css";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
    }
    return "";
};

const getEstado = (item) =>
    String(getValue(item, ["chQ_Estado", "CHQ_Estado", "estadoChequera", "EstadoChequera"]) || "");

const getDisponibles = (item) =>
    Number(getValue(item, ["chequesDisponibles", "ChequesDisponibles"]) || 0);

const getUsados = (item) =>
    Number(getValue(item, ["chequesUsados", "ChequesUsados"]) || 0);

export default function ReporteChequeraPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filtros, setFiltros] = useState({
        cuentaId: "",
        estado: "",
        busqueda: "",
    });

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                cuentaId: filtros.cuentaId || null,
                estado: filtros.estado || null,
            };

            const result = await getReporteChequeras(params);
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error al cargar reporte de chequeras:", error);
            setError("No se pudo cargar la información de chequeras.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const dataFiltrada = useMemo(() => {
        const texto = filtros.busqueda.trim().toLowerCase();

        return data.filter((item) => {
            if (!texto) return true;

            return [
                getValue(item, ["chQ_Chequera", "CHQ_Chequera"]),
                getValue(item, ["cuB_Cuenta", "CUB_Cuenta"]),
                getValue(item, ["chQ_Serie", "CHQ_Serie"]),
                getEstado(item),
            ]
                .filter(Boolean)
                .some((valor) => String(valor).toLowerCase().includes(texto));
        });
    }, [data, filtros.busqueda]);

    const totalActivas = dataFiltrada.filter((item) => {
        const estado = getEstado(item).toLowerCase();
        return estado.includes("activa") || estado === "a";
    }).length;

    const totalAnuladas = dataFiltrada.filter((item) => {
        const estado = getEstado(item).toLowerCase();
        return estado.includes("anulada") || estado === "i";
    }).length;

    const totalUsados = dataFiltrada.reduce((acc, item) => acc + getUsados(item), 0);
    const totalDisponibles = dataFiltrada.reduce((acc, item) => acc + getDisponibles(item), 0);

    return (
        <div className="cuentabancaria-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Reporte de Chequeras</h1>
                    <span className="record-count">
                        {dataFiltrada.length} registros
                    </span>
                </div>

                <div className="reporte-actions">
                    <button
                        className="btn-secondary"
                        disabled={!dataFiltrada.length}
                        onClick={() => exportToExcel(dataFiltrada)}
                        type="button"
                    >
                        <FileSpreadsheet size={18} />
                        Excel
                    </button>

                    <button
                        className="btn-primary"
                        disabled={!dataFiltrada.length}
                        onClick={() => exportToPDF(dataFiltrada)}
                        type="button"
                    >
                        <FileText size={18} />
                        PDF
                    </button>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <ReporteChequeraFilter
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={cargarDatos}
            />

            <div className="kpi-grid">
                <div className="kpi-card kpi-blue">
                    <div>
                        <div className="kpi-label">Total Chequeras</div>
                        <div className="kpi-value">{dataFiltrada.length}</div>
                    </div>
                    <div className="kpi-icon icon-blue">
                        <BookOpen size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-green">
                    <div>
                        <div className="kpi-label">Activas</div>
                        <div className="kpi-value">{totalActivas}</div>
                    </div>
                    <div className="kpi-icon icon-green">
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-red">
                    <div>
                        <div className="kpi-label">Anuladas/Inactivas</div>
                        <div className="kpi-value">{totalAnuladas}</div>
                    </div>
                    <div className="kpi-icon icon-red">
                        <XCircle size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-amber">
                    <div>
                        <div className="kpi-label">Usados / Disponibles</div>
                        <div className="kpi-value">
                            {totalUsados} / {totalDisponibles}
                        </div>
                    </div>
                    <div className="kpi-icon icon-amber">
                        <ListChecks size={24} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando reporte...</div>
            ) : (
                <ReporteChequeraTable data={dataFiltrada} />
            )}
        </div>
    );
}