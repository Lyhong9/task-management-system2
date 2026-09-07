const { Category, Task, sequelize } = require('../models');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)::int
              FROM "Tasks" AS t
              WHERE t."categoryId" = "Category"."id"
            )`),
            'taskCount'
          ]
        ]
      },
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: {
        id,
        userId: req.user.id
      },
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'createdAt']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Check if category name already exists for this user
    const existing = await Category.findOne({
      where: {
        name,
        userId: req.user.id
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A category with this name already exists',
        errors: {
          name: 'Category name must be unique'
        }
      });
    }

    const category = await Category.create({
      name,
      userId: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        ...category.toJSON(),
        taskCount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if another category with the same name exists for this user
    const duplicate = await Category.findOne({
      where: {
        name,
        userId: req.user.id
      }
    });

    if (duplicate && duplicate.id !== id) {
      return res.status(409).json({
        success: false,
        message: 'Another category with this name already exists',
        errors: {
          name: 'Category name must be unique'
        }
      });
    }

    category.name = name;
    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.destroy();

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
