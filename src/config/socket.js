import { Server } from 'socket.io';
import chatService from '../modules/chat/chat.service.js';
import User from '../modules/user/user.model.js';

let io;
const onlineUsers = new Map();

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

const addOnlineUser = (userId, socketId) => {
  const id = userId?.toString();
  if (!id) return false;
  const sockets = onlineUsers.get(id) || new Set();
  const wasOffline = sockets.size === 0;
  sockets.add(socketId);
  onlineUsers.set(id, sockets);
  return wasOffline;
};

const removeOnlineUser = (userId, socketId) => {
  const id = userId?.toString();
  if (!id) return false;
  const sockets = onlineUsers.get(id);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size > 0) return false;
  onlineUsers.delete(id);
  return true;
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Update for production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Backward-compatible + standardized room join events
    const handleJoinRoom = (roomId, ack) => {
      if (!roomId) {
        if (typeof ack === 'function') ack({ success: false, message: 'roomId is required' });
        return;
      }
      socket.join(roomId);
      if (typeof ack === 'function') ack({ success: true, roomId });
    };

    socket.on('join-room', handleJoinRoom); // existing
    socket.on('join_room', handleJoinRoom); // standardized
    socket.on('joinChat', handleJoinRoom); // frontend compatibility
    socket.on('join_user', async (userId, ack) => {
      if (!userId) {
        if (typeof ack === 'function') ack({ success: false, message: 'userId is required' });
        return;
      }
      socket.data.userId = userId.toString();
      socket.join(`user:${userId}`);

      const wasOffline = addOnlineUser(userId, socket.id);
      if (wasOffline) {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(() => null);
      }

      io.emit('presence:update', {
        userId: userId.toString(),
        isOnline: true,
        lastSeen: new Date(),
      });

      if (typeof ack === 'function') {
        ack({ success: true, userId, onlineUsers: getOnlineUserIds() });
      }
    });

    socket.on('presence:get', async (payload = {}, ack) => {
      const userIds = Array.isArray(payload.userIds) ? payload.userIds.filter(Boolean) : [];
      const users = await User.find({ _id: { $in: userIds } }).select('lastSeen').lean().catch(() => []);
      const lastSeenMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user.lastSeen;
        return acc;
      }, {});

      if (typeof ack === 'function') {
        ack({
          success: true,
          users: userIds.map((userId) => ({
            userId: userId.toString(),
            isOnline: onlineUsers.has(userId.toString()),
            lastSeen: lastSeenMap[userId.toString()] || null,
          })),
        });
      }
    });

    socket.on('typing:start', ({ chatId, userId } = {}) => {
      if (!chatId || !userId) return;
      socket.to(chatId).emit('typing:update', { chatId, userId: userId.toString(), isTyping: true });
    });

    socket.on('typing:stop', ({ chatId, userId } = {}) => {
      if (!chatId || !userId) return;
      socket.to(chatId).emit('typing:update', { chatId, userId: userId.toString(), isTyping: false });
    });

    // Pub-Sub message flow: client send -> server persist -> room broadcast
    socket.on('send_message', async (payload = {}, ack) => {
      try {
        const { chatId, senderId, text = '', clientTempId = null } = payload;

        if (!chatId || !senderId || !String(text).trim()) {
          if (typeof ack === 'function') {
            ack({ success: false, message: 'chatId, senderId and text are required' });
          }
          return;
        }

        const message = await chatService.sendMessage(chatId, senderId, { text });
        const outgoingMessage = {
          ...(typeof message.toObject === 'function' ? message.toObject() : message),
          clientTempId,
        };

        // Standardized event
        io.to(chatId).emit('receive_message', outgoingMessage);
        // Backward compatible event
        io.to(chatId).emit('message', outgoingMessage);
        const chat = await chatService.getChat(chatId, senderId);
        chat.participants.forEach((participant) => {
          io.to(`user:${participant._id}`).emit('chat_updated', { chatId, message: outgoingMessage });
        });

        if (typeof ack === 'function') {
          ack({ success: true, data: outgoingMessage });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ success: false, message: error.message || 'Failed to send message' });
        }
      }
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      const userId = socket.data.userId;
      if (!userId) return;

      const isNowOffline = removeOnlineUser(userId, socket.id);
      if (!isNowOffline) return;

      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { lastSeen }).catch(() => null);
      io.emit('presence:update', {
        userId,
        isOnline: false,
        lastSeen,
      });
    });
  });

  return io;
};

export default initSocket;
export { io };

