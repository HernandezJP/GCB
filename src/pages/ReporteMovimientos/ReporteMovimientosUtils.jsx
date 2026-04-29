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
        Fecha: formatDate(getValue(item, ["moV_Fecha", "mOV_Fecha", "mov_fecha"])),
        "No. Cuenta": getValue(item, ["cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "cub_numero_cuenta"]),
        Persona: getValue(item, ["persona", "Persona"]),
        Tipo: getValue(item, ["tipoMovimiento", "TipoMovimiento"]),
        Medio: getValue(item, ["medioMovimiento", "MedioMovimiento"]),
        Descripción: getValue(item, ["moV_Descripcion", "mOV_Descripcion", "mov_descripcion"]),
        Referencia: getValue(item, ["moV_Numero_Referencia", "mOV_Numero_Referencia", "mov_numero_referencia"]),
        Monto: formatMoney(getValue(item, ["moV_Monto", "mOV_Monto", "mov_monto"])),
        Recargo: formatMoney(getValue(item, ["moV_Recargo", "mOV_Recargo", "mov_recargo"])),
        Saldo: formatMoney(getValue(item, ["moV_Saldo", "mOV_Saldo", "mov_saldo"])),
        Estado: getValue(item, ["estadoMovimiento", "EstadoMovimiento"]),
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

    const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
    });

    saveAs(
        new Blob([buffer], {
            type: "application/octet-stream",
        }),
        "Reporte_Movimientos.xlsx"
    );
};

export const exportToPDF = (data) => {
    const doc = new jsPDF({
        orientation: "landscape",
    });

    doc.setFontSize(14);
    doc.text("Reporte de Movimientos", 14, 15);

    const rows = data.map((item) => [
        formatDate(getValue(item, ["moV_Fecha", "mOV_Fecha", "mov_fecha"])),
        getValue(item, ["cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "cub_numero_cuenta"]),
        getValue(item, ["persona", "Persona"]),
        getValue(item, ["tipoMovimiento", "TipoMovimiento"]),
        getValue(item, ["medioMovimiento", "MedioMovimiento"]),
        getValue(item, ["moV_Descripcion", "mOV_Descripcion", "mov_descripcion"]),
        getValue(item, ["moV_Numero_Referencia", "mOV_Numero_Referencia", "mov_numero_referencia"]),
        `Q ${formatMoney(getValue(item, ["moV_Monto", "mOV_Monto", "mov_monto"]))}`,
        `Q ${formatMoney(getValue(item, ["moV_Recargo", "mOV_Recargo", "mov_recargo"]))}`,
        `Q ${formatMoney(getValue(item, ["moV_Saldo", "mOV_Saldo", "mov_saldo"]))}`,
        getValue(item, ["estadoMovimiento", "EstadoMovimiento"]),
    ]);

    autoTable(doc, {
        startY: 22,
        head: [[
            "Fecha",
            "No. Cuenta",
            "Persona",
            "Tipo",
            "Medio",
            "Descripción",
            "Referencia",
            "Monto",
            "Recargo",
            "Saldo",
            "Estado",
        ]],
        body: rows,
        styles: {
            fontSize: 8,
        },
        headStyles: {
            fontStyle: "bold",
        },
    });

    doc.save("Reporte_Movimientos.pdf");
};