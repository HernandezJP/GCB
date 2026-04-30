import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
    }
    return "";
};

const formatMoney = (value) => Number(value ?? 0).toFixed(2);

const formatDate = (fecha) => {
    if (!fecha) return "";

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("es-GT");
};

export const exportToExcel = (data) => {
    const formatted = data.map((item) => ({
        ID: getValue(item, ["chE_Cheque", "CHE_Cheque"]),
        Cuenta: getValue(item, ["cuB_Cuenta", "CUB_Cuenta"]),
        Chequera: getValue(item, ["chQ_Chequera", "CHQ_Chequera"]),
        "No. Cheque": getValue(item, ["chE_Numero_Cheque", "CHE_Numero_Cheque"]),
        Beneficiario: getValue(item, ["beneficiario", "Beneficiario"]),
        Monto: formatMoney(getValue(item, ["moV_Monto", "MOV_Monto"])),
        "Monto Letras": getValue(item, ["chE_Monto_Letras", "CHE_Monto_Letras"]),
        Concepto: getValue(item, ["chE_Concepto", "CHE_Concepto"]),
        Estado: getValue(item, ["estadoCheque", "EstadoCheque"]),
        "Fecha Emisión": formatDate(getValue(item, ["chE_Fecha_Emision", "CHE_Fecha_Emision"])),
        "Fecha Cobro": formatDate(getValue(item, ["chE_Fecha_Cobro", "CHE_Fecha_Cobro"])),
        "Fecha Vencimiento": formatDate(getValue(item, ["chE_Fecha_Vencimiento", "CHE_Fecha_Vencimiento"])),
        Saldo: formatMoney(getValue(item, ["moV_Saldo", "MOV_Saldo"])),
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Cheques");

    const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
    });

    saveAs(
        new Blob([buffer], {
            type: "application/octet-stream",
        }),
        "Reporte_Cheques.xlsx"
    );
};

export const exportToPDF = (data) => {
    const doc = new jsPDF({
        orientation: "landscape",
    });

    doc.setFontSize(14);
    doc.text("Reporte de Cheques", 14, 15);

    const rows = data.map((item) => [
        getValue(item, ["chE_Cheque", "CHE_Cheque"]),
        getValue(item, ["cuB_Cuenta", "CUB_Cuenta"]),
        getValue(item, ["chQ_Chequera", "CHQ_Chequera"]),
        getValue(item, ["chE_Numero_Cheque", "CHE_Numero_Cheque"]),
        getValue(item, ["beneficiario", "Beneficiario"]),
        `Q ${formatMoney(getValue(item, ["moV_Monto", "MOV_Monto"]))}`,
        getValue(item, ["chE_Concepto", "CHE_Concepto"]),
        getValue(item, ["estadoCheque", "EstadoCheque"]),
        formatDate(getValue(item, ["chE_Fecha_Emision", "CHE_Fecha_Emision"])),
        formatDate(getValue(item, ["chE_Fecha_Cobro", "CHE_Fecha_Cobro"])),
        formatDate(getValue(item, ["chE_Fecha_Vencimiento", "CHE_Fecha_Vencimiento"])),
        `Q ${formatMoney(getValue(item, ["moV_Saldo", "MOV_Saldo"]))}`,
    ]);

    autoTable(doc, {
        startY: 22,
        head: [[
            "ID",
            "Cuenta",
            "Chequera",
            "No. Cheque",
            "Beneficiario",
            "Monto",
            "Concepto",
            "Estado",
            "F. Emisión",
            "F. Cobro",
            "F. Vencimiento",
            "Saldo",
        ]],
        body: rows,
        styles: {
            fontSize: 8,
        },
        headStyles: {
            fontStyle: "bold",
        },
    });

    doc.save("Reporte_Cheques.pdf");
};