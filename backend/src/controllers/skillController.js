import Skill from '../models/Skill.js';

export const createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create({ ...req.body, userId: req.user._id });
    res.status(201).json(skill);
  } catch (error) {
    next(error.code === 11000 ? new Error('This skill already exists for your profile') : error);
  }
};

export const mySkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ userId: req.user._id }).sort({ type: 1, skillName: 1 });
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!skill) {
      res.status(404);
      throw new Error('Skill not found');
    }
    res.json({ message: 'Skill removed' });
  } catch (error) {
    next(error);
  }
};
