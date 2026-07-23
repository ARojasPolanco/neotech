import { Resend } from "resend";
import { envs } from "../config/enviroments/enviroments.js";

const resend = new Resend(envs.RESEND_API_KEY);

const FROM_EMAIL = "Neo Tech <onboarding@resend.dev>";

export class MailService {
  async sendOwnerAlert(order) {
    console.log(`[MailService] preparing owner alert for ${order.orderNumber} to ${envs.OWNER_EMAIL}`);
    const items = order.OrderItems.map(
      (item) =>
        `- ${item.productName}${item.color ? ` (${item.color})` : ""} x${item.quantity} = $${Number(item.subtotal).toLocaleString("es-AR")}`,
    ).join("\n");

    const text = [
      `Nuevo pedido: ${order.orderNumber}`,
      `Cliente: ${order.customerName}`,
      ``,
      `Productos:`,
      items,
      ``,
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

    console.log(`[MailService] owner alert response for ${order.orderNumber}:`, JSON.stringify(result));
    return result;
  }

  async sendReceipt(order, pdfBuffer) {
    console.log(`[MailService] preparing receipt for ${order.orderNumber} to ${order.customerEmail}`);
    const items = order.OrderItems.map(
      (item) =>
        `- ${item.productName}${item.color ? ` (${item.color})` : ""} x${item.quantity}: $${Number(item.subtotal).toLocaleString("es-AR")}`,
    ).join("\n");

    const text = [
      `Gracias por tu compra en Neo Tech!`,
      ``,
      `Pedido: ${order.orderNumber}`,
      `Fecha: ${new Date(order.createdAt).toLocaleDateString("es-AR")}`,
      ``,
      `Resumen:`,
      items,
      ``,
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
          content: pdfBuffer,
        },
      ],
    });

    console.log(`[MailService] receipt response for ${order.orderNumber}:`, JSON.stringify(result));
    return result;
  }
}