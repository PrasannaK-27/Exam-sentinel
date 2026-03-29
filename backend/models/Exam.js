const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Exam = sequelize.define('Exam', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false, comment: 'Duration in minutes' },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'Exams', timestamps: false });

module.exports = Exam;
