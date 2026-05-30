import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
} from "lucide-react";

import ReporteChequesFilter from "./ReporteChequesFilter";
import ReporteChequesTable from "./ReporteChequesTable";

import { getCheques } from "../../services/ChequeService";
import { getCuentas } from "../../services/CuentaBancariaService";
import api from "../../api/axios";

import {
  exportChequesToExcel,
  exportChequesToPDF,
} from "./ReporteChequesExport";

import "../ReporteMovimientos/ReporteMovimientos.css";

const g = (o, ...ks) => {
  for (const k of ks) {
    const v = o?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return "";
};

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

const getCuentaId = (c) =>
  g(c, "cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta");

const getCuentaNumero = (c) =>
  g(c, "cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "CUB_Numero_Cuenta");

const getBancoNombre = (c) =>
  g(c, "bAN_Nombre", "baN_Nombre", "BAN_Nombre", "banco", "Banco");

const getTitularCuenta = (c) => {
  const nombre = [
    g(c, "cuB_Primer_Nombre", "cUB_Primer_Nombre", "CUB_Primer_Nombre"),
    g(c, "cuB_Segundo_Nombre", "cUB_Segundo_Nombre", "CUB_Segundo_Nombre"),
    g(c, "cuB_Primer_Apellido", "cUB_Primer_Apellido", "CUB_Primer_Apellido"),
    g(c, "cuB_Segundo_Apellido", "cUB_Segundo_Apellido", "CUB_Segundo_Apellido"),
  ]
    .filter(Boolean)
    .join(" ");

  return nombre || g(c, "titular", "Titular", "nombreCompleto", "NombreCompleto");
};

const getMonedaTexto = (item) =>
  String(
    g(
      item,
      "tipoMoneda",
      "TipoMoneda",
      "tmO_Descripcion",
      "tMO_Descripcion",
      "TMO_Descripcion",
      "moneda",
      "Moneda"
    )
  ).toLowerCase();

const getSimboloMoneda = (item) => {
  const moneda = getMonedaTexto(item);

  if (
    moneda.includes("dólar") ||
    moneda.includes("dolar") ||
    moneda.includes("usd")
  ) {
    return "$";
  }

  return "Q";
};

const formatMoney = (value, item = {}) =>
  `${getSimboloMoneda(item)} ${Number(value ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
      setError(
        err?.response?.data?.mensaje ||
          "No se pudo cargar el reporte de cheques."
      );
    } finally {
      setLoading(false);
    }

    console.log("CUENTAS DATA:", cuentasData);
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
          String(
            g(x, "esC_Estado_Cheque", "eSC_Estado_Cheque", "ESC_Estado_Cheque")
          ) === String(filtros.estadoChequeId)
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
        const fecha = new Date(
          g(x, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision")
        );
        return !Number.isNaN(fecha.getTime()) && fecha >= new Date(fechaInicio);
      });
    }

    if (fechaFin) {
      lista = lista.filter((x) => {
        const fecha = new Date(
          g(x, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision")
        );
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
          g(x, "tipoMoneda", "TipoMoneda"),
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return lista;
  }, [data, filtros]);

  const dataConCuenta = useMemo(() => {
    return dataFiltrada.map((cheque) => {
      const cuentaId = g(cheque, "cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta");

      const cuenta = cuentas.find(
        (c) => String(getCuentaId(c)) === String(cuentaId)
      );

      const numeroCuenta =
        g(cheque, "cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "CUB_Numero_Cuenta") ||
        getCuentaNumero(cuenta);

      const banco = getBancoNombre(cuenta);
      const titular = getTitularCuenta(cuenta);

      const moneda =
        g(
          cheque,
          "tipoMoneda",
          "TipoMoneda",
          "tmO_Descripcion",
          "tMO_Descripcion",
          "TMO_Descripcion",
          "moneda",
          "Moneda"
        ) ||
        g(
          cuenta,
          "tipoMoneda",
          "TipoMoneda",
          "tmO_Descripcion",
          "tMO_Descripcion",
          "TMO_Descripcion",
          "moneda",
          "Moneda"
        );

      return {
        ...cheque,
        cuB_Numero_Cuenta: numeroCuenta,
        bancoCuenta: banco,
        titularCuenta: titular,
        tipoMoneda: moneda,
        cuentaTexto: [numeroCuenta, banco].filter(Boolean).join(" · "),
      };
    });
  }, [dataFiltrada, cuentas]);

  const resumen = useMemo(() => {
    const totalCheques = dataConCuenta.length;

    const cobrados = dataConCuenta.filter((x) =>
      String(g(x, "estadoCheque", "EstadoCheque")).toLowerCase().includes("cobrado")
    ).length;

    const cancelados = dataConCuenta.filter((x) =>
      String(g(x, "estadoCheque", "EstadoCheque")).toLowerCase().includes("cancelado")
    ).length;

    const pendientes = dataConCuenta.filter((x) => {
      const e = String(g(x, "estadoCheque", "EstadoCheque")).toLowerCase();
      return e.includes("emitido") || e.includes("activo") || e.includes("pendiente");
    }).length;

    return {
      totalCheques,
      cobrados,
      cancelados,
      pendientes,
    };
  }, [dataConCuenta]);

  const resumenPorMoneda = useMemo(() => {
    const resumenMonedas = {
      quetzales: {
        simbolo: "Q",
        total: 0,
        cantidad: 0,
      },
      dolares: {
        simbolo: "$",
        total: 0,
        cantidad: 0,
      },
    };

    dataConCuenta.forEach((item) => {
      const simbolo = getSimboloMoneda(item);
      const key = simbolo === "$" ? "dolares" : "quetzales";

      const monto = Math.abs(
        Number(g(item, "moV_Monto", "mOV_Monto", "MOV_Monto") || 0)
      );

      resumenMonedas[key].total += monto;
      resumenMonedas[key].cantidad += 1;
    });

    return resumenMonedas;
  }, [dataConCuenta]);

  return (
    <div className="cuentabancaria-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reporte de Cheques</h1>
          <span className="record-count">{dataConCuenta.length} registros</span>
        </div>

        <div className="reporte-actions">
          <button
            className="btn-secondary"
            disabled={!dataConCuenta.length}
            onClick={() => exportChequesToExcel(dataConCuenta)}
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          <button
            className="btn-primary"
            disabled={!dataConCuenta.length}
            onClick={() => exportChequesToPDF(dataConCuenta)}
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
          {
            label: "Total cheques",
            val: resumen.totalCheques,
            color: "#0284c7",
            bg: "#e0f2fe",
            icon: <Receipt size={20} color="#0284c7" />,
          },
          {
            label: "Monto total GTQ",
            val: formatMoney(resumenPorMoneda.quetzales.total, {
              tipoMoneda: "Quetzal",
            }),
            color: "#b91c1c",
            bg: "#fee2e2",
            icon: <FileText size={20} color="#b91c1c" />,
          },
          {
            label: "Monto total USD",
            val: formatMoney(resumenPorMoneda.dolares.total, {
              tipoMoneda: "Dólar estadounidense",
            }),
            color: "#0284c7",
            bg: "#e0f2fe",
            icon: <FileText size={20} color="#0284c7" />,
          },
          {
            label: "Cobrados",
            val: resumen.cobrados,
            color: "#15803d",
            bg: "#dcfce7",
            icon: <CheckCircle size={20} color="#15803d" />,
          },
          {
            label: "Pendientes",
            val: resumen.pendientes,
            color: "#d97706",
            bg: "#fef3c7",
            icon: <Clock size={20} color="#d97706" />,
          },
          {
            label: "Cancelados",
            val: resumen.cancelados,
            color: "#dc2626",
            bg: "#fee2e2",
            icon: <XCircle size={20} color="#dc2626" />,
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
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Cargando reporte de cheques...</div>
      ) : (
        <ReporteChequesTable data={dataConCuenta} />
      )}
    </div>
  );
}

export default ReporteChequesPage;