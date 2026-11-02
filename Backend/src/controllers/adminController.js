import { AppError, catchAsync } from "../errors/indexError.js";
import { AdminService } from "../services/admin.service.js";
import { PaymentService } from "../services/payment.service.js";
import { DiscountService } from "../services/discount.service.js";
import {
  validateCreateDiscountCode,
  validateUpdateDiscountCode,
  validateCreateDiscountCampaign,
} from "../schemas/discount.schema.js";

const adminService = new AdminService();
const paymentService = new PaymentService();
const discountService = new DiscountService();

export const uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No se envió ninguna imagen", 400));
  }

  const url = await adminService.uploadImage(req.file.buffer);
  return res.status(200).json({ url });
});

export const getStats = catchAsync(async (req, res) => {
  const stats = await adminService.getStats();
  return res.status(200).json(stats);
});

export const getOrders = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const status = ["pending", "paid", "cancelled"].includes(req.query.status)
    ? req.query.status
    : undefined;

  const result = await adminService.getOrders({ page, limit, status });
  return res.status(200).json(result);
});

export const getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await adminService.getOrderById(id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  return res.status(200).json(order);
});

export const notifyOrder = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;
  console.log(`[notifyOrder] admin request for ${orderNumber}`);
  try {
    const result = await paymentService.notifyOrder(orderNumber);
    return res.status(200).json(result);
  } catch (err) {
    if (err.message === "Order not found") {
      return next(new AppError("Order not found", 404));
    }
    return next(new AppError("Error sending notifications: " + err.message, 500));
  }
});

export const createDiscountCode = catchAsync(async (req, res) => {
  const { hasError, errorMessages, codeData } = validateCreateDiscountCode(
    req.body,
  );

  if (hasError) {
    return res.status(422).json({ status: "error", message: errorMessages });
  }

  const code = await discountService.createCode(codeData);
  return res.status(201).json(code);
});

export const getDiscountCodes = catchAsync(async (req, res) => {
  const codes = await discountService.listCodes();
  return res.status(200).json(codes);
});

export const updateDiscountCode = catchAsync(async (req, res) => {
  const { hasError, errorMessages, codeData } = validateUpdateDiscountCode(
    req.body,
  );

  if (hasError) {
    return res.status(422).json({ status: "error", message: errorMessages });
  }

  const code = await discountService.setCodeActive(
    req.params.id,
    codeData.isActive,
  );
  return res.status(200).json(code);
});

export const getDiscountCampaigns = catchAsync(async (req, res) => {
  const campaigns = await discountService.listCampaigns();
  return res.status(200).json(campaigns);
});

export const createDiscountCampaign = catchAsync(async (req, res) => {
  const { hasError, errorMessages, campaignData } =
    validateCreateDiscountCampaign(req.body);

  if (hasError) {
    return res.status(422).json({ status: "error", message: errorMessages });
  }

  const campaign = await discountService.createCampaign(campaignData);
  return res.status(201).json(campaign);
});

export const endDiscountCampaign = catchAsync(async (req, res) => {
  const campaign = await discountService.endCampaign(req.params.id);
  return res.status(200).json(campaign);
});
