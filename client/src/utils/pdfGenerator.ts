import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ComprobanteData {
  id_comprobante: number;
  tipo_comprobante: 'boleta' | 'factura';
  fecha_emision: string;
  monto_total: number;
  cliente: {
    tipo?: 'persona' | 'empresa';
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    razon_social?: string;
    dni?: string;
    ruc?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
  empleado: {
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    cargo?: string;
  };
  orden: {
    id_orden?: number;
    fecha_hora?: string;
    numero_mesa?: number;
  };
  detalles: Array<{
    nombre_producto?: string;
    cantidad?: number;
    precio_unitario?: number;
    sub_total?: number;
  }>;
  pago: {
    tipo_pago?: string;
    fecha_pago?: string | null;
    detalle?: any;
  };
}

const safeNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const safeString = (v: any, fallback = '') => (v === null || v === undefined ? fallback : String(v));

export const generarComprobantePDF = (data: ComprobanteData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RESTAURANTE Ven A Mascar', pageWidth / 2, yPos, { align: 'center' });

    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RUC: 67676767670', pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;
    doc.text('Av. Los Ohño 000, Villa el Salvador, Lima', pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;
    doc.text('Tel: Del 1 al 9 | Email: contacto@venamascar.com.pe', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    const isFactura = data.tipo_comprobante === 'factura';
    doc.setFillColor(isFactura ? 220 : 240, isFactura ? 240 : 220, 220);
    doc.rect(14, yPos, pageWidth - 28, 12, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(
      safeString(data.tipo_comprobante).toUpperCase(),
      pageWidth / 2,
      yPos + 8,
      { align: 'center' }
    );

    yPos += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const infoCol1X = 14;
    const infoCol2X = pageWidth / 2 + 5;

    doc.setFont('helvetica', 'bold');
    doc.text('N° Comprobante:', infoCol1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${String(safeNumber(data.id_comprobante, 0)).padStart(8, '0')}`, infoCol1X + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha Emisión:', infoCol2X, yPos);
    doc.setFont('helvetica', 'normal');
    const fechaEmisionStr = data.fecha_emision ? new Date(data.fecha_emision).toLocaleDateString('es-PE') : '-';
    doc.text(fechaEmisionStr, infoCol2X + 30, yPos);

    yPos += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('N° Orden:', infoCol1X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${safeNumber(data.orden?.id_orden, 0)}`, infoCol1X + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Mesa N°:', infoCol2X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${safeNumber(data.orden?.numero_mesa, 0)}`, infoCol2X + 30, yPos);

    yPos += 10;

    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE', 16, yPos + 5);

    yPos += 10;
    doc.setFont('helvetica', 'normal');

    const clienteTipo = safeString(data.cliente?.tipo, 'persona');
    if (clienteTipo === 'persona') {
      const nombreCompleto = `${safeString(data.cliente?.nombre)} ${safeString(data.cliente?.apellido_paterno)} ${safeString(data.cliente?.apellido_materno)}`.trim();
      doc.text(`Nombre: ${nombreCompleto || '-'}`, infoCol1X, yPos);
      if (data.cliente?.dni) {
        doc.text(`DNI: ${safeString(data.cliente.dni)}`, infoCol2X, yPos);
      }
    } else {
      doc.text(`Razón Social: ${safeString(data.cliente?.razon_social, 'N/A')}`, infoCol1X, yPos);
      if (data.cliente?.ruc) {
        doc.text(`RUC: ${safeString(data.cliente.ruc)}`, infoCol2X, yPos);
      }
    }

    yPos += 6;

    if (data.cliente?.direccion) {
      doc.text(`Dirección: ${safeString(data.cliente.direccion)}`, infoCol1X, yPos);
      yPos += 6;
    }

    if (data.cliente?.telefono || data.cliente?.email) {
      if (data.cliente?.telefono) {
        doc.text(`Teléfono: ${safeString(data.cliente.telefono)}`, infoCol1X, yPos);
      }
      if (data.cliente?.email) {
        doc.text(`Email: ${safeString(data.cliente.email)}`, infoCol2X, yPos);
      }
      yPos += 6;
    }

    yPos += 5;

    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('ATENDIDO POR', 16, yPos + 5);

    yPos += 10;
    doc.setFont('helvetica', 'normal');

    const nombreEmpleado = `${safeString(data.empleado?.nombre)} ${safeString(data.empleado?.apellido_paterno)} ${safeString(data.empleado?.apellido_materno)}`.trim() || '-';
    doc.text(`Empleado: ${nombreEmpleado}`, infoCol1X, yPos);
    if (data.empleado?.cargo) {
      doc.text(`Cargo: ${safeString(data.empleado.cargo)}`, infoCol2X, yPos);
    }

    yPos += 10;

    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE PRODUCTOS', 16, yPos + 5);

    yPos += 10;

    const detallesArr = Array.isArray(data.detalles) ? data.detalles : [];
    const tableData = detallesArr.map(detalle => {
      const nombre = safeString(detalle.nombre_producto, 'Producto');
      const cantidad = safeNumber(detalle.cantidad, 0);
      const precio = safeNumber(detalle.precio_unitario, 0);
      const subtotal = safeNumber(detalle.sub_total, cantidad * precio);
      return [
        nombre,
        String(cantidad),
        `S/ ${precio.toFixed(2)}`,
        `S/ ${subtotal.toFixed(2)}`
      ];
    });

    try {
      autoTable(doc, {
        startY: yPos,
        head: [['Producto', 'Cant.', 'P. Unit.', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [100, 100, 100],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'right', cellWidth: 30 },
          3: { halign: 'right', cellWidth: 35 }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        }
      });
    } catch (err) {
      console.error('autoTable error:', err);
      let yy = yPos;
      doc.setFontSize(9);
      for (const row of tableData) {
        doc.text(row[0] as string, 16, yy);
        doc.text(row[1] as string, 110, yy, { align: 'center' });
        doc.text(row[2] as string, pageWidth - 80, yy, { align: 'right' });
        doc.text(row[3] as string, pageWidth - 16, yy, { align: 'right' });
        yy += 6;
      }
      yPos = yy + 6;
    }

    const lastAuto = (doc as any).lastAutoTable;
    if (lastAuto && lastAuto.finalY) {
      yPos = lastAuto.finalY + 10;
    } else {
      yPos += 10;
    }

    const totalesX = pageWidth - 60;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    doc.setDrawColor(200, 200, 200);
    doc.line(totalesX - 10, yPos, pageWidth - 14, yPos);
    yPos += 7;

    const monto = safeNumber(data.monto_total, detallesArr.reduce((s, d) => s + safeNumber(d?.sub_total, 0), 0));
    doc.text('TOTAL:', totalesX, yPos);
    doc.text(`S/ ${monto.toFixed(2)}`, pageWidth - 16, yPos, { align: 'right' });

    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Método de pago: ${safeString(data.pago?.tipo_pago).toUpperCase()}`, 14, yPos);
    const fechaPagoText = data.pago?.fecha_pago ? safeString(data.pago.fecha_pago) : '-';
    doc.text(`Fecha de pago: ${fechaPagoText}`, 14, yPos + 5);

    yPos += 15;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Gracias por su preferencia', pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;
    doc.text('¡Vuelva pronto!', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Documento generado electrónicamente el ${new Date().toLocaleString('es-PE')}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );

    const nombreArchivo = `${safeString(data.tipo_comprobante)}_${String(safeNumber(data.id_comprobante)).padStart(8, '0')}.pdf`;
    doc.save(nombreArchivo);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};