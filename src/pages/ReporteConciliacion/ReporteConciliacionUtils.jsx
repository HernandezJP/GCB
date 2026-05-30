import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) {
            return obj[key];
        }
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

const getNumeroCuenta = (item) =>
    getValue(item, [
        "cuB_Numero_Cuenta",
        "cUB_Numero_Cuenta",
        "cub_numero_cuenta",
    ]) || "—";

const getBanco = (item) =>
    getValue(item, [
        "banco",
        "bAN_Nombre",
        "baN_Nombre",
        "ban_nombre",
    ]) || "—";

const getPeriodo = (item) =>
    getValue(item, [
        "coN_Periodo",
        "con_periodo",
        "periodo",
    ]) || "—";

const getSaldoBanco = (item) =>
    Number(getValue(item, ["coN_Saldo_Banco", "con_saldo_banco"]) || 0);

const getSaldoLibros = (item) =>
    Number(getValue(item, ["coN_Saldo_Libros", "con_saldo_libros"]) || 0);

const getDiferencia = (item) =>
    Number(getValue(item, ["coN_Diferencia", "con_diferencia"]) || 0);

const getEstado = (item) =>
    getValue(item, [
        "estadoConciliacion",
        "estadO_Conciliacion",
        "estado_conciliacion",
    ]) || "—";

const getTotalConciliados = (item) =>
    Number(getValue(item, ["totalConciliados", "total_conciliados"]) || 0);

const getTotalPendientesBanco = (item) =>
    Number(getValue(item, ["totalPendientesBanco", "total_pendientes_banco"]) || 0);

const getTotalPendientesLibros = (item) =>
    Number(getValue(item, ["totalPendientesLibros", "total_pendientes_libros"]) || 0);

const getTotalEnTransito = (item) =>
    Number(getValue(item, ["totalEnTransito", "total_en_transito"]) || 0);

const getTotalDiferencias = (item) =>
    Number(getValue(item, ["totalDiferencias", "total_diferencias"]) || 0);

const getFechaConciliacion = (item) =>
    getValue(item, [
        "coN_Fecha_Conciliacion",
        "con_fecha_conciliacion",
        "fecha_conciliacion",
    ]) || "";

const ordenarPorFecha = (data) => {
    return [...data].sort((a, b) => {
        const fechaA = new Date(getFechaConciliacion(a));
        const fechaB = new Date(getFechaConciliacion(b));
        return fechaA - fechaB;
    });
};

export const exportToExcel = (data) => {
    const dataOrdenada = ordenarPorFecha(data);

    const resumenEstado = [
        ["REPORTE DE CONCILIACIONES BANCARIAS"],
        [],
        ["Período de generación", new Date().toLocaleDateString("es-GT")],
        ["Total de registros", dataOrdenada.length],
        [],
        ["RESUMEN GENERAL"],
        [
            "Saldo Banco Total",
            formatMoney(
                dataOrdenada.reduce((sum, item) => sum + getSaldoBanco(item), 0)
            ),
        ],
        [
            "Saldo Libros Total",
            formatMoney(
                dataOrdenada.reduce((sum, item) => sum + getSaldoLibros(item), 0)
            ),
        ],
        [
            "Diferencia Total",
            formatMoney(
                dataOrdenada.reduce((sum, item) => sum + getDiferencia(item), 0)
            ),
        ],
        [
            "Total Conciliados",
            dataOrdenada.reduce((sum, item) => sum + getTotalConciliados(item), 0),
        ],
        [
            "Total Pendientes Banco",
            dataOrdenada.reduce((sum, item) => sum + getTotalPendientesBanco(item), 0),
        ],
        [
            "Total Pendientes Libros",
            dataOrdenada.reduce((sum, item) => sum + getTotalPendientesLibros(item), 0),
        ],
        [
            "Total En Tránsito",
            dataOrdenada.reduce((sum, item) => sum + getTotalEnTransito(item), 0),
        ],
        [
            "Total Diferencias",
            dataOrdenada.reduce((sum, item) => sum + getTotalDiferencias(item), 0),
        ],
        [],
    ];

    const detalle = dataOrdenada.map((item, index) => ({
        "#": index + 1,
        Cuenta: getNumeroCuenta(item),
        Banco: getBanco(item),
        Periodo: getPeriodo(item),
        "Saldo Banco": formatMoney(getSaldoBanco(item)),
        "Saldo Libros": formatMoney(getSaldoLibros(item)),
        Diferencia: formatMoney(getDiferencia(item)),
        Estado: getEstado(item),
        Conciliados: getTotalConciliados(item),
        "Pend. Banco": getTotalPendientesBanco(item),
        "Pend. Libros": getTotalPendientesLibros(item),
        "En Tránsito": getTotalEnTransito(item),
        Diferencias: getTotalDiferencias(item),
        "Fecha Conciliación": formatDate(getFechaConciliacion(item)),
    }));

    const ws = XLSX.utils.aoa_to_sheet(resumenEstado);

    XLSX.utils.sheet_add_json(ws, detalle, {
        origin: `A${resumenEstado.length + 1}`,
    });

    ws["!cols"] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 20 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 14 },
        { wch: 18 },
    ];

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
        "Reporte_Conciliaciones_GCB.xlsx"
    );
};

