import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const formatDate = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-GT");
};

export const exportChequesToExcel = (data = []) => {
  const rows = data.map((item, index) => ({
    "#": index + 1,
    "No. Cheque": g(item, "chE_Numero_Cheque", "cHE_Numero_Cheque", "CHE_Numero_Cheque"),
    Cuenta: g(item, "cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "CUB_Numero_Cuenta"),
    Beneficiario: g(item, "beneficiario", "Beneficiario", "persona", "Persona"),
    Concepto: g(item, "chE_Concepto", "cHE_Concepto", "CHE_Concepto"),
    Monto: formatMoney(Math.abs(Number(g(item, "moV_Monto", "mOV_Monto", "MOV_Monto") || 0))),
    "Fecha emisión": formatDate(g(item, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision")),
    "Fecha vencimiento": formatDate(g(item, "chE_Fecha_Vencimiento", "cHE_Fecha_Vencimiento", "CHE_Fecha_Vencimiento")),
    "Fecha cobro": formatDate(g(item, "chE_Fecha_Cobro", "cHE_Fecha_Cobro", "CHE_Fecha_Cobro")),
    Estado: g(item, "estadoCheque", "EstadoCheque", "esC_Descripcion", "eSC_Descripcion", "ESC_Descripcion"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Reporte Cheques");

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer], { type: "application/octet-stream" }),
    "Reporte_Cheques_GCB.xlsx"
  );
};

export const exportChequesToPDF = (data = []) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reporte de Cheques - GCB", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-GT")}`, 14, 26);

  const rows = data.map((item, index) => [
    index + 1,
    g(item, "chE_Numero_Cheque", "cHE_Numero_Cheque", "CHE_Numero_Cheque") || "—",
    g(item, "cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "CUB_Numero_Cuenta") || "—",
    g(item, "beneficiario", "Beneficiario", "persona", "Persona") || "—",
    g(item, "chE_Concepto", "cHE_Concepto", "CHE_Concepto") || "—",
    formatMoney(Math.abs(Number(g(item, "moV_Monto", "mOV_Monto", "MOV_Monto") || 0))),
    formatDate(g(item, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision")),
    formatDate(g(item, "chE_Fecha_Cobro", "cHE_Fecha_Cobro", "CHE_Fecha_Cobro")),
    g(item, "estadoCheque", "EstadoCheque", "esC_Descripcion", "eSC_Descripcion", "ESC_Descripcion") || "—",
  ]);

  autoTable(doc, {
    startY: 34,
    head: [[
      "#",
      "No. Cheque",
      "Cuenta",
      "Beneficiario",
      "Concepto",
      "Monto",
      "Emisión",
      "Cobro",
      "Estado",
    ]],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  doc.save("Reporte_Cheques_GCB.pdf");
};