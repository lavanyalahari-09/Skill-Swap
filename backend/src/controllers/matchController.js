import Match from '../models/Match.js';
import Skill from '../models/Skill.js';
import User from '../models/User.js';

const normalize = (value) => value.trim().toLowerCase();

const buildPairMatch = (currentUser, currentSkills, otherUser, otherSkills) => {
  const myTeach = currentSkills.filter((skill) => skill.type === 'teach').map((skill) => normalize(skill.skillName));
  const myLearn = currentSkills.filter((skill) => skill.type === 'learn').map((skill) => normalize(skill.skillName));
  const theirTeach = otherSkills.filter((skill) => skill.type === 'teach').map((skill) => normalize(skill.skillName));
  const theirLearn = otherSkills.filter((skill) => skill.type === 'learn').map((skill) => normalize(skill.skillName));

  const iCanLearn = myLearn.filter((skill) => theirTeach.includes(skill));
  const iCanTeach = myTeach.filter((skill) => theirLearn.includes(skill));

  const matchedSkills = [
    ...iCanLearn.map((skill) => ({
      learnerSkill: skill,
      teacherSkill: skill,
      direction: `${otherUser.name} can teach ${currentUser.name}`
    })),
    ...iCanTeach.map((skill) => ({
      learnerSkill: skill,
      teacherSkill: skill,
      direction: `${currentUser.name} can teach ${otherUser.name}`
    }))
  ];

  return {
    user: otherUser,
    matchedSkills,
    score: matchedSkills.length,
    isMutual: iCanLearn.length > 0 && iCanTeach.length > 0
  };
};

export const discoverMatches = async (req, res, next) => {
  try {
    const currentSkills = await Skill.find({ userId: req.user._id });
    const otherUsers = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    const otherSkills = await Skill.find({ userId: { $ne: req.user._id } });

    const matches = otherUsers
      .map((user) => buildPairMatch(
        req.user,
        currentSkills,
        user,
        otherSkills.filter((skill) => skill.userId.toString() === user._id.toString())
      ))
      .filter((match) => match.score > 0)
      .sort((a, b) => Number(b.isMutual) - Number(a.isMutual) || b.score - a.score);

    res.json(matches);
  } catch (error) {
    next(error);
  }
};

export const saveMatch = async (req, res, next) => {
  try {
    const { userId, matchedSkills = [], score = 1 } = req.body;
    const pair = [req.user._id.toString(), userId].sort();
    const match = await Match.findOneAndUpdate(
      { user1Id: pair[0], user2Id: pair[1] },
      { user1Id: pair[0], user2Id: pair[1], matchedSkills, score },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('user1Id user2Id', '-password');

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};

export const mySavedMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }]
    })
      .populate('user1Id user2Id', '-password')
      .sort({ updatedAt: -1 });
    res.json(matches);
  } catch (error) {
    next(error);
  }
};
