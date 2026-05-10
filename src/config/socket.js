import { Server } from 'socket.io';
import chatService from '../modules/chat/chat.service.js';

let io;

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

    // Pub-Sub message flow: client send -> server persist -> room broadcast
    socket.on('send_message', async (payload = {}, ack) => {
      try {
        const { chatId, senderId, text = '', image = '' } = payload;

        if (!chatId || !senderId || (!text && !image)) {
          if (typeof ack === 'function') {
            ack({ success: false, message: 'chatId, senderId and either text or image are required' });
          }
          return;
        }

        const message = await chatService.sendMessage(chatId, senderId, { text, image });

        // Standardized event
        io.to(chatId).emit('receive_message', message);
        // Backward compatible event
        io.to(chatId).emit('message', message);

        if (typeof ack === 'function') {
          ack({ success: true, data: message });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ success: false, message: error.message || 'Failed to send message' });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export default initSocket;
export { io };

