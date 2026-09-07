require('dotenv').config();

const defaultConfig = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/task_management_db',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  define: {
    timestamps: true,
    underscored: false
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

module.exports = {
  development: {
    ...defaultConfig,
    use_env_variable: 'DATABASE_URL'
  },
  test: {
    ...defaultConfig,
    url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/task_management_test_db'
  },
  production: {
    ...defaultConfig,
    use_env_variable: 'DATABASE_URL',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
};
