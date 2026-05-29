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
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const azul = [3, 31, 71];
  const azulClaro = [230, 242, 255];
  const verde = [22, 163, 74];
  const rojo = [220, 38, 38];
  const amber = [217, 119, 6];
  const grisTexto = [51, 65, 85];
  const grisBorde = [226, 232, 240];

  const getSimboloMoneda = (item) => {
    const moneda = String(
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

    if (moneda.includes("dólar") || moneda.includes("dolar") || moneda.includes("usd")) {
      return "$";
    }

    return "Q";
  };

  const money = (value, item = {}) =>
    `${getSimboloMoneda(item)} ${Number(value ?? 0).toLocaleString("es-GT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getMonto = (item) =>
    Math.abs(Number(g(item, "moV_Monto", "mOV_Monto", "MOV_Monto") || 0));

  const getEstado = (item) =>
    g(item, "estadoCheque", "EstadoCheque", "esC_Descripcion", "eSC_Descripcion", "ESC_Descripcion") || "—";

  const getCuenta = (item) =>
    g(item, "cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "CUB_Numero_Cuenta") || "—";

  const getBeneficiario = (item) =>
    g(item, "beneficiario", "Beneficiario", "persona", "Persona") || "—";

  const totalCheques = data.length;

  const totalMonto = data.reduce((sum, item) => sum + getMonto(item), 0);

  const cobrados = data.filter((x) =>
    String(getEstado(x)).toLowerCase().includes("cobrado")
  ).length;

  const cancelados = data.filter((x) =>
    String(getEstado(x)).toLowerCase().includes("cancelado")
  ).length;

  const pendientes = data.filter((x) => {
    const e = String(getEstado(x)).toLowerCase();
    return e.includes("emitido") || e.includes("activo") || e.includes("pendiente");
  }).length;

  const primerItem = data[0] ?? {};

  const drawKpiCard = (x, y, w, h, titulo, valor, color) => {
    doc.setDrawColor(...grisBorde);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, w, h, 3, 3, "FD");

    doc.setTextColor(...color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(titulo, x + w / 2, y + 12, { align: "center" });

    doc.setFontSize(16);
    doc.text(String(valor), x + w / 2, y + 25, { align: "center" });

    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(x + w / 2 - 6, y + 31, x + w / 2 + 6, y + 31);
    doc.setLineWidth(0.2);
  };

  // ENCABEZADO
  doc.setFillColor(...azul);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.text("GCB", 12, 17);

  doc.setTextColor(250, 204, 21);
  doc.setFontSize(13);
  doc.text("BANK", 36, 17);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text("GESTIÓN DE CUENTAS BANCARIAS", 12, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("REPORTE DE CHEQUES", pageWidth / 2, 13, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Control de cheques emitidos", pageWidth / 2, 22, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Fecha de emisión", pageWidth - 45, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(new Date().toLocaleString("es-GT"), pageWidth - 45, 18);

  doc.setFillColor(...verde);
  doc.rect(0, 32, pageWidth, 1.5, "F");

  // INFORMACIÓN GENERAL
  doc.setDrawColor(...grisBorde);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(7, 40, pageWidth - 14, 45, 3, 3, "FD");

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INFORMACIÓN DEL REPORTE", 12, 52);

  doc.setFontSize(8);
  doc.setTextColor(...grisTexto);

  doc.setFont("helvetica", "bold");
  doc.text("Total de registros", 12, 64);
  doc.text("Cuenta principal", 12, 72);
  doc.text("Beneficiario principal", 12, 80);

  doc.setFont("helvetica", "normal");
  doc.text(`: ${totalCheques}`, 48, 64);
  doc.text(`: ${getCuenta(primerItem)}`, 48, 72);
  doc.text(`: ${getBeneficiario(primerItem)}`, 48, 80);

  doc.setDrawColor(...grisBorde);
  doc.line(110, 50, 110, 78);

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reporte de Cheques", 157, 61, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text("Resumen de cheques emitidos, cobrados y cancelados", 157, 71, { align: "center" });

  // KPIS
  drawKpiCard(7, 95, 38, 35, "TOTAL", totalCheques, [2, 132, 199]);
  drawKpiCard(50, 95, 48, 35, "MONTO TOTAL", money(totalMonto, primerItem), rojo);
  drawKpiCard(103, 95, 33, 35, "COBRADOS", cobrados, verde);
  drawKpiCard(141, 95, 33, 35, "PENDIENTES", pendientes, amber);
  drawKpiCard(179, 95, 30, 35, "ANULADOS", cancelados, rojo);

  // TÍTULO TABLA
  doc.setDrawColor(...grisBorde);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(7, 140, pageWidth - 14, 8, 2, 2, "FD");

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DETALLE DE CHEQUES", 10, 146);

  const rows = data.map((item, index) => {
    const estado = getEstado(item);

    return [
      index + 1,
      g(item, "chE_Numero_Cheque", "cHE_Numero_Cheque", "CHE_Numero_Cheque") || "—",
      getCuenta(item),
      getBeneficiario(item),
      g(item, "chE_Concepto", "cHE_Concepto", "CHE_Concepto") || "—",
      money(getMonto(item), item),
      formatDate(g(item, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision")),
      formatDate(g(item, "chE_Fecha_Cobro", "cHE_Fecha_Cobro", "CHE_Fecha_Cobro")),
      estado,
    ];
  });

  autoTable(doc, {
    startY: 150,
    head: [[
      "#",
      "NO. CHEQUE",
      "CUENTA",
      "BENEFICIARIO",
      "CONCEPTO",
      "MONTO",
      "EMISIÓN",
      "COBRO",
      "ESTADO",
    ]],
    body: rows,
    theme: "grid",
    margin: { left: 7, right: 7 },
    styles: {
      fontSize: 7,
      cellPadding: 2.2,
      overflow: "linebreak",
      lineColor: grisBorde,
      textColor: grisTexto,
    },
    headStyles: {
      fillColor: azul,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 9, halign: "center" },
      1: { cellWidth: 24, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 27, halign: "center" },
      3: { cellWidth: 36 },
      4: { cellWidth: 35 },
      5: { cellWidth: 25, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 20, halign: "center" },
      7: { cellWidth: 20, halign: "center" },
      8: { cellWidth: 22, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (cell) => {
      if (cell.section === "body" && cell.column.index === 5) {
        cell.cell.styles.textColor = rojo;
      }

      if (cell.section === "body" && cell.column.index === 8) {
        const estado = String(cell.cell.raw).toLowerCase();

        if (estado.includes("cobrado") || estado.includes("depositado")) {
          cell.cell.styles.textColor = verde;
          cell.cell.styles.fillColor = [240, 253, 244];
        } else if (estado.includes("cancelado") || estado.includes("rechazado") || estado.includes("anulado")) {
          cell.cell.styles.textColor = rojo;
          cell.cell.styles.fillColor = [254, 242, 242];
        } else {
          cell.cell.styles.textColor = amber;
          cell.cell.styles.fillColor = [255, 251, 235];
        }
      }
    },
  });

  let finalY = doc.lastAutoTable.finalY + 5;

  if (finalY > pageHeight - 35) {
    doc.addPage();
    finalY = 20;
  }

  // NOTA
  doc.setFillColor(...azulClaro);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(7, finalY, pageWidth - 14, 8, 2, 2, "FD");

  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    "Los montos mostrados corresponden al valor emitido por cada cheque.",
    13,
    finalY + 5.3
  );

  finalY += 16;

  // PIE
  doc.setDrawColor(...grisBorde);
  doc.line(7, finalY, pageWidth - 7, finalY);

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("REPORTE GENERADO AUTOMÁTICAMENTE", 12, finalY + 9);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grisTexto);
  doc.text("Sistema de Gestión de Cuentas Bancarias - GCBANK", 12, finalY + 15);
  doc.text("Este documento no requiere firma.", 12, finalY + 20);

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.text(`Página 1 de ${doc.internal.getNumberOfPages()}`, pageWidth - 42, finalY + 15);

  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...azul);
    doc.rect(0, pageHeight - 4, pageWidth, 4, "F");
  }

  doc.save("Reporte_Cheques_GCB.pdf");
};