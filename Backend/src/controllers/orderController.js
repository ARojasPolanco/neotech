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

  try {
    const order = await orderService.create({
      customerName,
      customerEmail,
      customerPhone,
      items,
      userId: req.sessionUser?.id || null,
    });

    return res.status(201).json(order);
  } catch (err) {
    if (err.message?.startsWith("PRODUCT_NOT_FOUND")) {
      return next(new AppError(`Producto no encontrado: ${err.message.split(":")[1]}`, 400));
    }
    if (err.message?.startsWith("VARIANT_NOT_FOUND")) {
      return next(new AppError(`Variante no encontrada: ${err.message.split(":")[1]}`, 400));
    }
    throw err;
  }
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

  if (!req.sessionUser) {
    return res.status(200).json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      OrderItems: order.OrderItems?.map((item) => ({
        id: item.id,
        productName: item.productName,
        color: item.color,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    });
  }

  return res.status(200).json(order);
});
