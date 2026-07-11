import { client, Preference } from "../config/mercadopago.js";
import ProductVariant from "../models/productVariantModel.js";

async function fetchPaymentById(paymentId) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${client.accessToken}` } },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown");
    console.error(`[fetchPaymentById] MP error: ${response.status} ${errorText}`);
    return null;
  }

  return await response.json();
}

async function fetchMerchantOrders(orderNumber) {
  const searchUrl = `https://api.mercadopago.com/merchant_orders/search?external_reference=${encodeURIComponent(orderNumber)}&sort=date_created&criteria=desc`;
  console.log(`[fetchMerchantOrders] querying MP: ${searchUrl}`);
  const response = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${client.accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown");
    console.error(`[fetchMerchantOrders] MP error: ${response.status} ${errorText}`);
    return [];
  }

  const data = await response.json();
  console.log(`[fetchMerchantOrders] MP returned ${data.results?.length || 0} merchant orders`);
  return data.results || [];
}

async function findApprovedPayment(orderNumber) {
  // Try payments search first
  const paymentsUrl = `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderNumber)}&sort=date_created&criteria=desc`;
  console.log(`[findApprovedPayment] querying payments: ${paymentsUrl}`);
  const paymentsResponse = await fetch(paymentsUrl, {
    headers: { Authorization: `Bearer ${client.accessToken}` },
  });

  if (paymentsResponse.ok) {
    const paymentsData = await paymentsResponse.json();
    console.log(`[findApprovedPayment] payments returned ${paymentsData.results?.length || 0} results`);
    const approvedPayment = paymentsData.results?.find((p) => p.status === "approved");
    if (approvedPayment) return { source: "payments", payment: approvedPayment };
  } else {
    const errorText = await paymentsResponse.text().catch(() => "unknown");
    console.error(`[findApprovedPayment] payments search failed: ${paymentsResponse.status} ${errorText}`);
  }

  // Fallback to merchant orders
  const merchantOrders = await fetchMerchantOrders(orderNumber);
  for (const mo of merchantOrders) {
    if (mo.status === "closed" || mo.status === "opened") {
      const approvedPayment = mo.payments?.find((p) => p.status === "approved");
      if (approvedPayment) {
        console.log(`[findApprovedPayment] approved payment found via merchant_order ${mo.id}: ${approvedPayment.id}`);
        return { source: "merchant_order", payment: approvedPayment, merchantOrder: mo };
      }
    }
  }

  return null;
}

async function handleOrderPaid(order) {
  const { OrderService } = await import("./order.service.js");
  const orderService = new OrderService();

  if (!order || order.status === "paid") {
    console.log(`[handleOrderPaid] order ${order?.orderNumber} already paid or not found, skipping`);
    return;
  }

  console.log(`[handleOrderPaid] marking order ${order.orderNumber} as paid`);
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
      console.log(`[handleOrderPaid] generating PDF for ${order.orderNumber}`);
      const pdfBuffer = await pdfService.generateReceipt(order);
      console.log(`[handleOrderPaid] sending mails for ${order.orderNumber}`);
      await Promise.all([
        mailService.sendOwnerAlert(order),
        mailService.sendReceipt(order, pdfBuffer),
      ]);
      console.log(`[handleOrderPaid] mails sent successfully for ${order.orderNumber}`);
    } catch (err) {
      console.error("[handleOrderPaid] Post-payment notification error:", err);
    }
  });
}

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

    const payment = await fetchPaymentById(notification.data.id);

    if (payment?.status === "approved") {
      const { OrderService } = await import("./order.service.js");
      const orderService = new OrderService();
      const order = await orderService.findByOrderNumber(
        payment.external_reference,
      );
      await handleOrderPaid(order);
    }
  }

  async verifyAndProcessOrder(orderNumber, paymentId) {
    console.log(`[verifyAndProcessOrder] checking order ${orderNumber}, paymentId: ${paymentId || "none"}`);
    const { OrderService } = await import("./order.service.js");
    const orderService = new OrderService();
    const order = await orderService.findByOrderNumber(orderNumber);

    if (!order) {
      console.log(`[verifyAndProcessOrder] order ${orderNumber} not found`);
      return { found: false };
    }

    if (order.status === "paid") {
      console.log(`[verifyAndProcessOrder] order ${orderNumber} already paid`);
      return { found: true, status: "paid" };
    }

    if (paymentId) {
      console.log(`[verifyAndProcessOrder] fetching payment ${paymentId} directly`);
      const payment = await fetchPaymentById(paymentId);

      if (payment?.status === "approved") {
        if (payment.external_reference === orderNumber) {
          console.log(`[verifyAndProcessOrder] direct payment matches order ${orderNumber}`);
          await handleOrderPaid(order);
          return { found: true, status: "paid" };
        }
        console.warn(`[verifyAndProcessOrder] payment ${paymentId} external_reference mismatch: ${payment.external_reference} !== ${orderNumber}`);
      }
    }

    const approvedResult = await findApprovedPayment(orderNumber);

    if (approvedResult) {
      console.log(`[verifyAndProcessOrder] approved payment found for ${orderNumber} via ${approvedResult.source}: ${approvedResult.payment.id}`);
      await handleOrderPaid(order);
      return { found: true, status: "paid" };
    }

    console.log(`[verifyAndProcessOrder] no approved payment yet for ${orderNumber}`);
    return { found: true, status: order.status };
  }

  async simulateOrderPaid(orderNumber, force = false) {
    const isProdWithoutSimulate = process.env.NODE_ENV === "production" && process.env.ALLOW_SIMULATE_DEV !== "true";
    if (isProdWithoutSimulate) {
      throw new Error("Payment simulation is not allowed in production");
    }

    console.log(`[simulateOrderPaid] simulating payment for ${orderNumber}, force: ${force}`);
    const { OrderService } = await import("./order.service.js");
    const orderService = new OrderService();
    const order = await orderService.findByOrderNumber(orderNumber);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "paid" && !force) {
      return { simulated: false, status: "paid", message: "Order already paid. Use ?force=true to resend notifications." };
    }

    await handleOrderPaid(order);
    return { simulated: true, status: "paid" };
  }
}
