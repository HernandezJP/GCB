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

const formatDate = (fecha) => {
    if (!fecha) return "";

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("es-GT");
};

const getEstadoTexto = (estado) => {
    if (estado === "A") return "Activa";
    if (estado === "I") return "Inactiva";
    return estado || "";
};

export const exportToExcel = (data) => {
    const formatted = data.map((item) => {
        const estado = getValue(item, [
            "chQ_Estado",
            "CHQ_Estado",
            "estadoChequera",
            "EstadoChequera",
        ]);

        return {
            ID: getValue(item, ["chQ_Chequera", "CHQ_Chequera"]),
            Cuenta: getValue(item, ["cuB_Cuenta", "CUB_Cuenta"]),
            Serie: getValue(item, ["chQ_Serie", "CHQ_Serie"]),
            Desde: getValue(item, ["chQ_Numero_Desde", "CHQ_Numero_Desde"]),
            Hasta: getValue(item, ["chQ_Numero_Hasta", "CHQ_Numero_Hasta"]),
            "Último Usado": getValue(item, ["chQ_Ultimo_Usado", "CHQ_Ultimo_Usado"]),
            Total: getValue(item, ["totalCheques", "TotalCheques"]),
            Usados: getValue(item, ["chequesUsados", "ChequesUsados"]),
            Disponibles: getValue(item, ["chequesDisponibles", "ChequesDisponibles"]),
            Estado: getEstadoTexto(estado),
            "Fecha Recepción": formatDate(
                getValue(item, ["chQ_Fecha_Recepcion", "CHQ_Fecha_Recepcion"])
            ),
            "Fecha Creación": formatDate(
                getValue(item, ["chQ_Fecha_Creacion", "CHQ_Fecha_Creacion"])
            ),
        };
    });

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Chequeras");

    const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
    });

    saveAs(
        new Blob([buffer], {
            type: "application/octet-stream",
        }),
        "Reporte_Chequeras.xlsx"
    );
};

export const exportToPDF = (data) => {
    const doc = new jsPDF({
        orientation: "landscape",
    });

    doc.setFontSize(14);
    doc.text("Reporte de Chequeras", 14, 15);

    const rows = data.map((item) => {
        const estado = getValue(item, [
            "chQ_Estado",
            "CHQ_Estado",
            "estadoChequera",
            "EstadoChequera",
        ]);

        return [
            getValue(item, ["chQ_Chequera", "CHQ_Chequera"]),
            getValue(item, ["cuB_Cuenta", "CUB_Cuenta"]),
            getValue(item, ["chQ_Serie", "CHQ_Serie"]),
            getValue(item, ["chQ_Numero_Desde", "CHQ_Numero_Desde"]),
            getValue(item, ["chQ_Numero_Hasta", "CHQ_Numero_Hasta"]),
            getValue(item, ["chQ_Ultimo_Usado", "CHQ_Ultimo_Usado"]),
            getValue(item, ["totalCheques", "TotalCheques"]),
            getValue(item, ["chequesUsados", "ChequesUsados"]),
            getValue(item, ["chequesDisponibles", "ChequesDisponibles"]),
            getEstadoTexto(estado),
            formatDate(getValue(item, ["chQ_Fecha_Recepcion", "CHQ_Fecha_Recepcion"])),
            formatDate(getValue(item, ["chQ_Fecha_Creacion", "CHQ_Fecha_Creacion"])),
        ];
    });

    autoTable(doc, {
        startY: 22,
        head: [[
            "ID",
            "Cuenta",
            "Serie",
            "Desde",
            "Hasta",
            "Último Usado",
            "Total",
            "Usados",
            "Disponibles",
            "Estado",
            "F. Recepción",
            "F. Creación",
        ]],
        body: rows,
        styles: {
            fontSize: 8,
        },
        headStyles: {
            fontStyle: "bold",
        },
    });

    doc.save("Reporte_Chequeras.pdf");
};