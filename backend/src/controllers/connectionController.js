import Connection from '../models/Connection.js';
import Match from '../models/Match.js';

export const requestConnection = async (req, res, next) => {
  try {
    const { recipient, matchId } = req.body;
    if (recipient === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot connect with yourself');
    }

    let connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient },
        { requester: recipient, recipient: req.user._id }
      ]
    });

    if (connection && connection.status !== 'rejected') {
      res.status(400);
      throw new Error(
        connection.status === 'accepted'
          ? 'You are already connected with this user'
          : 'A connection request is already pending'
      );
    }

    if (connection) {
      connection.requester = req.user._id;
      connection.recipient = recipient;
      connection.matchId = matchId;
      connection.status = 'pending';
      await connection.save();
      await connection.populate('requester recipient', '-password');
    } else {
      connection = await Connection.create({
        requester: req.user._id,
        recipient,
        matchId,
        status: 'pending'
      });
      await connection.populate('requester recipient', '-password');
    }

    if (matchId) await Match.findByIdAndUpdate(matchId, { status: 'pending' });
    res.status(201).json(connection);
  } catch (error) {
    next(error);
  }
};

export const updateConnectionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const connection = await Connection.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { status },
      { new: true }
    ).populate('requester recipient', '-password');

    if (!connection) {
      res.status(404);
      throw new Error('Connection request not found');
    }

    if (connection.matchId) {
      await Match.findByIdAndUpdate(connection.matchId, { status });
    }

    res.json(connection);
  } catch (error) {
    next(error);
  }
};

export const disconnectConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      status: 'accepted',
      $or: [{ requester: req.user._id }, { recipient: req.user._id }]
    });

    if (!connection) {
      res.status(404);
      throw new Error('Accepted connection not found');
    }

    if (connection.matchId) {
      await Match.findByIdAndUpdate(connection.matchId, { status: 'rejected' });
    }

    res.json({ message: 'Connection disconnected' });
  } catch (error) {
    next(error);
  }
};

export const myConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }]
    })
      .populate('requester recipient', '-password')
      .populate('matchId')
      .sort({ updatedAt: -1 });

    res.json(connections);
  } catch (error) {
    next(error);
  }
};
