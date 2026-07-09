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
  console.log(`[verifyPayment] received request for ${orderNumber}`);
  const result = await paymentService.verifyAndProcessOrder(orderNumber);

  if (!result.found) {
    console.log(`[verifyPayment] order ${orderNumber} not found`);
    return next(new AppError("Order not found", 404));
  }

  console.log(`[verifyPayment] order ${orderNumber} status: ${result.status}`);
  return res.status(200).json({ status: result.status });
});
