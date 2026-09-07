const { z } = require('zod');

const categoryIdPreprocessor = (val) => {
  if (val === '' || val === undefined || val === 'null' || val === null) {
    return null;
  }
  const parsed = Number(val);
  return isNaN(parsed) ? val : parsed;
};

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .nullable(),
  status: z
    .enum(['PENDING', 'COMPLETED'], {
      errorMap: () => ({ message: "Status must be either 'PENDING' or 'COMPLETED'" })
    })
    .optional()
    .default('PENDING'),
  categoryId: z.preprocess(
    categoryIdPreprocessor,
    z
      .number({ invalid_type_error: 'Invalid category ID format' })
      .int()
      .positive('Category ID must be a positive integer')
      .nullable()
      .optional()
  )
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .nullable(),
  status: z
    .enum(['PENDING', 'COMPLETED'], {
      errorMap: () => ({ message: "Status must be either 'PENDING' or 'COMPLETED'" })
    })
    .optional(),
  categoryId: z.preprocess(
    categoryIdPreprocessor,
    z
      .number({ invalid_type_error: 'Invalid category ID format' })
      .int()
      .positive('Category ID must be a positive integer')
      .nullable()
      .optional()
  )
});

module.exports = {
  createTaskSchema,
  updateTaskSchema
};
