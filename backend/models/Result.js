const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Result = sequelize.define('Result', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER },
  exam_id: { type: DataTypes.INTEGER },
  score: { type: DataTypes.INTEGER },
  submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'Results', timestamps: false });

module.exports = Result;
