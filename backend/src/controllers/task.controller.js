const { Op } = require('sequelize');
const { Task, Category } = require('../models');

const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      categoryId,
      sortBy = 'createdAt',
      order = 'DESC',
      search
    } = req.query;

    // Build where clause strictly scoped to authenticated user
    const where = {
      userId: req.user.id
    };

    // Filter by status
    if (status && ['PENDING', 'COMPLETED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    // Filter by category
    if (categoryId) {
      if (categoryId === 'unassigned' || categoryId === 'null') {
        where.categoryId = null;
      } else {
        where.categoryId = categoryId;
      }
    }

    // Search query on title or description
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.iLike]: searchPattern } },
        { description: { [Op.iLike]: searchPattern } }
      ];
    }

    // Validate and sanitize sorting options
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase())
      ? order.toUpperCase()
      : 'DESC';

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [[sortField, sortOrder]]
    });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status = 'PENDING', categoryId } = req.body;

    // If categoryId is provided, ensure it belongs to the authenticated user
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          userId: req.user.id
        }
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category: Category does not exist or does not belong to you',
          errors: {
            categoryId: 'Invalid category'
          }
        });
      }
    }

    const task = await Task.create({
      title,
      description: description || null,
      status,
      categoryId: categoryId || null,
      userId: req.user.id
    });

    // Reload task with Category association
    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, categoryId } = req.body;

    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // If updating categoryId, verify ownership
    if (categoryId !== undefined && categoryId !== null) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          userId: req.user.id
        }
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category: Category does not exist or does not belong to you',
          errors: {
            categoryId: 'Invalid category'
          }
        });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (categoryId !== undefined) task.categoryId = categoryId;

    await task.save();

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.destroy();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
