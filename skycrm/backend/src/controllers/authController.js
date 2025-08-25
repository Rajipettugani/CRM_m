import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';

const signToken = (user) => {
  return jwt.sign({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    roleId: user.role?._id?.toString?.() || user.role.toString(),
    roleName: user.role?.name || user.roleName
  }, process.env.JWT_SECRET || 'change_me', { expiresIn: '12h' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate('role');
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email, roleName: user.role.name } });
};

export const register = async (req, res) => {
  const { name, email, password, roleName } = req.body;
  const role = await Role.findOne({ name: roleName });
  if (!role) return res.status(400).json({ error: 'Invalid role' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: role._id });
  res.status(201).json({ id: user._id });
};

export const listUsers = async (req, res) => {
  const users = await User.find().populate('role','name');
  res.json(users.map(u => ({ _id: u._id, name: u.name, email: u.email, roleName: u.role.name })));
};
