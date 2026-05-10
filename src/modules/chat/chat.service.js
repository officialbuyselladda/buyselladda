import Chat from './chat.model.js';
import Message from './message.model.js';
import User from '../user/user.model.js';
import { createNotification } from '../notification/notification.service.js';
import mongoose from 'mongoose';

const toObjectId = (value) => {
  const id = value?._id || value;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

const normalizeParticipants = (participants = []) => {
  const unique = [...new Set(participants.map((participant) => {
    const id = participant?._id || participant;
    return id?.toString();
  }).filter(Boolean))];

  if (unique.length !== 2 || unique.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new Error('A chat must have exactly two valid users');
  }

  return unique.sort().map((id) => new mongoose.Types.ObjectId(id));
};

const getUserChats = async (userId) => {
  const userObjectId = toObjectId(userId);
  if (!userObjectId) throw new Error('Invalid user');

  const chats = await Chat.find({ participants: userObjectId })
    .populate('participants', 'name avatar email lastSeen')
    .populate('product', 'title price images')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name avatar' },
    })
    .sort('-updatedAt')
    .lean();

  const unreadCounts = await Message.aggregate([
    { $match: { chat: { $in: chats.map((chat) => chat._id) }, sender: { $ne: userObjectId }, read: false } },
    { $group: { _id: '$chat', count: { $sum: 1 } } },
  ]);
  const unreadMap = {};
  unreadCounts.forEach((item) => { unreadMap[item._id.toString()] = item.count; });

  return chats.map((chat) => ({
    ...chat,
    users: chat.participants,
    unreadCount: unreadMap[chat._id.toString()] || 0,
  }));
};

const getChat = async (chatId, userId) => {
  const userObjectId = toObjectId(userId);
  const chat = await Chat.findOne({ _id: chatId, participants: userObjectId })
    .populate('participants', 'name avatar email lastSeen')
    .populate('product', 'title price images');
  if (!chat) throw new Error('Chat not found');
  return chat;
};

const getMessages = async (chatId, userId) => {
  const userObjectId = toObjectId(userId);
  const chat = await Chat.findOne({ _id: chatId, participants: userObjectId })
    .populate('product', 'title price images');
  if (!chat) throw new Error('Chat not found');

  const page = 1;
  const limit = 50;
  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name avatar')
    .sort('createdAt')
    .limit(limit * page);

  // Mark as read
  await Message.updateMany({ chat: chatId, sender: { $ne: userObjectId }, read: false }, { read: true });

  return messages;
};

const sendMessage = async (chatId, senderId, data) => {
  const text = String(data?.text || '').trim();
  if (!text) throw new Error('Message cannot be empty');

  const chat = await Chat.findById(chatId).populate('product', 'title images price');
  const isParticipant = chat?.participants.some((participantId) =>
    participantId.toString() === senderId.toString()
  );
  if (!chat || !isParticipant) {
    throw new Error('Invalid chat');
  }

  const sender = await User.findById(senderId).select('blockedUsers');
  const recipientId = chat.participants.find((participantId) => participantId.toString() !== senderId.toString());
  const recipient = await User.findById(recipientId).select('blockedUsers');
  const senderBlockedRecipient = sender?.blockedUsers?.some((blockedId) => blockedId.toString() === recipientId.toString());
  const recipientBlockedSender = recipient?.blockedUsers?.some((blockedId) => blockedId.toString() === senderId.toString());
  if (senderBlockedRecipient || recipientBlockedSender) {
    throw new Error('You cannot send messages in this chat');
  }

  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    text,
  });

  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

  const populatedMessage = await message.populate('sender', 'name avatar email');
  const recipientIds = chat.participants.filter((participantId) =>
    participantId.toString() !== senderId.toString()
  );

  try {
    await Promise.all(recipientIds.map((recipientId) => createNotification(recipientId, {
      type: 'new_message',
      title: `${populatedMessage.sender?.name || 'Someone'} sent you a message`,
      message: text.length > 140 ? `${text.slice(0, 137)}...` : text,
      relatedProduct: chat.product?._id,
      relatedChat: chat._id,
      data: {
        chatId: chat._id,
        senderId,
        productTitle: chat.product?.title || '',
      },
      priority: 'medium',
    })));
  } catch (error) {
    console.warn('Message notification failed:', error.message);
  }

  return populatedMessage;
};

const createChat = async (participants, productId = null) => {
  const normalizedParticipants = normalizeParticipants(participants);
  const productObjectId = productId && mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : null;

  const existingUsers = await User.countDocuments({ _id: { $in: normalizedParticipants } });
  if (existingUsers !== 2) throw new Error('Chat user not found');

  // Try to find existing chat with same participants AND product
  const query = { participants: { $size: 2, $all: normalizedParticipants } };
  if (productId) {
    query.product = productObjectId;
  }
  
  const chat = await Chat.findOne(query)
    .populate('participants', 'name avatar email lastSeen')
    .populate('product', 'title price images');
  if (chat) return chat;

  // Create new chat
  const newChat = await Chat.create({
    participants: normalizedParticipants,
    product: productObjectId,
  });
  return newChat.populate([
    { path: 'participants', select: 'name avatar email lastSeen' },
    { path: 'product', select: 'title price images' },
  ]);
};

export default { getUserChats, getChat, getMessages, sendMessage, createChat };

