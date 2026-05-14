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
            formatMoney(resumen.saldoInicial),
        ],
        [
            "Total créditos",
            formatMoney(resumen.totalCreditos),
        ],
        [
            "Total débitos",
            formatMoney(resumen.totalDebitos),
        ],
        [
            "Total recargos",
            formatMoney(resumen.totalRecargos),
        ],
        [
            "Saldo final",
            formatMoney(resumen.saldoFinal),
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
                        ? formatMoney(debito)
                        : "",

                Crédito:
                    credito > 0
                        ? formatMoney(credito)
                        : "",

                Recargo:
                    getRecargo(item) > 0
                        ? formatMoney(
                              getRecargo(item)
                          )
                        : "",

                Saldo: formatMoney(
                    getSaldo(item)
                ),

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

export const exportToPDF = (
    data,
    resumen = {}
) => {
    const dataOrdenada = ordenarPorFecha(data);

    const cuenta = getCuentaInfo(dataOrdenada);

    const periodo = getPeriodo(dataOrdenada);

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "letter",
    });

    const pageWidth =
        doc.internal.pageSize.getWidth();

    doc.setFillColor(224, 242, 254);

    doc.rect(0, 0, pageWidth, 36, "F");

    doc.setTextColor(2, 132, 199);

    doc.setFontSize(24);

    doc.setFont("helvetica", "bold");

    doc.text("GCB", 14, 18);

    doc.setTextColor(15, 23, 42);

    doc.setFontSize(17);

    doc.text(
        "Estado de Cuenta Bancaria",
        14,
        30
    );

    doc.setFontSize(10);

    doc.setFont("helvetica", "normal");

    doc.text(
        `Generado: ${new Date().toLocaleDateString(
            "es-GT"
        )}`,
        pageWidth - 65,
        18
    );

    doc.setFont("helvetica", "bold");

    doc.setFontSize(12);

    doc.text(
        "Información de la cuenta",
        14,
        48
    );

    doc.setFont("helvetica", "normal");

    doc.setFontSize(10);

    doc.text(
        `Banco: ${cuenta.banco}`,
        14,
        57
    );

    doc.text(
        `Número de cuenta: ${cuenta.numeroCuenta}`,
        14,
        64
    );

    doc.text(
        `Tipo de cuenta: ${cuenta.tipoCuenta}`,
        14,
        71
    );

    doc.text(
        `Moneda: ${cuenta.moneda}`,
        14,
        78
    );

    doc.text(
        `Titular: ${cuenta.persona}`,
        14,
        85
    );

    doc.text(
        `Periodo: ${periodo.fechaInicio} al ${periodo.fechaFin}`,
        14,
        92
    );

    doc.setFont("helvetica", "bold");

    doc.setFontSize(12);

    doc.text(
        "Resumen financiero",
        175,
        48
    );

    autoTable(doc, {
        startY: 52,

        margin: {
            left: 175,
            right: 14,
        },

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
            [
                "Saldo inicial",
                formatMoney(
                    resumen.saldoInicial
                ),
            ],

            [
                "Total créditos",
                formatMoney(
                    resumen.totalCreditos
                ),
            ],

            [
                "Total débitos",
                formatMoney(
                    resumen.totalDebitos
                ),
            ],

            [
                "Total recargos",
                formatMoney(
                    resumen.totalRecargos
                ),
            ],

            [
                "Saldo final",
                formatMoney(
                    resumen.saldoFinal
                ),
            ],

            [
                "Total movimientos",
                resumen.totalMovimientos ??
                    dataOrdenada.length,
            ],
        ],
    });

    doc.setFont("helvetica", "bold");

    doc.setFontSize(12);

    doc.text(
        "Detalle de movimientos",
        14,
        110
    );

    const rows = dataOrdenada.map(
        (item, index) => {
            const monto = getMonto(item);

            const credito = esIngreso(item)
                ? monto
                : 0;

            const debito = esIngreso(item)
                ? 0
                : monto;

            return [
                index + 1,

                formatDate(
                    getValue(item, [
                        "moV_Fecha",
                        "mOV_Fecha",
                        "mov_fecha",
                    ])
                ),

                getTipo(item) || "—",

                getMedio(item) || "—",

                getValue(item, [
                    "moV_Descripcion",
                    "mOV_Descripcion",
                    "mov_descripcion",
                ]) || "—",

                getValue(item, [
                    "moV_Numero_Referencia",
                    "mOV_Numero_Referencia",
                    "mov_numero_referencia",
                ]) || "—",

                debito > 0
                    ? formatMoney(debito)
                    : "—",

                credito > 0
                    ? formatMoney(credito)
                    : "—",

                getRecargo(item) > 0
                    ? formatMoney(
                          getRecargo(item)
                      )
                    : "—",

                formatMoney(
                    getSaldo(item)
                ),

                getEstado(item) || "—",
            ];
        }
    );

    autoTable(doc, {
        startY: 114,

        head: [[
            "#",
            "Fecha",
            "Tipo",
            "Medio",
            "Descripción",
            "Referencia",
            "Débito",
            "Crédito",
            "Recargo",
            "Saldo",
            "Estado",
        ]],

        body: rows,

        styles: {
            fontSize: 7.5,
            cellPadding: 2,
            overflow: "linebreak",
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
            0: {
                cellWidth: 10,
                halign: "center",
            },

            1: {
                cellWidth: 18,
            },

            2: {
                cellWidth: 20,
            },

            3: {
                cellWidth: 22,
            },

            4: {
                cellWidth: 45,
            },

            5: {
                cellWidth: 26,
            },

            6: {
                cellWidth: 22,
                halign: "right",
            },

            7: {
                cellWidth: 22,
                halign: "right",
            },

            8: {
                cellWidth: 22,
                halign: "right",
            },

            9: {
                cellWidth: 24,
                halign: "right",
            },

            10: {
                cellWidth: 18,
            },
        },
    });

    const pageCount =
        doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setFontSize(8);

        doc.setTextColor(100);

        doc.text(
            `Sistema GCB - Estado de Cuenta Bancaria | Página ${i} de ${pageCount}`,
            14,
            doc.internal.pageSize.getHeight() -
                10
        );
    }

    doc.save(
        "Estado_Cuenta_Bancaria_GCB.pdf"
    );
};