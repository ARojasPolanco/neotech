import { AppError, catchAsync } from "../errors/indexError.js";
import { AdminService } from "../services/admin.service.js";

const adminService = new AdminService();

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
  const { page, limit, status } = req.query;
  const result = await adminService.getOrders({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    status,
  });
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
