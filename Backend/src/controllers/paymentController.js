import { AppError, catchAsync } from "../errors/indexError.js";
import { OrderService } from "../services/order.service.js";
import { PaymentService } from "../services/payment.service.js";

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
  });
});

export const webhookHandler = catchAsync(async (req, res) => {
  const notification = req.body;

  if (notification.type === "payment") {
    setImmediate(async () => {
      try {
        await paymentService.processWebhook(notification);
      } catch (err) {
        console.error("Webhook processing error:", err);
      }
    });
  }

  return res.status(200).send("OK");
});

export const verifyPayment = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;
  const { paymentId } = req.query;
  console.log(`[verifyPayment] received request for ${orderNumber}, paymentId: ${paymentId || "none"}`);
  const result = await paymentService.verifyAndProcessOrder(orderNumber, paymentId);

  if (!result.found) {
    console.log(`[verifyPayment] order ${orderNumber} not found`);
    return next(new AppError("Order not found", 404));
  }

  console.log(`[verifyPayment] order ${orderNumber} status: ${result.status}`);
  return res.status(200).json({ status: result.status });
});

export const simulatePayment = catchAsync(async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError("Simulation not allowed in production", 403));
  }

  const { orderNumber } = req.params;
  const { force } = req.query;
  console.log(`[simulatePayment] order ${orderNumber}, force: ${force || false}`);
  const result = await paymentService.simulateOrderPaid(orderNumber, force === "true");
  return res.status(200).json(result);
});

export const resendNotifications = catchAsync(async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError("Resend not allowed in production", 403));
  }

  const { orderNumber } = req.params;
  console.log(`[resendNotifications] order ${orderNumber}`);
  const result = await paymentService.resendOrderNotifications(orderNumber);
  return res.status(200).json(result);
});

export const sendTestEmail = catchAsync(async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError("Test email not allowed in production", 403));
  }

  const { to } = req.body;
  if (!to) {
    return next(new AppError("Missing 'to' email address", 400));
  }

  console.log(`[sendTestEmail] request to ${to}`);
  const result = await paymentService.sendTestEmail(to);
  return res.status(200).json(result);
});
