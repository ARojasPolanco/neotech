import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export class PdfService {
  async generateReceipt(order) {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]); // A4
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    const drawLine = (text, opts = {}) => {
      const f = opts.bold ? fontBold : font;
      const size = opts.size || 12;
      page.drawText(text, {
        x: opts.x || 50,
        y,
        size,
        font: f,
        color: opts.color || rgb(0.07, 0.07, 0.07),
      });
      y -= size + (opts.gap || 6);
    };

    drawLine("Neo Tech — Recibo de Compra", { bold: true, size: 20 });
    y -= 10;

    drawLine(`Pedido: ${order.orderNumber}`, { bold: true, size: 14 });
    drawLine(
      `Fecha: ${new Date(order.createdAt).toLocaleDateString("es-AR")}`,
    );
    drawLine(`Cliente: ${order.customerName}`);
    drawLine(`Email: ${order.customerEmail}`);
    y -= 10;

    drawLine("Productos:", { bold: true, size: 11 });
    drawLine(`Producto                             Cant  Precio  Subtotal`, {
      size: 9,
      color: rgb(0.4, 0.4, 0.4),
    });

    for (const item of order.OrderItems) {
      const name = `${item.productName}${item.color ? ` (${item.color})` : ""}`;
      drawLine(
        `${name.slice(0, 35).padEnd(37)} ${String(item.quantity).padStart(3)}  $${Number(item.unitPrice).toLocaleString("es-AR").padStart(7)}  $${Number(item.subtotal).toLocaleString("es-AR").padStart(8)}`,
        { size: 10 },
      );
    }

    y -= 10;
    drawLine(
      `Total: $${Number(order.total).toLocaleString("es-AR")}`,
      { bold: true, size: 16 },
    );

    y -= 30;
    drawLine("Gracias por tu compra.", {
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });
    drawLine("Neo Tech — Tecnología al alcance de todos.", {
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });

    return await doc.save();
  }
}
