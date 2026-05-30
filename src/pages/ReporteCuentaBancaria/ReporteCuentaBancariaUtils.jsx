import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatMoney = (value) => Number(value ?? 0).toFixed(2);

const getRegistroTexto = (estadoRegistro) => {
    if (estadoRegistro === "A") return "Activo";
    if (estadoRegistro === "I") return "Inactivo";
    return "No definido";
};

const getSimboloMoneda = (item) => {
    const moneda =
        item.tipoMoneda?.toLowerCase() ?? "";

    if (moneda.includes("dólar") || moneda.includes("dolar")) {
        return "$";
    }

    if (moneda.includes("quetzal")) {
        return "Q";
    }

    if (moneda.includes("euro")) {
        return "€";
    }

    return "Q";
};

export const exportToExcel = (data) => {
    const formatted = data.map((item) => ({
        "No. Cuenta": item.cuB_Numero_Cuenta,
        Banco: item.banco,
        Titular: item.titular,
        "Tipo de Cuenta": item.tipoCuenta,
        Moneda: item.tipoMoneda,
        "Saldo Inicial": `${getSimboloMoneda(item)} ${formatMoney(item.cuB_Saldo_Inicial)}`,
        "Saldo Actual": `${getSimboloMoneda(item)} ${formatMoney(item.cuB_Saldo_Actual)}`,
        "Estado Cuenta": item.estadoCuenta,
        "Estado Registro": getRegistroTexto(item.cuB_Estado),
        "Fecha Creación": item.cuB_Fecha_Creacion
            ? new Date(item.cuB_Fecha_Creacion).toLocaleDateString()
            : "",
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Cuentas Bancarias");

    const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
    });

    saveAs(
        new Blob([buffer], {
            type: "application/octet-stream",
        }),
        "Reporte_Cuentas_Bancarias.xlsx"
    );
};

export const exportToPDF = (data) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    const getSimboloMoneda = (item) => {
        const moneda = item.tipoMoneda?.toLowerCase() ?? "";

        if (moneda.includes("dólar") || moneda.includes("dolar")) return "$";
        if (moneda.includes("quetzal")) return "Q";
        if (moneda.includes("euro")) return "€";

        return "Q";
    };

    const money = (value, item) =>
        `${getSimboloMoneda(item)} ${Number(value ?? 0).toLocaleString("es-GT", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const fecha = new Date().toLocaleDateString("es-GT");

    // Encabezado elegante
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 297, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE CUENTAS BANCARIAS", 14, 14);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de generación: ${fecha}`, 14, 21);

    doc.setTextColor(148, 163, 184);
    doc.text("GCB BANK · Sistema de Gestión de Cuentas Bancarias", 210, 14);

    // Resumen
    const totalInicial = data.reduce(
        (acc, item) => acc + Number(item.cuB_Saldo_Inicial ?? 0),
        0
    );

    const totalActual = data.reduce(
        (acc, item) => acc + Number(item.cuB_Saldo_Actual ?? 0),
        0
    );

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 34, 269, 22, 3, 3, "F");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total de cuentas: ${data.length}`, 20, 43);

    doc.setTextColor(21, 128, 61);
    doc.text(
        `Saldo inicial total: ${Number(totalInicial).toLocaleString("es-GT", {
            minimumFractionDigits: 2,
        })}`,
        95,
        43
    );

    doc.setTextColor(217, 119, 6);
    doc.text(
        `Saldo actual total: ${Number(totalActual).toLocaleString("es-GT", {
            minimumFractionDigits: 2,
        })}`,
        180,
        43
    );

    const rows = data.map((item) => {
        const saldoInicial = Number(item.cuB_Saldo_Inicial ?? 0);
        const saldoActual = Number(item.cuB_Saldo_Actual ?? 0);
        const diferencia = saldoActual - saldoInicial;

        return [
            item.cuB_Numero_Cuenta,
            item.banco,
            item.titular,
            item.tipoCuenta,
            item.tipoMoneda,
            money(saldoInicial, item),
            money(saldoActual, item),
            diferencia >= 0
                ? `+ ${money(diferencia, item)}`
                : `- ${money(Math.abs(diferencia), item)}`,
            item.estadoCuenta,
            getRegistroTexto(item.cuB_Estado),
        ];
    });

    autoTable(doc, {
        startY: 65,
        head: [[
            "No. Cuenta",
            "Banco",
            "Titular",
            "Tipo",
            "Moneda",
            "Saldo Inicial",
            "Saldo Actual",
            "Variación",
            "Estado",
            "Registro",
        ]],
        body: rows,

        theme: "grid",

        styles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
        },

        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },

        columnStyles: {
            5: { halign: "right" },
            6: { halign: "right" },
            7: { halign: "right", fontStyle: "bold" },
            8: { halign: "center" },
            9: { halign: "center" },
        },

        didParseCell: function (dataCell) {
            if (dataCell.section === "body" && dataCell.column.index === 7) {
                const value = String(dataCell.cell.raw);

                if (value.startsWith("+")) {
                    dataCell.cell.styles.textColor = [21, 128, 61]; // verde entrada
                    dataCell.cell.styles.fillColor = [240, 253, 244];
                }

                if (value.startsWith("-")) {
                    dataCell.cell.styles.textColor = [185, 28, 28]; // rojo salida
                    dataCell.cell.styles.fillColor = [254, 242, 242];
                }
            }

            if (dataCell.section === "body" && dataCell.column.index === 8) {
                const estado = String(dataCell.cell.raw).toLowerCase();

                if (estado.includes("activa")) {
                    dataCell.cell.styles.textColor = [21, 128, 61];
                    dataCell.cell.styles.fontStyle = "bold";
                }

                if (estado.includes("inactiva") || estado.includes("bloqueada")) {
                    dataCell.cell.styles.textColor = [185, 28, 28];
                    dataCell.cell.styles.fontStyle = "bold";
                }
            }
        },

        didDrawPage: function () {
            const pageHeight = doc.internal.pageSize.height;

            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(
                "Reporte generado automáticamente por GCB BANK",
                14,
                pageHeight - 10
            );

            doc.text(
                `Página ${doc.internal.getNumberOfPages()}`,
                270,
                pageHeight - 10
            );
        },
    });

    doc.save("Reporte_Cuentas_Bancarias.pdf");
};