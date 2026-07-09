import { AppError, catchAsync } from "../errors/indexError.js";
import { OrderService } from "../services/order.service.js";

const orderService = new OrderService();

export const createOrder = catchAsync(async (req, res, next) => {
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

  return res.status(201).json(order);
});

export const getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderService.findById(id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  return res.status(200).json(order);
});

export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await orderService.findByUser(req.sessionUser.id);
  return res.status(200).json(orders);
});

export const getOrderByNumber = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;
  const order = await orderService.findByOrderNumber(orderNumber);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  return res.status(200).json(order);
});
