import { useEffect, useMemo, useState } from "react";
import { FileText, FileSpreadsheet, CheckCircle, XCircle, Clock, Receipt } from "lucide-react";

import ReporteChequesFilter from "./ReporteChequesFilter";
import ReporteChequesTable from "./ReporteChequesTable";

import { getCheques } from "../../services/ChequeService";
import { getCuentas } from "../../services/CuentaBancariaService";
import api from "../../api/axios";

import {
  exportChequesToExcel,
  exportChequesToPDF
} from "./ReporteChequesExport";

import "../ReporteMovimientos/ReporteMovimientos.css";

const g = (o, ...ks) => {
  for (const k of ks) {
    const v = o?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return "";
};

const formatMoney = (value) =>
  `Q ${Number(value ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getPeriodoActual = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
};

const getFechaLocal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

function ReporteChequesPage() {
  const [data, setData] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [estadosCheque, setEstadosCheque] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({
    cuentaId: "",
    estadoChequeId: "",
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

      const [chequesData, cuentasData, estadosData] = await Promise.all([
        getCheques(),
        getCuentas(),
        api.get("/estados-cheque").then((r) => r.data),
      ]);

      setData(Array.isArray(chequesData) ? chequesData : []);
      setCuentas(Array.isArray(cuentasData) ? cuentasData : []);
      setEstadosCheque(Array.isArray(estadosData) ? estadosData : []);
    } catch (err) {
      console.error("Error cargando reporte de cheques:", err);
      setError(err?.response?.data?.mensaje || "No se pudo cargar el reporte de cheques.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const dataFiltrada = useMemo(() => {
    let lista = [...data];

    if (filtros.cuentaId) {
      lista = lista.filter(
        (x) =>
          String(g(x, "cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta")) ===
          String(filtros.cuentaId)
      );
    }

    if (filtros.estadoChequeId) {
      lista = lista.filter(
        (x) =>
          String(g(x, "esC_Estado_Cheque", "eSC_Estado_Cheque", "ESC_Estado_Cheque")) ===
          String(filtros.estadoChequeId)
      );
    }

    let fechaInicio = filtros.fechaInicio;
    let fechaFin = filtros.fechaFin;

    if (filtros.modoFecha === "mes") {
      const rango = getRangoMes(filtros.periodo);
      fechaInicio = rango.fechaInicio;
      fechaFin = rango.fechaFin;
    }

    if (fechaInicio) {
      lista = lista.filter((x) => {
        const fecha = new Date(g(x, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision"));
        return !Number.isNaN(fecha.getTime()) && fecha >= new Date(fechaInicio);
      });
    }

    if (fechaFin) {
      lista = lista.filter((x) => {
        const fecha = new Date(g(x, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision"));
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        return !Number.isNaN(fecha.getTime()) && fecha <= fin;
      });
    }

    const q = filtros.busqueda.trim().toLowerCase();

    if (q) {
      lista = lista.filter((x) =>
        [
          g(x, "chE_Numero_Cheque", "cHE_Numero_Cheque", "CHE_Numero_Cheque"),
          g(x, "beneficiario", "Beneficiario", "persona", "Persona"),
          g(x, "chE_Concepto", "cHE_Concepto", "CHE_Concepto"),
          g(x, "cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "CUB_Numero_Cuenta"),
          g(x, "estadoCheque", "EstadoCheque"),
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return lista;
  }, [data, filtros]);

  const resumen = useMemo(() => {
    const totalCheques = dataFiltrada.length;

    const totalMonto = dataFiltrada.reduce(
      (sum, x) => sum + Math.abs(Number(g(x, "moV_Monto", "mOV_Monto", "MOV_Monto") || 0)),
      0
    );

    const cobrados = dataFiltrada.filter((x) =>
      String(g(x, "estadoCheque", "EstadoCheque")).toLowerCase().includes("cobrado")
    ).length;

    const cancelados = dataFiltrada.filter((x) =>
      String(g(x, "estadoCheque", "EstadoCheque")).toLowerCase().includes("cancelado")
    ).length;

    const pendientes = dataFiltrada.filter((x) => {
      const e = String(g(x, "estadoCheque", "EstadoCheque")).toLowerCase();
      return e.includes("emitido") || e.includes("activo") || e.includes("pendiente");
    }).length;

    return { totalCheques, totalMonto, cobrados, cancelados, pendientes };
  }, [dataFiltrada]);

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
            onClick={() => exportChequesToExcel(dataFiltrada)}
            >
            <FileSpreadsheet size={18} />
            Excel
            </button>

            <button
            className="btn-primary"
            disabled={!dataFiltrada.length}
            onClick={() => exportChequesToPDF(dataFiltrada)}
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
        cuentas={cuentas}
        estadosCheque={estadosCheque}
        onBuscar={cargarDatos}
      />

      <div className="kpi-grid">
        {[
          { label: "Total cheques", val: resumen.totalCheques, color: "#0284c7", bg: "#e0f2fe", icon: <Receipt size={20} color="#0284c7" /> },
          { label: "Monto total", val: formatMoney(resumen.totalMonto), color: "#b91c1c", bg: "#fee2e2", icon: <FileText size={20} color="#b91c1c" /> },
          { label: "Cobrados", val: resumen.cobrados, color: "#15803d", bg: "#dcfce7", icon: <CheckCircle size={20} color="#15803d" /> },
          { label: "Pendientes", val: resumen.pendientes, color: "#d97706", bg: "#fef3c7", icon: <Clock size={20} color="#d97706" /> },
          { label: "Cancelados", val: resumen.cancelados, color: "#dc2626", bg: "#fee2e2", icon: <XCircle size={20} color="#dc2626" /> },
        ].map((s, i) => (
          <div key={i} className="kpi-card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div>
              <div className="kpi-label">{s.label}</div>
              <div className="kpi-value" style={{ color: s.color, fontSize: "15px" }}>
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
        <div className="loading-state">Cargando reporte de cheques...</div>
      ) : (
        <ReporteChequesTable data={dataFiltrada} />
      )}
    </div>
  );
}

export default ReporteChequesPage;