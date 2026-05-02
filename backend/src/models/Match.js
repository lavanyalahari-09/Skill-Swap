import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    user1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchedSkills: [
      {
        learnerSkill: String,
        teacherSkill: String,
        direction: String
      }
    ],
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);
export default Match;
