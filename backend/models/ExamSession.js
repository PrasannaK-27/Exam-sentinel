const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExamSession = sequelize.define('ExamSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  exam_id: { type: DataTypes.INTEGER, allowNull: false },
  started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  ended_at: { type: DataTypes.DATE, allowNull: true },
  status: {
    type: DataTypes.ENUM('IN_PROGRESS', 'COMPLETED', 'TERMINATED'),
    defaultValue: 'IN_PROGRESS',
  },
  violation_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'Exam_Sessions', timestamps: false });

module.exports = ExamSession;
