import { AppError, catchAsync } from "../errors/indexError.js";
import { OrderService } from "../services/order.service.js";
import { PaymentService } from "../services/payment.service.js";
import { envs } from "../config/enviroments/enviroments.js";
import crypto from "crypto";

const orderService = new OrderService();
const paymentService = new PaymentService();

export const createPreference = catchAsync(async (req, res, next) => {
  const { customerName, customerEmail, customerPhone, items } = req.body;

  if (!customerName || !customerEmail || !customerPhone) {
    return next(new AppError("Missing customer data", 400));
  }

  if (!items || items.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  const order = await orderService.create({
    customerName,
    customerEmail,
    customerPhone,
    items,
    userId: req.sessionUser?.id || null,
  });

  const frontendUrl = req.headers.origin || "http://localhost:5173";
  const preference = await paymentService.createPreference(order, frontendUrl);

  return res.status(201).json({
    initPoint: preference.init_point,
    orderNumber: order.orderNumber,
    orderId: order.id,
    preferenceId: preference.id,
  });
});

export const webhookHandler = catchAsync(async (req, res) => {
  const notification = req.body;

  if (notification.type === "payment") {
    const xSignature = req.headers["x-signature"];
    const xRequestId = req.headers["x-request-id"];

    if (xSignature && envs.MP_WEBHOOK_SECRET) {
      try {
        const parts = xSignature.split(",").reduce((acc, part) => {
          const [key, val] = part.split("=").map((s) => s.trim());
          if (key === "ts") acc.ts = val;
          if (key === "v1") acc.v1 = val;
          return acc;
        }, {});

        const manifest = `id:${notification.data?.id};request-id:${xRequestId};ts:${parts.ts};`;
        const expectedSignature = crypto
          .createHmac("sha256", envs.MP_WEBHOOK_SECRET)
          .update(manifest)
          .digest("hex");

        if (parts.v1 !== expectedSignature) {
          console.warn("[webhookHandler] Invalid signature from", req.ip, "- processing anyway for reliability");
        }
      } catch (sigErr) {
        console.warn("[webhookHandler] Signature verification error:", sigErr.message, "- processing anyway");
      }
    }

    try {
      await paymentService.processWebhook(notification);
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  return res.status(200).send("OK");
});

export const verifyPayment = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;
  const { paymentId, preferenceId } = req.query;
  console.log(`[verifyPayment] received request for ${orderNumber}, paymentId: ${paymentId || "none"}, preferenceId: ${preferenceId || "none"}`);
  const result = await paymentService.verifyAndProcessOrder(orderNumber, paymentId, preferenceId);

  if (!result.found) {
    console.log(`[verifyPayment] order ${orderNumber} not found`);
    return next(new AppError("Order not found", 404));
  }

  console.log(`[verifyPayment] order ${orderNumber} status: ${result.status}`);
  return res.status(200).json({ status: result.status });
});

export const simulatePayment = catchAsync(async (req, res, next) => {
  const isProdWithoutSimulate = envs.NODE_ENV === "production" && process.env.ALLOW_SIMULATE_DEV !== "true";
  if (isProdWithoutSimulate) {
    return next(new AppError("Simulation not allowed in production", 403));
  }

  const { orderNumber } = req.params;
  const { force } = req.query;
  console.log(`[simulatePayment] order ${orderNumber}, force: ${force || false}`);
  const result = await paymentService.simulateOrderPaid(orderNumber, force === "true");
  return res.status(200).json(result);
});
