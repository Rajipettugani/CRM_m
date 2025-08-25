import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sky_crm';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: undefined });
  console.log('MongoDB connected');
};

export default connectDB;
