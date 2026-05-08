import Chat from './chat.model.js';
import Message from './message.model.js';
import User from '../user/user.model.js';
import Product from '../product/product.model.js';

const getUserChats = async (userId) => {
  const chats = await Chat.find({ participants: userId })
    .populate('participants', 'name avatar email')
    .populate('product', 'title price images')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name avatar' },
    })
    .sort('-updatedAt');
  return chats;
};

const getMessages = async (chatId, userId) => {
  const chat = await Chat.findOne({ _id: chatId, participants: userId })
    .populate('product', 'title price images');
  if (!chat) throw new Error('Chat not found');

  const page = 1;
  const limit = 50;
  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name avatar')
    .sort('createdAt')
    .limit(limit * page);

  // Mark as read
  await Message.updateMany({ chat: chatId, sender: { $ne: userId }, read: false }, { read: true });

  return messages;
};

const sendMessage = async (chatId, senderId, data) => {
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.includes(senderId)) {
    throw new Error('Invalid chat');
  }

  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    ...data,
  });

  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

  return message.populate('sender', 'name avatar');
};

const createChat = async (participants, productId = null) => {
  // Try to find existing chat with same participants AND product
  const query = { participants: { $size: 2, $all: participants.sort() } };
  if (productId) {
    query.product = productId;
  }
  
  const chat = await Chat.findOne(query);
  if (chat) return chat;

  // Create new chat
  const newChat = await Chat.create({
    participants,
    product: productId,
  });
  return newChat;
};

export default { getUserChats, getMessages, sendMessage, createChat };

