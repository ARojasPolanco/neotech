export const extractValidationData = (resultValidation) => {
  let errorMessages;
  let data;
  const hasError = !resultValidation.success;

  if (hasError) errorMessages = resultValidation.error.issues.map((issue) => issue.message);
  if (!hasError) data = resultValidation.data;

  return {
    hasError,
    errorMessages,
    data,
  };
};
