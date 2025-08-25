import Team from '../models/Team.js';
import User from '../models/User.js';

export const createTeam = async (req, res) => {
  const { name, leadId, memberIds } = req.body;
  const team = await Team.create({
    name,
    manager: req.user.userId,
    lead: leadId || undefined,
    members: memberIds || []
  });
  // Populate members, lead, and manager for instant UI update
  const populatedTeam = await Team.findById(team._id)
    .populate('lead', 'name email')
    .populate('manager', 'name email')
    .populate('members', 'name email');
  res.status(201).json(populatedTeam);
};

export const listTeams = async (req, res) => {
  const role = req.user.roleName;
  let filter = {};
  if (role === 'Sales Team Lead') filter = { lead: req.user.userId };
  if (role === 'Sales Representative') filter = { members: req.user.userId };
  const teams = await Team.find(filter).populate('lead','name email').populate('manager','name email').populate('members','name email');
  res.json(teams);
};

export const addMembers = async (req, res) => {
  const { id } = req.params;
  const { memberIds } = req.body;
  const team = await Team.findByIdAndUpdate(id, { $addToSet: { members: { $each: memberIds || [] } } }, { new: true });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
};

export const setLead = async (req, res) => {
  const { id } = req.params;
  const { leadId } = req.body;
  const team = await Team.findByIdAndUpdate(id, { lead: leadId }, { new: true });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
};
