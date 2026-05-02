import Connection from '../models/Connection.js';
import Review from '../models/Review.js';

export const createReview = async (req, res, next) => {
  try {
    const { reviewee, rating, comment = '' } = req.body;

    if (reviewee === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot review yourself');
    }

    const connection = await Connection.findOne({
      status: 'accepted',
      $or: [
        { requester: req.user._id, recipient: reviewee },
        { requester: reviewee, recipient: req.user._id }
      ]
    });

    if (!connection) {
      res.status(403);
      throw new Error('Feedback is only available for accepted connections');
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      rating,
      comment: comment.trim()
    });
    res.status(201).json(await review.populate('reviewer reviewee', '-password'));
  } catch (error) {
    next(error);
  }
};

export const userReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', '-password')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
