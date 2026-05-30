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

import {
    exportToExcel,
    exportToPDF,
} from "./ReporteCuentaBancariaUtils";

import {
    getReporteCuentasBancarias,
} from "../../services/reporteCuentaBancariaService";

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

            setBancos(bancosResult || []);
            setTiposCuenta(tiposCuentaResult || []);
            setTiposMoneda(tiposMonedaResult || []);
            setEstadosCuenta(estadosCuentaResult || []);
        } catch (error) {
            console.error("Error al cargar catálogos:", error);

            setError(
                "No se pudieron cargar los catálogos del reporte."
            );
        }
    };

    const obtenerReporte = async () => {
        try {
            setLoading(true);
            setError("");

            const result =
                await getReporteCuentasBancarias(filtros);

            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error al obtener reporte:", error);

            setError(
                "No se pudo cargar el reporte de cuentas bancarias."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCatalogos();
        obtenerReporte();
    }, []);

    const dataFiltrada = useMemo(() => {
        let resultado = [...data];

        // FILTRO MONEDA EN TIEMPO REAL
        if (filtros.tipoMonedaId) {
            resultado = resultado.filter((item) => {
                const monedaId =
                    item.tmO_Tipo_Moneda ??
                    item.TMO_Tipo_Moneda ??
                    item.tipoMonedaId;

                return (
                    String(monedaId) ===
                    String(filtros.tipoMonedaId)
                );
            });
        }

        // FILTRO TEXTO
        const texto = filtros.busqueda
            .trim()
            .toLowerCase();

        if (texto) {
            resultado = resultado.filter((item) =>
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
                        String(valor)
                            .toLowerCase()
                            .includes(texto)
                    )
            );
        }

        return resultado;
    }, [
        data,
        filtros.busqueda,
        filtros.tipoMonedaId,
    ]);

    const totalSaldoInicial =
        dataFiltrada.reduce(
            (acc, item) =>
                acc +
                Number(item.cuB_Saldo_Inicial ?? 0),
            0
        );

    const totalSaldoActual =
        dataFiltrada.reduce(
            (acc, item) =>
                acc +
                Number(item.cuB_Saldo_Actual ?? 0),
            0
        );

    const getSimboloReporte = () => {
    const monedaSeleccionada = tiposMoneda.find((m) => {
        const id =
            m.tmO_Tipo_Moneda ??
            m.TMO_Tipo_Moneda ??
            m.tmo_Tipo_Moneda ??
            m.id;

            return String(id) === String(filtros.tipoMonedaId);
        });

        const descripcion =
            monedaSeleccionada?.tmO_Descripcion ??
            monedaSeleccionada?.TMO_Descripcion ??
            monedaSeleccionada?.tmo_Descripcion ??
            monedaSeleccionada?.Descripcion ??
            "";

        if (
            descripcion.toLowerCase().includes("dólar") ||
            descripcion.toLowerCase().includes("dolar") ||
            descripcion.toLowerCase().includes("usd")
        ) {
            return "$";
        }

        return "Q";
    };

    const simboloReporte = getSimboloReporte();

    const getSimboloMonedaSeleccionada = () => {
    const monedaSeleccionada = tiposMoneda.find(
        (m) =>
            String(
                m.tmO_Tipo_Moneda ??
                m.TMO_Tipo_Moneda
            ) === String(filtros.tipoMonedaId)
    );

    const descripcion =
        monedaSeleccionada?.tmO_Descripcion ??
        monedaSeleccionada?.TMO_Descripcion ??
        "";

    const texto = descripcion.toLowerCase();

    if (texto.includes("dólar") || texto.includes("dolar")) {
        return "$";
    }

    if (texto.includes("quetzal")) {
        return "Q";
    }

    if (texto.includes("euro")) {
        return "€";
    }

    return "Q";
};

const simboloMoneda = getSimboloMonedaSeleccionada();

    return (
        <div className="cuentabancaria-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>
                        Reporte de Cuentas Bancarias
                    </h1>

                    <span className="record-count">
                        {dataFiltrada.length} registros
                    </span>
                </div>

                <div className="reporte-actions">
                    <button
                        className="btn-secondary"
                        disabled={!dataFiltrada.length}
                        onClick={() =>
                            exportToExcel(dataFiltrada)
                        }
                    >
                        <FileSpreadsheet size={18} />
                        Excel
                    </button>

                    <button
                        className="btn-primary"
                        disabled={!dataFiltrada.length}
                        onClick={() =>
                            exportToPDF(dataFiltrada)
                        }
                    >
                        <FileText size={18} />
                        PDF
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

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
                {[
                    {
                        label: "Total cuentas",
                        val: dataFiltrada.length,
                        color: "#0284c7",
                        bg: "#e6f1fb",
                        icon: (
                            <CreditCard
                                size={20}
                                color="#0284c7"
                            />
                        ),
                    },

                    {
                        label: "Saldo inicial",
                        val: `${simboloReporte} ${totalSaldoInicial.toLocaleString(
                            "es-GT",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}`,

                        color: "#15803d",
                        bg: "#dcfce7",

                        icon: (
                            <Wallet
                                size={20}
                                color="#15803d"
                            />
                        ),
                    },

                    {
                        label: "Saldo actual",
                        val: `${simboloReporte} ${totalSaldoActual.toLocaleString(
                            "es-GT",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}`,

                        color: "#d97706",
                        bg: "#fef3c7",

                        icon: (
                            <Building2
                                size={20}
                                color="#d97706"
                            />
                        ),
                    },
                ].map((s, i) => (
                    <div
                        key={i}
                        className="kpi-card"
                        style={{
                            borderLeft: `4px solid ${s.color}`,
                        }}
                    >
                        <div>
                            <div className="kpi-label">
                                {s.label}
                            </div>

                            <div
                                className="kpi-value"
                                style={{
                                    color: s.color,
                                    fontSize:
                                        i === 0
                                            ? "22px"
                                            : "15px",
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
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="loading-state">
                    Cargando reporte...
                </div>
            ) : (
                <ReporteCuentaBancariaTable
                    data={dataFiltrada}
                />
            )}
        </div>
    );
}