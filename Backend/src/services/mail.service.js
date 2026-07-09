import transporter from "../config/mailer.js";
import { envs } from "../config/enviroments/enviroments.js";

export class MailService {
  async sendOwnerAlert(order) {
    console.log(`[MailService] preparing owner alert for ${order.orderNumber} to ${envs.OWNER_EMAIL}`);
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

    const result = await transporter.sendMail({
      from: `"Neo Tech" <${envs.MAIL_FROM}>`,
      to: envs.OWNER_EMAIL,
      subject: `🛒 Nuevo pedido ${order.orderNumber} - ${order.customerName}`,
      text,
    });

    console.log(`[MailService] owner alert sent for ${order.orderNumber}: ${result.messageId}`);
    return result;
  }

  async sendReceipt(order, pdfBuffer) {
    console.log(`[MailService] preparing receipt for ${order.orderNumber} to ${order.customerEmail}`);
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

    const result = await transporter.sendMail({
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

    console.log(`[MailService] receipt sent for ${order.orderNumber}: ${result.messageId}`);
    return result;
  }

  async sendTestEmail(to) {
    console.log(`[MailService] sending test email to ${to}`);
    const result = await transporter.sendMail({
      from: `"Neo Tech" <${envs.MAIL_FROM}>`,
      to,
      subject: "Test de conexión SMTP - Neo Tech",
      text: "Si recibís este mail, la configuración SMTP de Neo Tech funciona correctamente.",
      html: "<p>Si recibís este mail, la configuración SMTP de Neo Tech funciona correctamente.</p>",
    });

    console.log(`[MailService] test email sent to ${to}: ${result.messageId}`);
    return result;
  }
}
