const sendResponse = (res, options = {}, legacyData = null, legacyStatusCode = 200) => {
  if (typeof options === 'string') {
    const response = {
      success: true,
      message: options,
    };
    if (legacyData !== null && legacyData !== undefined) {
      response.data = legacyData;
    }
    return res.status(legacyStatusCode).json(response);
  }

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
