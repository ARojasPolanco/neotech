import { Resend } from "resend";
import { envs } from "../config/enviroments/enviroments.js";

const resend = new Resend(envs.RESEND_API_KEY);

const FROM_EMAIL = "Neo Tech <ventas@neotechbb.shop>";

function checkResult(result, context) {
  if (result.error) {
    console.error(`[MailService] ${context} failed:`, JSON.stringify(result.error));
    throw new Error(`Mail failed: ${result.error.message}`);
  }
  return result;
}

export class MailService {
  async sendOwnerAlert(order) {
    console.log(`[MailService] preparing owner alert for ${order.orderNumber} to ${envs.OWNER_EMAIL}`);
    const items = order.OrderItems.map(
      (item) =>
        `- ${item.productName}${item.color ? ` (${item.color})` : ""} x${item.quantity} = $${Number(item.subtotal).toLocaleString("es-AR")}`,
    ).join("\n");

    const subtotal = Number(
      order.subtotal ??
        order.OrderItems.reduce((sum, item) => sum + Number(item.subtotal), 0),
    );
    const discountAmount = Number(order.discountAmount || 0);
    const discountLine =
      discountAmount > 0
        ? `Descuento${order.discountCode ? ` (${order.discountCode} -${Number(order.discountPercent)}%)` : ""}: -$${discountAmount.toLocaleString("es-AR")}`
        : null;

    const text = [
      `Nuevo pedido: ${order.orderNumber}`,
      `Cliente: ${order.customerName}`,
      ``,
      `Productos:`,
      items,
      ``,
      ...(discountAmount > 0 ? [`Subtotal: $${subtotal.toLocaleString("es-AR")}`] : []),
      ...(discountLine ? [discountLine] : []),
      `Total: $${Number(order.total).toLocaleString("es-AR")}`,
      ``,
      `Contacto: ${order.customerEmail} / ${order.customerPhone}`,
    ].join("\n");

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: envs.OWNER_EMAIL,
      subject: `Nuevo pedido ${order.orderNumber} - ${order.customerName}`,
      text,
    });

    checkResult(result, `owner alert ${order.orderNumber}`);
    console.log(`[MailService] owner alert sent for ${order.orderNumber}: ${result.data?.id}`);
    return result;
  }

  async sendReceipt(order, pdfBuffer) {
    console.log(`[MailService] preparing receipt for ${order.orderNumber} to ${order.customerEmail}`);
    const items = order.OrderItems.map(
      (item) =>
        `- ${item.productName}${item.color ? ` (${item.color})` : ""} x${item.quantity}: $${Number(item.subtotal).toLocaleString("es-AR")}`,
    ).join("\n");

    const subtotal = Number(
      order.subtotal ??
        order.OrderItems.reduce((sum, item) => sum + Number(item.subtotal), 0),
    );
    const discountAmount = Number(order.discountAmount || 0);
    const discountLine =
      discountAmount > 0
        ? `Descuento${order.discountCode ? ` (${order.discountCode} -${Number(order.discountPercent)}%)` : ""}: -$${discountAmount.toLocaleString("es-AR")}`
        : null;

    const text = [
      `Gracias por tu compra en Neo Tech!`,
      ``,
      `Pedido: ${order.orderNumber}`,
      `Fecha: ${new Date(order.createdAt).toLocaleDateString("es-AR")}`,
      ``,
      `Resumen:`,
      items,
      ``,
      ...(discountAmount > 0 ? [`Subtotal: $${subtotal.toLocaleString("es-AR")}`] : []),
      ...(discountLine ? [discountLine] : []),
      `Total: $${Number(order.total).toLocaleString("es-AR")}`,
      ``,
      `Adjuntamos el recibo en PDF.`,
      `Si tenes dudas, respondi este mail.`,
    ].join("\n");

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject: `Tu pedido Neo Tech ${order.orderNumber} fue confirmado`,
      text,
      attachments: [
        {
          filename: `recibo-${order.orderNumber}.pdf`,
          content: Buffer.from(pdfBuffer).toString("base64"),
        },
      ],
    });

    checkResult(result, `receipt ${order.orderNumber}`);
    console.log(`[MailService] receipt sent for ${order.orderNumber}: ${result.data?.id}`);
    return result;
  }
}