const sendResponse = (res, options = {}) => {
  const {
    success = true,
    statusCode = 200,
    message = '',
    data = null
  } = options;

  const response = {
    success,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export default sendResponse;