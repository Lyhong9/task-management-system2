const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const categoryRoutes = require('./category.routes');

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
