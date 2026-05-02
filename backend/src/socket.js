import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import Connection from './models/Connection.js';
import Message from './models/Message.js';
import User from './models/User.js';
import { allowedOrigins } from './config/corsOptions.js';

const onlineUsers = new Map();

const userRoom = (userId) => `user:${userId}`;
const conversationRoom = (connectionId) => `connection:${connectionId}`;

const publicUserFields = 'name email bio location availability interests avatarColor';

const getAcceptedConnection = async (connectionId, userId) =>
  Connection.findOne({
    _id: connectionId,
    status: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }]
  }).populate('requester recipient', publicUserFields);

const getPeerFromConnection = (connection, userId) => {
  const requesterId = connection.requester._id.toString();
  return requesterId === userId ? connection.recipient : connection.requester;
};

const rememberOnlineSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId) || new Set();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
  return sockets.size === 1;
};

const forgetOnlineSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size > 0) return false;
  onlineUsers.delete(userId);
  return true;
};

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(publicUserFields);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (_error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(userRoom(userId));

    if (rememberOnlineSocket(userId, socket.id)) {
      socket.broadcast.emit('presence:update', { userId, online: true });
    }

    socket.on('conversation:join', async ({ connectionId } = {}, ack) => {
      try {
        const connection = await getAcceptedConnection(connectionId, userId);
        if (!connection) throw new Error('Conversation is unavailable');

        socket.join(conversationRoom(connectionId));
        const peer = getPeerFromConnection(connection, userId);
        ack?.({
          ok: true,
          peerId: peer._id.toString(),
          peerOnline: onlineUsers.has(peer._id.toString())
        });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
      }
    });

    socket.on('conversation:leave', ({ connectionId } = {}) => {
      if (connectionId) socket.leave(conversationRoom(connectionId));
    });

    socket.on('message:send', async ({ connectionId, content } = {}, ack) => {
      try {
        const trimmed = content?.trim();
        if (!trimmed) throw new Error('Message cannot be empty');

        const connection = await getAcceptedConnection(connectionId, userId);
        if (!connection) throw new Error('Messages are only available for accepted connections');

        const receiver = getPeerFromConnection(connection, userId);
        const message = await Message.create({
          sender: userId,
          receiver: receiver._id,
          content: trimmed,
          connectionId
        });
        const populatedMessage = await message.populate('sender receiver', '-password');

        io.to(conversationRoom(connectionId))
          .to(userRoom(receiver._id.toString()))
          .emit('message:new', {
            connectionId,
            message: populatedMessage
          });

        ack?.({ ok: true, message: populatedMessage });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
      }
    });

    socket.on('message:read', async ({ connectionId } = {}, ack) => {
      try {
        const connection = await getAcceptedConnection(connectionId, userId);
        if (!connection) throw new Error('Conversation is unavailable');

        const peer = getPeerFromConnection(connection, userId);
        const readAt = new Date();
        await Message.updateMany(
          { connectionId, sender: peer._id, receiver: userId, readAt: null },
          { readAt }
        );

        io.to(userRoom(peer._id.toString())).emit('message:read', {
          connectionId,
          readerId: userId,
          readAt
        });

        ack?.({ ok: true, readAt });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
      }
    });

    socket.on('typing:start', async ({ connectionId } = {}) => {
      try {
        const connection = await getAcceptedConnection(connectionId, userId);
        if (!connection) return;
        socket.to(conversationRoom(connectionId)).emit('typing:update', {
          connectionId,
          userId,
          typing: true
        });
      } catch (_error) {
        // Typing signals are best-effort and should never interrupt a socket session.
      }
    });

    socket.on('typing:stop', async ({ connectionId } = {}) => {
      try {
        const connection = await getAcceptedConnection(connectionId, userId);
        if (!connection) return;
        socket.to(conversationRoom(connectionId)).emit('typing:update', {
          connectionId,
          userId,
          typing: false
        });
      } catch (_error) {
        // Typing signals are best-effort and should never interrupt a socket session.
      }
    });

    socket.on('disconnect', () => {
      if (forgetOnlineSocket(userId, socket.id)) {
        socket.broadcast.emit('presence:update', { userId, online: false });
      }
    });
  });

  return io;
};
