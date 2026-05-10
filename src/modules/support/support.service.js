import mongoose from 'mongoose';
import SupportTicket from './support.model.js';

const cleanTicket = (ticket) => ticket;

export const createTicket = async (user, payload) => {
  const ticket = await SupportTicket.create({
    user: user._id,
    subject: payload.subject,
    category: payload.category || 'other',
    priority: payload.priority || 'medium',
    relatedProduct: payload.relatedProduct || null,
    contactEmail: payload.contactEmail || user.email || '',
    messages: [
      {
        sender: user._id,
        senderRole: 'user',
        message: payload.message,
      },
    ],
  });

  return cleanTicket(await getTicketForUser(ticket._id, user._id));
};

export const getUserTickets = async (userId, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const filter = { user: userId };
  if (query.status && query.status !== 'all') filter.status = query.status;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .populate('relatedProduct', 'title images price')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SupportTicket.countDocuments(filter),
  ]);

  return {
    tickets,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const getTicketForUser = async (ticketId, userId) => {
  const ticket = await SupportTicket.findOne({ _id: ticketId, user: userId })
    .populate('user', 'name email phone')
    .populate('relatedProduct', 'title images price status')
    .populate('messages.sender', 'name email role')
    .populate('assignedTo', 'name email');

  if (!ticket) {
    const error = new Error('Support ticket not found');
    error.statusCode = 404;
    throw error;
  }

  return ticket;
};

export const replyToTicket = async (ticketId, user, message) => {
  const ticket = await SupportTicket.findOne({ _id: ticketId, user: user._id });
  if (!ticket) {
    const error = new Error('Support ticket not found');
    error.statusCode = 404;
    throw error;
  }

  ticket.messages.push({
    sender: user._id,
    senderRole: user.role === 'admin' ? 'admin' : 'user',
    message,
  });

  if (ticket.status === 'waiting_user') ticket.status = 'in_progress';
  if (ticket.status === 'closed' || ticket.status === 'resolved') ticket.status = 'open';
  await ticket.save();

  return getTicketForUser(ticket._id, user._id);
};

export const getAdminTickets = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const filter = {};

  if (query.status && query.status !== 'all') filter.status = query.status;
  if (query.priority && query.priority !== 'all') filter.priority = query.priority;
  if (query.category && query.category !== 'all') filter.category = query.category;
  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [
      { subject: regex },
      { ticketNumber: regex },
      { contactEmail: regex },
      { 'messages.message': regex },
    ];
  }

  const [tickets, total, counts] = await Promise.all([
    SupportTicket.find(filter)
      .populate('user', 'name email phone')
      .populate('relatedProduct', 'title images price status')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SupportTicket.countDocuments(filter),
    SupportTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    tickets,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
    counts: counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};

export const getAdminTicket = async (ticketId) => {
  const ticket = await SupportTicket.findById(ticketId)
    .populate('user', 'name email phone')
    .populate('relatedProduct', 'title images price status')
    .populate('messages.sender', 'name email role')
    .populate('assignedTo', 'name email');

  if (!ticket) {
    const error = new Error('Support ticket not found');
    error.statusCode = 404;
    throw error;
  }

  return ticket;
};

export const updateAdminTicket = async (ticketId, adminUser, payload) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    const error = new Error('Invalid ticket id');
    error.statusCode = 400;
    throw error;
  }

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Support ticket not found');
    error.statusCode = 404;
    throw error;
  }

  if (payload.status) {
    ticket.status = payload.status;
    ticket.resolvedAt = ['resolved', 'closed'].includes(payload.status) ? new Date() : null;
  }
  if (payload.priority) ticket.priority = payload.priority;
  if (payload.adminNote !== undefined) ticket.adminNote = payload.adminNote;
  ticket.assignedTo = adminUser._id;

  if (payload.reply) {
    ticket.messages.push({
      sender: adminUser._id,
      senderRole: 'admin',
      message: payload.reply,
    });
    if (!payload.status && ticket.status === 'open') ticket.status = 'in_progress';
  }

  await ticket.save();
  return getAdminTicket(ticket._id);
};
