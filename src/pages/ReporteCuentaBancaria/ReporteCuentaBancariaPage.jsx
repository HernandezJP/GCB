import { useEffect, useMemo, useState } from "react";
import {
    FileSpreadsheet,
    FileText,
    CreditCard,
    Wallet,
    Building2,
} from "lucide-react";

import ReporteCuentaBancariaFilter from "./ReporteCuentaBancariaFilter";
import ReporteCuentaBancariaTable from "./ReporteCuentaBancariaTable";
import { exportToExcel, exportToPDF } from "./ReporteCuentaBancariaUtils";

import { getReporteCuentasBancarias } from "../../services/reporteCuentaBancariaService";
import { getBancos } from "../../services/bancoService";
import { getTiposCuenta } from "../../services/tipoCuentaService";
import { getTiposMoneda } from "../../services/tipoMonedaService";
import { getEstadosCuenta } from "../../services/estadoCuentaService";

import "./ReporteCuentaBancaria.css";

export default function ReporteCuentaBancariaPage() {
    const [data, setData] = useState([]);
    const [bancos, setBancos] = useState([]);
    const [tiposCuenta, setTiposCuenta] = useState([]);
    const [tiposMoneda, setTiposMoneda] = useState([]);
    const [estadosCuenta, setEstadosCuenta] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filtros, setFiltros] = useState({
        bancoId: "",
        tipoCuentaId: "",
        tipoMonedaId: "",
        estadoCuentaId: "",
        estadoRegistro: "",
        busqueda: "",
    });

    const cargarCatalogos = async () => {
        try {
            const [
                bancosResult,
                tiposCuentaResult,
                tiposMonedaResult,
                estadosCuentaResult,
            ] = await Promise.all([
                getBancos(),
                getTiposCuenta(),
                getTiposMoneda(),
                getEstadosCuenta(),
            ]);

            setBancos(bancosResult);
            setTiposCuenta(tiposCuentaResult);
            setTiposMoneda(tiposMonedaResult);
            setEstadosCuenta(estadosCuentaResult);
        } catch (error) {
            console.error("Error al cargar catálogos:", error);
            setError("No se pudieron cargar los catálogos del reporte.");
        }
    };

    const obtenerReporte = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getReporteCuentasBancarias(filtros);
            setData(result);
        } catch (error) {
            console.error("Error al obtener reporte:", error);
            setError("No se pudo cargar el reporte de cuentas bancarias.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCatalogos();
        obtenerReporte();
    }, []);

    const dataFiltrada = useMemo(() => {
        const texto = filtros.busqueda.trim().toLowerCase();

        if (!texto) return data;

        return data.filter((item) =>
            [
                item.cuB_Numero_Cuenta,
                item.banco,
                item.titular,
                item.tipoCuenta,
                item.tipoMoneda,
                item.estadoCuenta,
            ]
                .filter(Boolean)
                .some((valor) =>
                    String(valor).toLowerCase().includes(texto)
                )
        );
    }, [data, filtros.busqueda]);

    const totalSaldoInicial = dataFiltrada.reduce(
        (acc, item) => acc + Number(item.cuB_Saldo_Inicial ?? 0),
        0
    );

    const totalSaldoActual = dataFiltrada.reduce(
        (acc, item) => acc + Number(item.cuB_Saldo_Actual ?? 0),
        0
    );

    return (
        <div className="cuentabancaria-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Reporte de Cuentas Bancarias</h1>
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

            <ReporteCuentaBancariaFilter
                filtros={filtros}
                setFiltros={setFiltros}
                bancos={bancos}
                tiposCuenta={tiposCuenta}
                tiposMoneda={tiposMoneda}
                estadosCuenta={estadosCuenta}
                onBuscar={obtenerReporte}
            />

            <div className="kpi-grid">
                <div className="kpi-card kpi-blue">
                    <div>
                        <div className="kpi-label">Total Cuentas</div>
                        <div className="kpi-value">{dataFiltrada.length}</div>
                    </div>
                    <div className="kpi-icon icon-blue">
                        <CreditCard size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-green">
                    <div>
                        <div className="kpi-label">Saldo Inicial</div>
                        <div className="kpi-value">
                            Q {totalSaldoInicial.toFixed(2)}
                        </div>
                    </div>
                    <div className="kpi-icon icon-green">
                        <Wallet size={24} />
                    </div>
                </div>

                <div className="kpi-card kpi-amber">
                    <div>
                        <div className="kpi-label">Saldo Actual</div>
                        <div className="kpi-value">
                            Q {totalSaldoActual.toFixed(2)}
                        </div>
                    </div>
                    <div className="kpi-icon icon-amber">
                        <Building2 size={24} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando reporte...</div>
            ) : (
                <ReporteCuentaBancariaTable data={dataFiltrada} />
            )}
        </div>
    );
}