import Connection from '../models/Connection.js';
import Message from '../models/Message.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { receiver, content, connectionId } = req.body;
    if (!content?.trim()) {
      res.status(400);
      throw new Error('Message cannot be empty');
    }

    if (connectionId) {
      const connection = await Connection.findOne({
        _id: connectionId,
        status: 'accepted',
        $or: [{ requester: req.user._id }, { recipient: req.user._id }]
      });

      if (!connection) {
        res.status(403);
        throw new Error('Messages are only available for accepted connections');
      }
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content: content.trim(),
      connectionId
    });

    res.status(201).json(await message.populate('sender receiver', '-password'));
  } catch (error) {
    next(error);
  }
};

export const conversation = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .populate('sender receiver', '-password')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const markConversationRead = async (req, res, next) => {
  try {
    const { connectionId } = req.body;

    if (connectionId) {
      const connection = await Connection.findOne({
        _id: connectionId,
        status: 'accepted',
        $or: [{ requester: req.user._id }, { recipient: req.user._id }]
      });

      if (!connection) {
        res.status(403);
        throw new Error('Conversation is unavailable');
      }
    }

    const readAt = new Date();
    const result = await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, readAt: null },
      { readAt }
    );

    res.json({ updated: result.modifiedCount, readAt });
  } catch (error) {
    next(error);
  }
};
