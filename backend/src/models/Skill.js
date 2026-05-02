import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['teach', 'learn'], required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' }
  },
  { timestamps: true }
);

skillSchema.index({ userId: 1, skillName: 1, type: 1 }, { unique: true });

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
