import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import roleRoutes from './routes/roles.js';
import statusRoutes from './routes/statuses.js';
import leadRoutes from './routes/leads.js';
import teamRoutes from './routes/team.js';
import statsRoutes from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

app.get('/api/health', (req,res) => res.json({ ok: true, service: 'skycrm-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/stats', statsRoutes);

// 404
app.use((req,res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
