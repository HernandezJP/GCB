import { useEffect, useMemo, useState } from "react";
import {
    FileSpreadsheet,
    FileText,
    Landmark,
    CheckCircle,
    XCircle,
    Wallet,
} from "lucide-react";

import ReporteChequesFilter from "./ReporteChequesFilter";
import ReporteChequesTable from "./ReporteChequesTable";
import { exportToExcel, exportToPDF } from "./ReporteChequesUtils";
import { getReporteCheques } from "../../services/ReporteChequeService";

import "./ReporteCheques.css";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
    }
    return "";
};

const getEstado = (item) =>
    String(getValue(item, ["estadoCheque", "EstadoCheque"]) || "");

const getMonto = (item) =>
    Number(getValue(item, ["moV_Monto", "MOV_Monto", "mov_monto"]) || 0);

export default function ReporteChequesPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filtros, setFiltros] = useState({
        cuentaId: "",
        estadoChequeId: "",
        chequeraId: "",
        personaId: "",
        busqueda: "",
    });

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                cuentaId: filtros.cuentaId || null,
                estadoChequeId: filtros.estadoChequeId || null,
                chequeraId: filtros.chequeraId || null,
                personaId: filtros.personaId || null,
            };

            const result = await getReporteCheques(params);
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error al cargar reporte de cheques:", error);
            setError("No se pudo cargar la información de cheques.");
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
                getValue(item, ["chE_Cheque", "CHE_Cheque"]),
                getValue(item, ["cuB_Cuenta", "CUB_Cuenta"]),
                getValue(item, ["chQ_Chequera", "CHQ_Chequera"]),
                getValue(item, ["beneficiario", "Beneficiario"]),
                getValue(item, ["chE_Numero_Cheque", "CHE_Numero_Cheque"]),
                getValue(item, ["chE_Concepto", "CHE_Concepto"]),
                getEstado(item),
            ]
                .filter(Boolean)
                .some((valor) => String(valor).toLowerCase().includes(texto));
        });
    }, [data, filtros.busqueda]);

    const totalCobrado = dataFiltrada.filter((item) =>
        getEstado(item).toLowerCase().includes("cobrado")
    ).length;

    const totalCancelado = dataFiltrada.filter((item) =>
        getEstado(item).toLowerCase().includes("cancelado")
    ).length;

    const montoTotal = dataFiltrada.reduce((acc, item) => acc + getMonto(item), 0);

    return (
        <div className="cuentabancaria-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Reporte de Cheques</h1>
                    <span className="record-count">{dataFiltrada.length} registros</span>
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

            <ReporteChequesFilter
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={cargarDatos}
            />

            <div className="kpi-grid">
                <div className="kpi-card kpi-blue">
                    <div>
                        <div className="kpi-label">Total Cheques</div>
                        <div className="kpi-value">{dataFiltrada.length}</div>
                    </div>
                    <div className="kpi-icon icon-blue">
                        <Landmark size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-green">
                    <div>
                        <div className="kpi-label">Cobrados</div>
                        <div className="kpi-value">{totalCobrado}</div>
                    </div>
                    <div className="kpi-icon icon-green">
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-red">
                    <div>
                        <div className="kpi-label">Cancelados</div>
                        <div className="kpi-value">{totalCancelado}</div>
                    </div>
                    <div className="kpi-icon icon-red">
                        <XCircle size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-amber">
                    <div>
                        <div className="kpi-label">Monto Total</div>
                        <div className="kpi-value">Q {montoTotal.toFixed(2)}</div>
                    </div>
                    <div className="kpi-icon icon-amber">
                        <Wallet size={24} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando reporte...</div>
            ) : (
                <ReporteChequesTable data={dataFiltrada} />
            )}
        </div>
    );
}