import { createContactMessageValidation } from './contact.validation.js';
import { submitContactMessage } from './contact.service.js';
import sendResponse from '../../utils/responseHandler.js';

export const createContactMessage = async (req, res) => {
  const { error, value } = createContactMessageValidation.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const doc = await submitContactMessage(value, req.file);
  sendResponse(res, {
    statusCode: 201,
    message: 'Message sent successfully',
    data: { id: doc._id },
  });
};
