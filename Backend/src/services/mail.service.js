import transporter from "../config/mailer.js";
import { envs } from "../config/enviroments/enviroments.js";

export class MailService {
  async sendOwnerAlert(order) {
    const items = order.OrderItems.map(
      (item) =>
        `- ${item.productName}${item.color ? ` (${item.color})` : ""} x${item.quantity} = $${Number(item.subtotal).toLocaleString("es-AR")}`,
    ).join("\n");

    const text = [
      `🛒 Nuevo pedido: ${order.orderNumber}`,
      `Cliente: ${order.customerName}`,
      ``,
      `Productos:`,
      items,
      ``,
      `Total: $${Number(order.total).toLocaleString("es-AR")}`,
      ``,
      `Contacto: ${order.customerEmail} / ${order.customerPhone}`,
    ].join("\n");

    await transporter.sendMail({
      from: `"Neo Tech" <${envs.MAIL_FROM}>`,
      to: envs.OWNER_EMAIL,
      subject: `🛒 Nuevo pedido ${order.orderNumber} - ${order.customerName}`,
      text,
    });
  }

  async sendReceipt(order, pdfBuffer) {
    const items = order.OrderItems.map(
      (item) =>
        `- ${item.productName}${item.color ? ` (${item.color})` : ""} x${item.quantity}: $${Number(item.subtotal).toLocaleString("es-AR")}`,
    ).join("\n");

    const text = [
      `¡Gracias por tu compra en Neo Tech!`,
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
      `Si tenés dudas, respondé este mail.`,
    ].join("\n");

    await transporter.sendMail({
      from: `"Neo Tech" <${envs.MAIL_FROM}>`,
      to: order.customerEmail,
      subject: `Tu pedido Neo Tech ${order.orderNumber} fue confirmado`,
      text,
      attachments: [
        {
          filename: `recibo-${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  }
}
