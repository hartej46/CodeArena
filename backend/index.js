const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const runRoutes = require('./src/routes/runRoutes');

dotenv.config();

const app = express();

// Body Parser Middleware
app.use(express.json());

// Enable CORS for frontend integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Root & Health
app.get('/', (req, res) => {
  res.json({
    name: 'CodeArena API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/google, POST /api/auth/login, POST /api/auth/register, GET /api/auth/me',
      chat: 'POST /api/ai/chat',
      evaluate: 'POST /api/ai/evaluate',
      run: 'POST /api/run',
      submit: 'POST /api/submit',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', runRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`CodeArena backend running on port: ${port}`);
});