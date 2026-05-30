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

const getSimboloMoneda = (item) => {
    const moneda = String(
        getValue(item, [
            "tmO_Descripcion",
            "tMO_Descripcion",
            "TMO_Descripcion",
            "tmo_descripcion",
            "moneda",
            "Moneda",
        ])
    ).toLowerCase();

    if (moneda.includes("dólar") || moneda.includes("dolar") || moneda.includes("usd")) return "$";
    return "Q";
};

const formatMoney = (value, item = {}) =>
    `${getSimboloMoneda(item)} ${Number(value ?? 0).toLocaleString("es-GT", {
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
    Number(
        getValue(item, [
            "moV_Monto",
            "mOV_Monto",
            "mov_monto",
        ]) || 0
    );

const getRecargo = (item) =>
    Number(
        getValue(item, [
            "moV_Recargo",
            "mOV_Recargo",
            "mov_recargo",
        ]) || 0
    );

const getSaldo = (item) =>
    Number(
        getValue(item, [
            "moV_Saldo",
            "mOV_Saldo",
            "mov_saldo",
        ]) || 0
    );

const esIngreso = (item) =>
    String(getTipo(item))
        .trim()
        .toLowerCase()
        .includes("ingreso");

const ordenarPorFecha = (data) => {
    return [...data].sort((a, b) => {
        const fechaA = new Date(
            getValue(a, [
                "moV_Fecha",
                "mOV_Fecha",
                "mov_fecha",
            ])
        );

        const fechaB = new Date(
            getValue(b, [
                "moV_Fecha",
                "mOV_Fecha",
                "mov_fecha",
            ])
        );

        return fechaA - fechaB;
    });
};

const getCuentaInfo = (data) => {
    const item = data?.[0] || {};

    const primerNombre = getValue(item, [
        "cuB_Primer_Nombre",
        "cUB_Primer_Nombre",
        "cub_primer_nombre",
    ]);

    const segundoNombre = getValue(item, [
        "cuB_Segundo_Nombre",
        "cUB_Segundo_Nombre",
        "cub_segundo_nombre",
    ]);

    const primerApellido = getValue(item, [
        "cuB_Primer_Apellido",
        "cUB_Primer_Apellido",
        "cub_primer_apellido",
    ]);

    const segundoApellido = getValue(item, [
        "cuB_Segundo_Apellido",
        "cUB_Segundo_Apellido",
        "cub_segundo_apellido",
    ]);

    const nombreCompleto = [
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
    ]
        .filter(Boolean)
        .join(" ");

    return {
        numeroCuenta:
            getValue(item, [
                "cuB_Numero_Cuenta",
                "cUB_Numero_Cuenta",
                "cub_numero_cuenta",
            ]) || "—",

        banco:
            getValue(item, [
                "baN_Nombre",
                "bAN_Nombre",
                "ban_nombre",
            ]) || "—",

        tipoCuenta:
            getValue(item, [
                "tcU_Descripcion",
                "tCU_Descripcion",
                "tcu_descripcion",
            ]) || "—",

        moneda:
            getValue(item, [
                "tmO_Descripcion",
                "tMO_Descripcion",
                "tmo_descripcion",
            ]) || "—",

        persona: nombreCompleto || "—",
    };
};

const getPeriodo = (data) => {
    const fechas = data
        .map((x) =>
            new Date(
                getValue(x, [
                    "moV_Fecha",
                    "mOV_Fecha",
                    "mov_fecha",
                ])
            )
        )
        .filter((x) => !Number.isNaN(x.getTime()));

    return {
        fechaInicio: fechas.length
            ? new Date(
                Math.min(...fechas)
            ).toLocaleDateString("es-GT")
            : "—",

        fechaFin: fechas.length
            ? new Date(
                Math.max(...fechas)
            ).toLocaleDateString("es-GT")
            : "—",
    };
};

export const exportToExcel = (
    data,
    resumen = {}
) => {
    const dataOrdenada = ordenarPorFecha(data);

    const cuenta = getCuentaInfo(dataOrdenada);

    const periodo = getPeriodo(dataOrdenada);

    const resumenEstado = [
        ["ESTADO DE CUENTA BANCARIA"],
        [],
        ["Banco", cuenta.banco],
        ["Número de cuenta", cuenta.numeroCuenta],
        ["Tipo de cuenta", cuenta.tipoCuenta],
        ["Moneda", cuenta.moneda],
        ["Titular", cuenta.persona],
        [
            "Periodo",
            `${periodo.fechaInicio} al ${periodo.fechaFin}`,
        ],
        [
            "Generado",
            new Date().toLocaleDateString("es-GT"),
        ],
        [],
        ["RESUMEN FINANCIERO"],
        [
            "Saldo inicial",
            formatMoney(resumen.saldoInicial, dataOrdenada[0]),
        ],
        [
            "Total créditos",
            formatMoney(resumen.totalCreditos, dataOrdenada[0]),
        ],
        [
            "Total débitos",
            formatMoney(resumen.totalDebitos, dataOrdenada[0]),
        ],
        [
            "Total recargos",
            formatMoney(resumen.totalRecargos, dataOrdenada[0]),
        ],
        [
            "Saldo final",
            formatMoney(resumen.saldoFinal, dataOrdenada[0]),
        ],
        [
            "Total movimientos",
            resumen.totalMovimientos ??
            dataOrdenada.length,
        ],
        [],
    ];

    const detalle = dataOrdenada.map(
        (item, index) => {
            const monto = getMonto(item);

            const credito = esIngreso(item)
                ? monto
                : 0;

            const debito = esIngreso(item)
                ? 0
                : monto;

            return {
                "#": index + 1,

                Fecha: formatDate(
                    getValue(item, [
                        "moV_Fecha",
                        "mOV_Fecha",
                        "mov_fecha",
                    ])
                ),

                Tipo: getTipo(item),

                Medio: getMedio(item),

                Descripción: getValue(item, [
                    "moV_Descripcion",
                    "mOV_Descripcion",
                    "mov_descripcion",
                ]),

                Referencia: getValue(item, [
                    "moV_Numero_Referencia",
                    "mOV_Numero_Referencia",
                    "mov_numero_referencia",
                ]),

                Débito:
                    debito > 0
                        ? formatMoney(debito, item)
                        : "",

                Crédito:
                    credito > 0
                        ? formatMoney(credito, item)
                        : "",

                Recargo:
                    getRecargo(item) > 0
                        ? formatMoney(getRecargo(item), item)
                        : "",

                Saldo: formatMoney(getSaldo(item), item),

                Estado: getEstado(item),
            };
        }
    );

    const ws = XLSX.utils.aoa_to_sheet(
        resumenEstado
    );

    XLSX.utils.sheet_add_json(ws, detalle, {
        origin: `A${resumenEstado.length + 1}`,
    });

    ws["!cols"] = [
        { wch: 6 },
        { wch: 16 },
        { wch: 18 },
        { wch: 18 },
        { wch: 38 },
        { wch: 24 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
    ];

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Estado de Cuenta"
    );

    const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
    });

    saveAs(
        new Blob([buffer], {
            type: "application/octet-stream",
        }),
        "Estado_Cuenta_Bancaria_GCB.xlsx"
    );
};

export const exportToCsvConciliacion = (data) => {
    const dataOrdenada = ordenarPorFecha(data);

    const headers = [
        "#",
        "Fecha",
        "Tipo",
        "Medio",
        "Descripcion",
        "Referencia",
        "Debito",
        "Credito",
        "Recargo",
        "Saldo",
        "Estado",
    ];

    const rows = dataOrdenada.map((item, index) => {
        const monto = getMonto(item);
        const credito = esIngreso(item) ? monto : 0;
        const debito = esIngreso(item) ? 0 : monto;

        return [
            index + 1,
            formatDate(
                getValue(item, [
                    "moV_Fecha",
                    "mOV_Fecha",
                    "mov_fecha",
                ])
            ),
            getTipo(item),
            getMedio(item),
            getValue(item, [
                "moV_Descripcion",
                "mOV_Descripcion",
                "mov_descripcion",
            ]),
            getValue(item, [
                "moV_Numero_Referencia",
                "mOV_Numero_Referencia",
                "mov_numero_referencia",
            ]),

            debito > 0
                ? Number(debito).toFixed(2)
                : "",

            credito > 0
                ? Number(credito).toFixed(2)
                : "",

            getRecargo(item) > 0
                ? Number(getRecargo(item)).toFixed(2)
                : "",

            Number(getSaldo(item)).toFixed(2),

            getEstado(item),
        ];
    });

    const escapeCsv = (value) => {
        const text = String(value ?? "");

        if (
            text.includes(",") ||
            text.includes('"') ||
            text.includes("\n")
        ) {
            return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
    };

    const csvContent = [
        headers.join(","),
        ...rows.map(row =>
            row.map(escapeCsv).join(",")
        ),
    ].join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        {
            type: "text/csv;charset=utf-8;",
        }
    );

    saveAs(
        blob,
        "Estado_Cuenta_Bancaria_GCB_conciliacion.csv"
    );
};

export const exportToPDF = (data, resumen = {}) => {
    const dataOrdenada = ordenarPorFecha(data);
    const cuenta = getCuentaInfo(dataOrdenada);
    const periodo = getPeriodo(dataOrdenada);

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const azul = [3, 31, 71];
    const verde = [22, 163, 74];
    const rojo = [220, 38, 38];
    const morado = [91, 33, 182];
    const grisTexto = [51, 65, 85];
    const grisBorde = [226, 232, 240];
    const azulClaro = [230, 242, 255];

    const primerItem = dataOrdenada[0] ?? {};
    const money = (value) => formatMoney(value, primerItem);

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
        "REPORTE DE MOVIMIENTOS",
        pageWidth / 2,
        13,
        { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
        "Estado de Cuenta Bancaria",
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

    // INFO CUENTA
    doc.setDrawColor(...grisBorde);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(7, 40, pageWidth - 14, 62, 3, 3, "FD");

    doc.setTextColor(...azul);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("INFORMACIÓN DE LA CUENTA", 12, 52);

    doc.setFontSize(8);
    doc.setTextColor(...grisTexto);

    let yInfo = 64;

    const infoRows = [
        ["Titular de la cuenta", cuenta.persona],
        ["Número de cuenta", cuenta.numeroCuenta],
        ["Banco", cuenta.banco],
        ["Tipo de cuenta", cuenta.tipoCuenta],
        ["Moneda", cuenta.moneda],
        ["Estado de la cuenta", "Activa"],
    ];

    infoRows.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 12, yInfo);
        doc.text(":", 49, yInfo);

        doc.setFont("helvetica", "normal");
        doc.text(String(value ?? "—"), 56, yInfo);

        yInfo += 6;
    });

    // Banco centrado, sin símbolos raros
    doc.setDrawColor(...grisBorde);
    doc.line(101, 54, 101, 92);

    doc.setTextColor(...azul);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(String(cuenta.banco || "Banco"), 126, 70, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text("Siempre de tu lado", 126, 81, { align: "center" });

    doc.setDrawColor(...grisBorde);
    doc.line(151, 54, 151, 92);

    // Periodo
    doc.setTextColor(...azul);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("PERÍODO DEL REPORTE", 166, 52);

    doc.setFontSize(8);
    doc.setTextColor(...grisTexto);

    doc.setFont("helvetica", "bold");
    doc.text("Fecha inicial", 158, 66);
    doc.text("Fecha final", 158, 74);
    doc.text("Días del período", 158, 88);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${periodo.fechaInicio}`, 188, 66);
    doc.text(`: ${periodo.fechaFin}`, 188, 74);
    doc.text(`: ${dataOrdenada.length} movimientos`, 188, 88);

    doc.setDrawColor(203, 213, 225);
    doc.line(158, 80, 205, 80);

    // KPI CARDS sin círculos
    drawKpiCard(7, 110, 47, 38, "SALDO INICIAL", money(resumen.saldoInicial), [2, 132, 199]);
    drawKpiCard(60, 110, 47, 38, "TOTAL INGRESOS", money(resumen.totalCreditos), verde);
    drawKpiCard(113, 110, 47, 38, "TOTAL EGRESOS", money(resumen.totalDebitos), rojo);
    drawKpiCard(166, 110, 43, 38, "SALDO FINAL", money(resumen.saldoFinal), morado);

    // TÍTULO TABLA
    doc.setDrawColor(...grisBorde);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(7, 158, pageWidth - 14, 8, 2, 2, "FD");

    doc.setTextColor(...azul);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DETALLE DE MOVIMIENTOS", 10, 164);

    const rows = dataOrdenada.map((item) => {
        const monto = getMonto(item);
        const credito = esIngreso(item) ? monto : 0;
        const debito = esIngreso(item) ? 0 : monto;

        const referencia =
            getValue(item, [
                "moV_Numero_Referencia",
                "mOV_Numero_Referencia",
                "mov_numero_referencia",
            ]) || "—";

        const descripcion =
            getValue(item, [
                "moV_Descripcion",
                "mOV_Descripcion",
                "mov_descripcion",
            ]) || getMedio(item) || "—";

        return [
            formatDate(getValue(item, ["moV_Fecha", "mOV_Fecha", "mov_fecha"])),
            referencia,
            descripcion,
            esIngreso(item) ? "Ingreso" : "Egreso",
            debito > 0
                ? Number(debito).toLocaleString("es-GT", { minimumFractionDigits: 2 })
                : "—",
            credito > 0
                ? Number(credito).toLocaleString("es-GT", { minimumFractionDigits: 2 })
                : "—",
            Number(getSaldo(item)).toLocaleString("es-GT", { minimumFractionDigits: 2 }),
        ];
    });

    autoTable(doc, {
        startY: 168,
        head: [[
            "FECHA",
            "REFERENCIA",
            "DESCRIPCIÓN",
            "TIPO",
            "DÉBITO",
            "CRÉDITO",
            "SALDO",
        ]],
        body: rows,
        theme: "grid",
        margin: { left: 7, right: 7 },
        styles: {
            fontSize: 7.3,
            cellPadding: 2.4,
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
            0: { cellWidth: 23, halign: "center" },
            1: { cellWidth: 27, halign: "center" },
            2: { cellWidth: 46 },
            3: { cellWidth: 25, halign: "center", fontStyle: "bold" },
            4: { cellWidth: 27, halign: "right" },
            5: { cellWidth: 27, halign: "right" },
            6: { cellWidth: 27, halign: "right", fontStyle: "bold" },
        },
        didParseCell: (cell) => {
            if (cell.section === "body" && cell.column.index === 3) {
                const tipo = String(cell.cell.raw).toLowerCase();

                if (tipo.includes("ingreso")) {
                    cell.cell.styles.textColor = verde;
                    cell.cell.styles.fillColor = [240, 253, 244];
                }

                if (tipo.includes("egreso")) {
                    cell.cell.styles.textColor = rojo;
                    cell.cell.styles.fillColor = [254, 242, 242];
                }
            }

            if (cell.section === "body" && cell.column.index === 4 && cell.cell.raw !== "—") {
                cell.cell.styles.textColor = rojo;
                cell.cell.styles.fontStyle = "bold";
            }

            if (cell.section === "body" && cell.column.index === 5 && cell.cell.raw !== "—") {
                cell.cell.styles.textColor = verde;
                cell.cell.styles.fontStyle = "bold";
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
        "Los saldos mostrados corresponden al saldo después de cada movimiento.",
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

    doc.save("Estado_Cuenta_Bancaria_GCB.pdf");
};