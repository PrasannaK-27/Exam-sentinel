const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExamEnrollment = sequelize.define('ExamEnrollment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  exam_id: { type: DataTypes.INTEGER, allowNull: false },
  enrolled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'Exam_Enrollments',
  timestamps: false,
  indexes: [{ unique: true, fields: ['student_id', 'exam_id'] }],
});

module.exports = ExamEnrollment;
