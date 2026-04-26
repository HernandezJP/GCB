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

export const exportToExcel = (data) => {
    const formatted = data.map((item) => ({
        "No. Cuenta": item.cuB_Numero_Cuenta,
        Banco: item.banco,
        Titular: item.titular,
        "Tipo de Cuenta": item.tipoCuenta,
        Moneda: item.tipoMoneda,
        "Saldo Inicial": formatMoney(item.cuB_Saldo_Inicial),
        "Saldo Actual": formatMoney(item.cuB_Saldo_Actual),
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
    });

    doc.setFontSize(14);
    doc.text("Reporte de Cuentas Bancarias", 14, 15);

    const rows = data.map((item) => [
        item.cuB_Numero_Cuenta,
        item.banco,
        item.titular,
        item.tipoCuenta,
        item.tipoMoneda,
        `Q ${formatMoney(item.cuB_Saldo_Inicial)}`,
        `Q ${formatMoney(item.cuB_Saldo_Actual)}`,
        item.estadoCuenta,
        getRegistroTexto(item.cuB_Estado),
    ]);

    autoTable(doc, {
        startY: 22,
        head: [[
            "No. Cuenta",
            "Banco",
            "Titular",
            "Tipo",
            "Moneda",
            "Saldo Inicial",
            "Saldo Actual",
            "Estado Cuenta",
            "Registro",
        ]],
        body: rows,
        styles: {
            fontSize: 8,
        },
        headStyles: {
            fontStyle: "bold",
        },
    });

    doc.save("Reporte_Cuentas_Bancarias.pdf");
};