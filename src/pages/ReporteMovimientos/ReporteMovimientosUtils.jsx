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

const formatMoney = (value) =>
    `Q ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-GT");
};

const getTipo = (item) =>
    getValue(item, ["tipoMovimiento", "TipoMovimiento"]);

const getMedio = (item) =>
    getValue(item, ["medioMovimiento", "MedioMovimiento"]);

const getEstado = (item) =>
    getValue(item, ["estadoMovimiento", "EstadoMovimiento"]);

const getMonto = (item) =>
    Number(getValue(item, ["moV_Monto", "mOV_Monto", "mov_monto"]) || 0);

const getRecargo = (item) =>
    Number(getValue(item, ["moV_Recargo", "mOV_Recargo", "mov_recargo"]) || 0);

const esIngreso = (item) =>
    String(getTipo(item)).trim().toLowerCase() === "ingreso";

export const exportToExcel = (data) => {
    const formatted = data.map((item) => ({
        Fecha: formatDate(getValue(item, ["moV_Fecha", "mOV_Fecha", "mov_fecha"])),
        "No. Cuenta": getValue(item, ["cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "cub_numero_cuenta"]),
        Persona: getValue(item, ["persona", "Persona"]),
        Tipo: getTipo(item),
        Medio: getMedio(item),
        Descripción: getValue(item, ["moV_Descripcion", "mOV_Descripcion", "mov_descripcion"]),
        Referencia: getValue(item, ["moV_Numero_Referencia", "mOV_Numero_Referencia", "mov_numero_referencia"]),
        Monto: formatMoney(getMonto(item)),
        Recargo: formatMoney(getRecargo(item)),
        Saldo: formatMoney(getValue(item, ["moV_Saldo", "mOV_Saldo", "mov_saldo"])),
        Estado: getEstado(item),
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
        orientation: "portrait",
        unit: "mm",
        format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    const totalMovimientos = data.length;

    const totalIngresos = data
        .filter((item) => esIngreso(item))
        .reduce((acc, item) => acc + getMonto(item), 0);

    const totalEgresos = data
        .filter((item) => !esIngreso(item))
        .reduce((acc, item) => acc + getMonto(item), 0);

    const totalRecargos = data
        .reduce((acc, item) => acc + getRecargo(item), 0);

    const saldoFinal = data.length
        ? Number(getValue(data[0], ["moV_Saldo", "mOV_Saldo", "mov_saldo"]) || 0)
        : 0;

    const cuenta = data.length
        ? getValue(data[0], ["cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "cub_numero_cuenta"])
        : "—";

    const persona = data.length
        ? getValue(data[0], ["persona", "Persona"])
        : "—";

    const fechas = data
        .map((x) => new Date(getValue(x, ["moV_Fecha", "mOV_Fecha", "mov_fecha"])))
        .filter((x) => !Number.isNaN(x.getTime()));

    const fechaInicio = fechas.length
        ? new Date(Math.min(...fechas)).toLocaleDateString("es-GT")
        : "—";

    const fechaFin = fechas.length
        ? new Date(Math.max(...fechas)).toLocaleDateString("es-GT")
        : "—";

    // Encabezado
    doc.setFillColor(224, 242, 254);
    doc.rect(0, 0, pageWidth, 34, "F");

    doc.setTextColor(2, 132, 199);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("GCB", 14, 18);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.text("Estado de Cuenta de Movimientos", 14, 28);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado: ${new Date().toLocaleDateString("es-GT")}`, pageWidth - 65, 18);

    // Datos generales
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Información de la cuenta", 14, 46);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Número de cuenta: ${cuenta || "—"}`, 14, 54);
    doc.text(`Persona relacionada: ${persona || "—"}`, 14, 61);
    doc.text(`Periodo del reporte: ${fechaInicio} al ${fechaFin}`, 14, 68);

    // Resumen
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de movimientos", 112, 46);

    autoTable(doc, {
        startY: 50,
        margin: { left: 112, right: 14 },
        theme: "grid",
        styles: {
            fontSize: 9,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [2, 132, 199],
            textColor: 255,
        },
        head: [["Concepto", "Valor"]],
        body: [
            ["Total movimientos", totalMovimientos],
            ["Total ingresos", formatMoney(totalIngresos)],
            ["Total egresos", formatMoney(totalEgresos)],
            ["Total recargos", formatMoney(totalRecargos)],
            ["Saldo final", formatMoney(saldoFinal)],
        ],
    });

    // Detalle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Detalle de la actividad", 14, 86);

    const rows = data.map((item) => [
        formatDate(getValue(item, ["moV_Fecha", "mOV_Fecha", "mov_fecha"])),
        getTipo(item) || "—",
        getMedio(item) || "—",
        getValue(item, ["moV_Descripcion", "mOV_Descripcion", "mov_descripcion"]) || "—",
        getValue(item, ["moV_Numero_Referencia", "mOV_Numero_Referencia", "mov_numero_referencia"]) || "—",
        formatMoney(getMonto(item)),
        formatMoney(getValue(item, ["moV_Saldo", "mOV_Saldo", "mov_saldo"])),
    ]);

    autoTable(doc, {
        startY: 90,
        head: [[
            "Fecha",
            "Tipo",
            "Medio",
            "Descripción",
            "Referencia",
            "Monto",
            "Saldo",
        ]],
        body: rows,
        styles: {
            fontSize: 7.5,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [249, 115, 22],
            textColor: 255,
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            3: { cellWidth: 42 },
            4: { cellWidth: 28 },
        },
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
            `Sistema GCB - Reporte de movimientos | Página ${i} de ${pageCount}`,
            14,
            doc.internal.pageSize.getHeight() - 10
        );
    }

    doc.save("Estado_Cuenta_Movimientos_GCB.pdf");
};