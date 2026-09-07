'use strict';

const bcrypt = require('bcryptjs');

const DEMO_USER_ID = 1;
const CAT_WORK_ID = 1;
const CAT_DESIGN_ID = 2;
const CAT_PERSONAL_ID = 3;

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
        id: 1,
        title: 'Complete homepage UI',
        description: 'Design responsive layout with modern glassmorphism and clear KPI cards.',
        status: 'PENDING',
        userId: DEMO_USER_ID,
        categoryId: CAT_DESIGN_ID,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3)
      },
      {
        id: 2,
        title: 'Build authentication & JWT security',
        description: 'Implement token issuance, bcrypt password hashing, and user ownership middleware.',
        status: 'COMPLETED',
        userId: DEMO_USER_ID,
        categoryId: CAT_WORK_ID,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)
      },
      {
        id: 3,
        title: 'Create API documentation',
        description: 'Document endpoints, request parameters, validation rules, and error codes in README.',
        status: 'PENDING',
        userId: DEMO_USER_ID,
        categoryId: CAT_WORK_ID,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1)
      },
      {
        id: 4,
        title: 'Setup PostgreSQL database and migrations',
        description: 'Configure Sequelize models, associations, and migration scripts.',
        status: 'COMPLETED',
        userId: DEMO_USER_ID,
        categoryId: CAT_WORK_ID,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12)
      },
      {
        id: 5,
        title: 'Plan weekly groceries and exercise',
        description: 'Prepare meal plans and schedule morning workouts for the week.',
        status: 'PENDING',
        userId: DEMO_USER_ID,
        categoryId: CAT_PERSONAL_ID,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // Reset Postgres sequences so subsequent auto-increment insertions start correctly after max ID
    await queryInterface.sequelize.query(`SELECT setval(pg_get_serial_sequence('"Users"', 'id'), coalesce(max(id), 1)) FROM "Users";`);
    await queryInterface.sequelize.query(`SELECT setval(pg_get_serial_sequence('"Categories"', 'id'), coalesce(max(id), 1)) FROM "Categories";`);
    await queryInterface.sequelize.query(`SELECT setval(pg_get_serial_sequence('"Tasks"', 'id'), coalesce(max(id), 1)) FROM "Tasks";`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
