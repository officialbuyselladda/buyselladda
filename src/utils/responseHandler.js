const sendResponse = (res, { success, statusCode, message, data }) => {
  const response = {
    success,
    statusCode,
    message,
  };

  if (data) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export default sendResponse;