export const exportToPDF = (data) => {
    const dataOrdenada = ordenarPorFecha(data);

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const azul = [3, 31, 71];
    const verde = [22, 163, 74];
    const rojo = [220, 38, 38];
    const naranja = [234, 88, 12];
    const grisTexto = [51, 65, 85];
    const grisBorde = [226, 232, 240];
    const azulClaro = [230, 242, 255];

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

    // HEADER
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

    // TÍTULO CENTRADO
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(
        "REPORTE DE CONCILIACIONES",
        pageWidth / 2,
        13,
        { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
        "Conciliación de Cuentas Bancarias",
        pageWidth / 2,
        21,
        { align: "center" }
    );

    // FECHA A LA DERECHA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Fecha de emisión", pageWidth - 45, 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
        new Date().toLocaleString("es-GT"),
        pageWidth - 45,
        18
    );

    doc.setFillColor(...verde);
    doc.rect(0, 32, pageWidth, 1.5, "F");

    // RESUMEN GENERAL
    const totalSaldoBanco = dataOrdenada.reduce((sum, item) => sum + getSaldoBanco(item), 0);
    const totalSaldoLibros = dataOrdenada.reduce((sum, item) => sum + getSaldoLibros(item), 0);
    const totalDiferencia = dataOrdenada.reduce((sum, item) => sum + getDiferencia(item), 0);
    const totalConciliados = dataOrdenada.reduce((sum, item) => sum + getTotalConciliados(item), 0);

    drawKpiCard(7, 40, 48, 38, "SALDO BANCO", formatMoney(totalSaldoBanco), [2, 132, 199]);
    drawKpiCard(60, 40, 48, 38, "SALDO LIBROS", formatMoney(totalSaldoLibros), verde);
    drawKpiCard(113, 40, 48, 38, "DIFERENCIA", formatMoney(totalDiferencia), totalDiferencia !== 0 ? rojo : [34, 197, 94]);
    drawKpiCard(166, 40, 43, 38, "CONCILIADOS", totalConciliados, naranja);

    // TÍTULO TABLA
    doc.setDrawColor(...grisBorde);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(7, 85, pageWidth - 14, 8, 2, 2, "FD");

    doc.setTextColor(...azul);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DETALLE DE CONCILIACIONES", 10, 91);

    const rows = dataOrdenada.map((item) => [
        getNumeroCuenta(item),
        getBanco(item),
        getPeriodo(item),
        Number(getSaldoBanco(item)).toLocaleString("es-GT", { minimumFractionDigits: 2 }),
        Number(getSaldoLibros(item)).toLocaleString("es-GT", { minimumFractionDigits: 2 }),
        Number(getDiferencia(item)).toLocaleString("es-GT", { minimumFractionDigits: 2 }),
        getEstado(item),
        String(getTotalConciliados(item)),
        String(getTotalPendientesBanco(item)),
        String(getTotalPendientesLibros(item)),
        String(getTotalEnTransito(item)),
        String(getTotalDiferencias(item)),
        formatDate(getFechaConciliacion(item)),
    ]);

    autoTable(doc, {
        startY: 95,
        head: [[
            "CUENTA",
            "BANCO",
            "PERÍODO",
            "SALDO BANCO",
            "SALDO LIBROS",
            "DIFERENCIA",
            "ESTADO",
            "CONC.",
            "PEND. BANCO",
            "PEND. LIBROS",
            "TRÁNSITO",
            "DIFEREN.",
            "FECHA",
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
            0: { cellWidth: 20, halign: "center" },
            1: { cellWidth: 22, halign: "center" },
            2: { cellWidth: 14, halign: "center" },
            3: { cellWidth: 18, halign: "right", fontStyle: "bold" },
            4: { cellWidth: 18, halign: "right", fontStyle: "bold" },
            5: { cellWidth: 18, halign: "right" },
            6: { cellWidth: 14, halign: "center" },
            7: { cellWidth: 12, halign: "center" },
            8: { cellWidth: 14, halign: "center" },
            9: { cellWidth: 14, halign: "center" },
            10: { cellWidth: 12, halign: "center" },
            11: { cellWidth: 14, halign: "center" },
            12: { cellWidth: 16, halign: "center" },
        },
        didParseCell: (cell) => {
            // Colorear estado
            if (cell.section === "body" && cell.column.index === 6) {
                const estado = String(cell.cell.raw).toLowerCase();

                if (estado.includes("conciliado")) {
                    cell.cell.styles.textColor = verde;
                    cell.cell.styles.fillColor = [240, 253, 244];
                }

                if (estado.includes("pendiente")) {
                    cell.cell.styles.textColor = naranja;
                    cell.cell.styles.fillColor = [254, 243, 235];
                }

                if (estado.includes("diferencia")) {
                    cell.cell.styles.textColor = rojo;
                    cell.cell.styles.fillColor = [254, 242, 242];
                }
            }

            // Colorear diferencia (rojo si no es 0)
            if (cell.section === "body" && cell.column.index === 5 && cell.cell.raw !== "0.00") {
                cell.cell.styles.textColor = rojo;
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
        "Los montos mostrados incluyen los saldos bancarios y los saldos de libros para cada período de conciliación.",
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
    doc.text(
        `Página 1 de ${doc.internal.getNumberOfPages()}`,
        pageWidth - 42,
        finalY + 15
    );

    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(...azul);
        doc.rect(0, pageHeight - 4, pageWidth, 4, "F");
    }

    doc.save("Reporte_Conciliaciones_GCB.pdf");
};