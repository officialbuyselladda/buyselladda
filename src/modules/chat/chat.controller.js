import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import chatService from './chat.service.js';
import { io } from '../../config/socket.js';

const createChat = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body;
  const participants = [req.user._id.toString(), otherUserId?.toString()];
  const chat = await chatService.createChat(participants);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Chat created or found',
    data: chat,
  });
});

const getChats = asyncHandler(async (req, res) => {
  const chats = await chatService.getUserChats(req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Chats fetched',
    data: chats,
  });
});

const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await chatService.getChat(chatId, req.user._id);
  const messages = await chatService.getMessages(chatId, req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Messages fetched',
    data: { chat, messages },
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { text } = req.body;
  const message = await chatService.sendMessage(chatId, req.user._id, { text });
  io?.to(chatId).emit('receive_message', message);
  io?.to(chatId).emit('message', message);
  const chat = await chatService.getChat(chatId, req.user._id);
  chat.participants.forEach((participant) => {
    io?.to(`user:${participant._id}`).emit('chat_updated', { chatId, message });
  });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Message sent',
    data: message,
  });
});

export { createChat, getChats, getMessages, sendMessage };

