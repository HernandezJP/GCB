import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatMoney = (value) => Number(value ?? 0).toFixed(2);

const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("es-GT");
};

export const exportToExcel = (data) => {
    const formatted = data.map((item) => ({
        "No. Cuenta": item.cuB_Numero_Cuenta,
        Banco: item.banco,
        Periodo: item.coN_Periodo,
        "Saldo Banco": formatMoney(item.coN_Saldo_Banco),
        "Saldo Libros": formatMoney(item.coN_Saldo_Libros),
        Diferencia: formatMoney(item.coN_Diferencia),
        Estado: item.estadoConciliacion,
        Conciliados: item.totalConciliados,
        "Pendientes Banco": item.totalPendientesBanco,
        "Pendientes Libros": item.totalPendientesLibros,
        "En Tránsito": item.totalEnTransito,
        Diferencias: item.totalDiferencias,
        "Fecha Conciliación": formatDate(item.coN_Fecha_Conciliacion),
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Conciliaciones");

    const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
    });

    saveAs(
        new Blob([buffer], {
            type: "application/octet-stream",
        }),
        "Reporte_Conciliaciones.xlsx"
    );
};

export const exportToPDF = (data) => {
    const doc = new jsPDF({
        orientation: "landscape",
    });

    doc.setFontSize(14);
    doc.text("Reporte de Conciliaciones Bancarias", 14, 15);

    const rows = data.map((item) => [
        item.cuB_Numero_Cuenta,
        item.banco,
        item.coN_Periodo,
        `Q ${formatMoney(item.coN_Saldo_Banco)}`,
        `Q ${formatMoney(item.coN_Saldo_Libros)}`,
        `Q ${formatMoney(item.coN_Diferencia)}`,
        item.estadoConciliacion,
        item.totalConciliados,
        item.totalPendientesBanco,
        item.totalPendientesLibros,
        item.totalEnTransito,
        item.totalDiferencias,
    ]);

    autoTable(doc, {
        startY: 22,
        head: [[
            "Cuenta",
            "Banco",
            "Periodo",
            "Saldo Banco",
            "Saldo Libros",
            "Diferencia",
            "Estado",
            "Conc.",
            "Pend. Banco",
            "Pend. Libros",
            "Tránsito",
            "Dif.",
        ]],
        body: rows,
        styles: {
            fontSize: 7,
        },
        headStyles: {
            fontStyle: "bold",
        },
    });

    doc.save("Reporte_Conciliaciones.pdf");
};