const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Question = sequelize.define('Question', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  exam_id: { type: DataTypes.INTEGER, allowNull: true },
  question_text: { type: DataTypes.TEXT, allowNull: false },
  option_a: { type: DataTypes.STRING(255) },
  option_b: { type: DataTypes.STRING(255) },
  option_c: { type: DataTypes.STRING(255) },
  option_d: { type: DataTypes.STRING(255) },
  correct_answer: { type: DataTypes.CHAR(1) },
}, { tableName: 'Questions', timestamps: false });

module.exports = Question;
