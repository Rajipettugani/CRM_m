import mongoose from 'mongoose';
const RoleSchema = new mongoose.Schema({
  name: { type: String, enum: ['Admin','Sales Head','Sales Team Lead','Sales Representative'], unique: true, required: true }
}, { timestamps: true });
export default mongoose.model('Role', RoleSchema);
