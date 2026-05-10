import sendResponse from '../../utils/responseHandler.js';
import {
  createTicket,
  getAdminTicket,
  getAdminTickets,
  getTicketForUser,
  getUserTickets,
  replyToTicket,
  updateAdminTicket,
} from './support.service.js';
import {
  createSupportTicketValidation,
  replySupportTicketValidation,
  supportListQueryValidation,
  updateSupportTicketValidation,
} from './support.validation.js';

const validateOrThrow = (schema, payload) => {
  const { error, value } = schema.validate(payload);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }
  return value;
};

export const createSupportTicket = async (req, res) => {
  const value = validateOrThrow(createSupportTicketValidation, req.body);
  const ticket = await createTicket(req.user, value);
  sendResponse(res, {
    statusCode: 201,
    message: 'Support ticket created',
    data: ticket,
  });
};

export const getMySupportTickets = async (req, res) => {
  const value = validateOrThrow(supportListQueryValidation, req.query);
  const tickets = await getUserTickets(req.user._id, value);
  sendResponse(res, {
    message: 'Support tickets fetched',
    data: tickets,
  });
};

export const getMySupportTicket = async (req, res) => {
  const ticket = await getTicketForUser(req.params.id, req.user._id);
  sendResponse(res, {
    message: 'Support ticket fetched',
    data: ticket,
  });
};

export const replyMySupportTicket = async (req, res) => {
  const value = validateOrThrow(replySupportTicketValidation, req.body);
  const ticket = await replyToTicket(req.params.id, req.user, value.message);
  sendResponse(res, {
    message: 'Reply added',
    data: ticket,
  });
};

export const getSupportTicketsAdmin = async (req, res) => {
  const value = validateOrThrow(supportListQueryValidation, req.query);
  const tickets = await getAdminTickets(value);
  sendResponse(res, {
    message: 'Support tickets fetched',
    data: tickets,
  });
};

export const getSupportTicketAdmin = async (req, res) => {
  const ticket = await getAdminTicket(req.params.id);
  sendResponse(res, {
    message: 'Support ticket fetched',
    data: ticket,
  });
};

export const updateSupportTicketAdmin = async (req, res) => {
  const value = validateOrThrow(updateSupportTicketValidation, req.body);
  const ticket = await updateAdminTicket(req.params.id, req.user, value);
  sendResponse(res, {
    message: 'Support ticket updated',
    data: ticket,
  });
};
