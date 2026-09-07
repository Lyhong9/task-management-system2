const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const {
  createTaskSchema,
  updateTaskSchema
} = require('../validators/task.validator');

// All task routes require authentication
router.use(authenticateToken);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validateRequest(createTaskSchema), taskController.createTask);
router.patch('/:id', validateRequest(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
