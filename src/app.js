const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

require('./config/db');

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inspections', require('./routes/inspectionRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Automotive Inspection API running' });
});

module.exports = app;