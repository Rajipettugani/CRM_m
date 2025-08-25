import Role from '../models/Role.js';
export const listRoles = async (req, res) => {
  const roles = await Role.find().sort('name');
  res.json(roles);
};
