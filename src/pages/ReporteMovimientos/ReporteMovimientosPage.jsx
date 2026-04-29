import { useEffect, useMemo, useState } from "react";
import {
    FileSpreadsheet,
    FileText,
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

import "./ReporteMovimientos.css";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
    }
    return "";
};

const getTipoDescripcion = (item) =>
    getValue(item, ["tipoMovimiento", "TipoMovimiento", "tiM_Descripcion", "tIM_Descripcion", "tim_descripcion"]);

const getMedioDescripcion = (item) =>
    getValue(item, ["medioMovimiento", "MedioMovimiento", "meM_Descripcion", "mEM_Descripcion", "mem_descripcion"]);

const getEstadoDescripcion = (item) =>
    getValue(item, ["estadoMovimiento", "EstadoMovimiento", "esM_Descripcion", "eSM_Descripcion", "esm_descripcion"]);

const getMonto = (item) =>
    Number(getValue(item, ["moV_Monto", "mOV_Monto", "mov_monto"]) || 0);

const getRecargo = (item) =>
    Number(getValue(item, ["moV_Recargo", "mOV_Recargo", "mov_recargo"]) || 0);

const esIngreso = (item) =>
    getTipoDescripcion(item).trim().toLowerCase() === "ingreso";

export default function ReporteMovimientosPage() {
    const [data, setData] = useState([]);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [mediosMovimiento, setMediosMovimiento] = useState([]);
    const [estadosMovimiento, setEstadosMovimiento] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filtros, setFiltros] = useState({
        tipoMovimientoId: "",
        medioMovimientoId: "",
        estadoMovimientoId: "",
        busqueda: "",
    });

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                tipoMovimientoId: filtros.tipoMovimientoId || null,
                medioMovimientoId: filtros.medioMovimientoId || null,
                estadoMovimientoId: filtros.estadoMovimientoId || null,
            };

            const [movimientosResult, tiposResult, mediosResult, estadosResult] =
                await Promise.all([
                    getReporteMovimientos(params),
                    getTiposMovimiento(),
                    getMediosMovimiento(),
                    getEstadosMovimiento(),
                ]);

            setData(Array.isArray(movimientosResult) ? movimientosResult : []);
            setTiposMovimiento(Array.isArray(tiposResult) ? tiposResult : []);
            setMediosMovimiento(Array.isArray(mediosResult) ? mediosResult : []);
            setEstadosMovimiento(Array.isArray(estadosResult) ? estadosResult : []);
        } catch (error) {
            console.error("Error al cargar reporte de movimientos:", error);
            setError("No se pudo cargar la información de movimientos.");
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
                getValue(item, ["cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "cub_numero_cuenta"]),
                getValue(item, ["persona", "Persona", "peR_Nombre_Completo", "pER_Nombre_Completo", "per_nombre_completo"]),
                getTipoDescripcion(item),
                getMedioDescripcion(item),
                getEstadoDescripcion(item),
                getValue(item, ["moV_Descripcion", "mOV_Descripcion", "mov_descripcion"]),
                getValue(item, ["moV_Numero_Referencia", "mOV_Numero_Referencia", "mov_numero_referencia"]),
            ]
                .filter(Boolean)
                .some((valor) => String(valor).toLowerCase().includes(texto));
        });
    }, [data, filtros.busqueda]);

    const totalIngresos = dataFiltrada
        .filter((item) => esIngreso(item))
        .reduce((acc, item) => acc + getMonto(item), 0);

    const totalEgresos = dataFiltrada
        .filter((item) => !esIngreso(item))
        .reduce((acc, item) => acc + getMonto(item), 0);

    const totalRecargos = dataFiltrada.reduce(
        (acc, item) => acc + getRecargo(item),
        0
    );

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

            <ReporteMovimientosFilter
                filtros={filtros}
                setFiltros={setFiltros}
                tiposMovimiento={tiposMovimiento}
                mediosMovimiento={mediosMovimiento}
                estadosMovimiento={estadosMovimiento}
                onBuscar={cargarDatos}
            />

            <div className="kpi-grid">
                <div className="kpi-card kpi-blue">
                    <div>
                        <div className="kpi-label">Total Movimientos</div>
                        <div className="kpi-value">{dataFiltrada.length}</div>
                    </div>
                    <div className="kpi-icon icon-blue">
                        <ArrowLeftRight size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-green">
                    <div>
                        <div className="kpi-label">Ingresos</div>
                        <div className="kpi-value">
                            Q {totalIngresos.toFixed(2)}
                        </div>
                    </div>
                    <div className="kpi-icon icon-green">
                        <TrendingUp size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-red">
                    <div>
                        <div className="kpi-label">Egresos</div>
                        <div className="kpi-value">
                            Q {totalEgresos.toFixed(2)}
                        </div>
                    </div>
                    <div className="kpi-icon icon-red">
                        <TrendingDown size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-amber">
                    <div>
                        <div className="kpi-label">Recargos</div>
                        <div className="kpi-value">
                            Q {totalRecargos.toFixed(2)}
                        </div>
                    </div>
                    <div className="kpi-icon icon-amber">
                        <Receipt size={24} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando reporte...</div>
            ) : (
                <ReporteMovimientosTable data={dataFiltrada} />
            )}
        </div>
    );
}