'use strict';

const bcrypt = require('bcryptjs');

const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111';
const CAT_WORK_ID = '22222222-2222-4222-8222-222222222222';
const CAT_DESIGN_ID = '33333333-3333-4333-8333-333333333333';
const CAT_PERSONAL_ID = '44444444-4444-4444-8444-444444444444';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);
    const now = new Date();

    // 1. Insert Demo User
    await queryInterface.bulkInsert('Users', [
      {
        id: DEMO_USER_ID,
        name: 'Demo User',
        email: 'demo@example.com',
        passwordHash: passwordHash,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // 2. Insert Categories
    await queryInterface.bulkInsert('Categories', [
      {
        id: CAT_WORK_ID,
        name: 'Work & Engineering',
        userId: DEMO_USER_ID,
        createdAt: now,
        updatedAt: now
      },
      {
        id: CAT_DESIGN_ID,
        name: 'Design & UI',
        userId: DEMO_USER_ID,
        createdAt: now,
        updatedAt: now
      },
      {
        id: CAT_PERSONAL_ID,
        name: 'Personal',
        userId: DEMO_USER_ID,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // 3. Insert Tasks
    await queryInterface.bulkInsert('Tasks', [
      {
        id: '55555555-5555-4555-8555-555555555551',
        title: 'Complete homepage UI',
        description: 'Design responsive layout with modern glassmorphism and clear KPI cards.',
        status: 'PENDING',
        userId: DEMO_USER_ID,
        categoryId: CAT_DESIGN_ID,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3)
      },
      {
        id: '55555555-5555-4555-8555-555555555552',
        title: 'Build authentication & JWT security',
        description: 'Implement token issuance, bcrypt password hashing, and user ownership middleware.',
        status: 'COMPLETED',
        userId: DEMO_USER_ID,
        categoryId: CAT_WORK_ID,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)
      },
      {
        id: '55555555-5555-4555-8555-555555555553',
        title: 'Create API documentation',
        description: 'Document endpoints, request parameters, validation rules, and error codes in README.',
        status: 'PENDING',
        userId: DEMO_USER_ID,
        categoryId: CAT_WORK_ID,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1)
      },
      {
        id: '55555555-5555-4555-8555-555555555554',
        title: 'Setup PostgreSQL database and migrations',
        description: 'Configure Sequelize models, associations, and migration scripts.',
        status: 'COMPLETED',
        userId: DEMO_USER_ID,
        categoryId: CAT_WORK_ID,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12)
      },
      {
        id: '55555555-5555-4555-8555-555555555555',
        title: 'Plan weekly groceries and exercise',
        description: 'Prepare meal plans and schedule morning workouts for the week.',
        status: 'PENDING',
        userId: DEMO_USER_ID,
        categoryId: CAT_PERSONAL_ID,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
