const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const {
  createCategorySchema,
  updateCategorySchema
} = require('../validators/category.validator');

// All category routes require authentication
router.use(authenticateToken);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', validateRequest(createCategorySchema), categoryController.createCategory);
router.patch('/:id', validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
