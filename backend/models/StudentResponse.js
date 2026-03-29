const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentResponse = sequelize.define('StudentResponse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER },
  exam_id: { type: DataTypes.INTEGER },
  question_id: { type: DataTypes.INTEGER },
  selected_answer: { type: DataTypes.CHAR(1) },
  saved_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'Student_Responses', timestamps: false });

module.exports = StudentResponse;
