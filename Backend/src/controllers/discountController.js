import { catchAsync } from "../errors/indexError.js";
import { validateDiscountCode as validateCodeSchema } from "../schemas/discount.schema.js";
import { DiscountService } from "../services/discount.service.js";

const discountService = new DiscountService();

export const validateCode = catchAsync(async (req, res) => {
  const { hasError, errorMessages, codeData } = validateCodeSchema(req.body);

  if (hasError) {
    return res.status(422).json({ status: "error", message: errorMessages });
  }

  const result = await discountService.validateCode(codeData.code);
  return res.status(200).json({ valid: true, ...result });
});
