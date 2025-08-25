import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Status from '../models/Status.js';
import Note from '../models/Note.js';
import FollowUp from '../models/FollowUp.js';
import Attachment from '../models/Attachment.js';

const canSeeLead = (req, lead) => {
  const role = req.user.roleName;
  if (role === 'Admin' || role === 'Sales Head' || role === 'Sales Head Manager') return true;
  if (role === 'Sales Team Lead') {
    return lead.teamId && req.user.userId && String(lead.teamId.lead) === req.user.userId || 
           lead.assignedTo && String(lead.assignedTo._id || lead.assignedTo) === req.user.userId;
  }
  if (role === 'Sales Representative') {
    return lead.assignedTo && String(lead.assignedTo._id || lead.assignedTo) === req.user.userId;
  }
  return false;
};

export const listLeads = async (req, res) => {
  const role = req.user.roleName;
  const { status, q, assignedTo } = req.query;
  const filter = {};
  if (status) {
    const st = await Status.findOne({ name: status });
    if (st) filter.status = st._id;
  }
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') }
    ];
  }
  // Team Lead and Sales Rep should see all leads, same as Manager
// Helper to get Sales Head userId
async function getSalesHeadUserId() {
  const salesHead = await (await import('../models/User.js')).default.findOne({ roleName: 'Sales Head' });
  return salesHead?._id;
}
  if (assignedTo === 'me') filter.assignedTo = req.user.userId;

  const leads = await Lead.find(filter).populate('status').populate('assignedTo','name email').populate('teamId','name lead');
  // No filtering: all roles see all leads
  res.json(leads);
};

export const getLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate('status').populate('assignedTo','name email').populate('teamId','name lead');
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  if (!canSeeLead(req, lead)) return res.status(403).json({ error: 'Forbidden' });
  res.json(lead);
};

export const createLead = async (req, res) => {
  const { name, phone, email, city, source, assignedTo, teamId, statusName } = req.body;
  // Always use 'New' status if not provided
  let status = null;
  if (statusName) {
    status = await Status.findOne({ name: statusName });
  }
  if (!status) {
    status = await Status.findOne({ name: 'New' });
  }
  if (!status) return res.status(400).json({ error: 'Invalid status' });
  // Set createdBy to Sales Head's userId if creator is Sales Head
  let createdBy = undefined;
  if (req.user.roleName === 'Sales Head') {
    createdBy = req.user.userId;
  }
  const doc = await Lead.create({
    name, phone, email, city, source,
    assignedTo: assignedTo || undefined,
    teamId: teamId || undefined,
    status: status._id,
    history: [{ status: status._id, by: req.user.userId, at: new Date() }],
    ...(createdBy && { createdBy })
  });
  // Return the populated lead for frontend
  const populated = await Lead.findById(doc._id).populate('status').populate('assignedTo','name email').populate('teamId','name lead');
  res.status(201).json(populated);
};

export const updateLead = async (req, res) => {
  const role = req.user.roleName;
  let updates = { ...req.body };
  delete updates.history;
  delete updates.status;
  if (!(role === 'Admin' || role === 'Sales Head' || role === 'Sales Head Manager')) {
    // Only allow city update for other roles
    updates = { city: req.body.city };
  }
  const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
};

export const changeStatus = async (req, res) => {
  console.log('changeStatus called by user:', req.user);
  const { statusName, note } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  // permission: allow Admin, Sales Head, Sales Head Manager, Sales Team Lead, Sales Representative
  const role = req.user.roleName;
  if (!['Admin','Sales Head','Sales Head Manager','Sales Team Lead','Sales Representative'].includes(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const status = await Status.findOne({ name: statusName });
  if (!status) return res.status(400).json({ error: 'Invalid status' });
  lead.status = status._id;
  lead.history.push({ status: status._id, by: req.user.userId, at: new Date() });
  if (note) lead.notes.push(note);
  await lead.save();
  const populated = await Lead.findById(lead._id).populate('status');
  res.json(populated);
};

export const addNote = async (req, res) => {
  const { text } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  lead.notes.push(text);
  await lead.save();
  res.status(201).json({ ok: true });
};

export const createFollowUp = async (req, res) => {
  const { dueAt, notes, assignedTo } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const fu = await FollowUp.create({
    lead: lead._id,
    assignedTo: assignedTo || req.user.userId,
    dueAt,
    notes
  });
  res.status(201).json(fu);
};

export const listFollowUps = async (req, res) => {
  const items = await (await FollowUp.find({ lead: req.params.id }).populate('assignedTo','name email')).sort({ dueAt: 1 });
  res.json(items);
};

export const uploadAttachment = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  const doc = await (await import('../models/Attachment.js')).default.create({
    lead: req.params.id,
    fileUrl: url,
    fileName: req.file.originalname,
    uploadedBy: req.user.userId
  });
  res.status(201).json(doc);
};
