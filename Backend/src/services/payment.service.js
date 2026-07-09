import { client, Preference } from "../config/mercadopago.js";
import ProductVariant from "../models/productVariantModel.js";

export class PaymentService {
  async createPreference(order, frontendUrl) {
    const items = order.OrderItems.map((item) => ({
      title: item.color
        ? `${item.productName} - ${item.color}`
        : item.productName,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      currency_id: "ARS",
    }));

    const preference = await new Preference(client).create({
      body: {
        items,
        external_reference: order.orderNumber,
        notification_url: `${process.env.BASE_URL || "https://api.neotech.com"}/api/v1/payments/webhook`,
        back_urls: {
          success: `${frontendUrl}/payment-result`,
          failure: `${frontendUrl}/cart`,
          pending: `${frontendUrl}/payment-result`,
        },
      },
    });

    return preference;
  }

  async processWebhook(notification) {
    if (notification.type !== "payment") return;

    const paymentId = notification.data.id;
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${client.accessToken}` } },
    );

    if (!response.ok) return;

    const payment = await response.json();

    if (payment.status === "approved") {
      const { OrderService } = await import("./order.service.js");
      const orderService = new OrderService();
      const order = await orderService.findByOrderNumber(
        payment.external_reference,
      );

      if (!order || order.status === "paid") return;

      await orderService.updateStatus(order, "paid");

      for (const item of order.OrderItems) {
        if (item.productVariantId) {
          await ProductVariant.decrement("stock", {
            by: item.quantity,
            where: { id: item.productVariantId },
          });
        }
      }

      setImmediate(async () => {
        try {
          const { MailService } = await import("./mail.service.js");
          const { PdfService } = await import("./pdf.service.js");
          const mailService = new MailService();
          const pdfService = new PdfService();
          const pdfBuffer = await pdfService.generateReceipt(order);
          await Promise.all([
            mailService.sendOwnerAlert(order),
            mailService.sendReceipt(order, pdfBuffer),
          ]);
        } catch (err) {
          console.error("Post-payment notification error:", err);
        }
      });
    }
  }
}
