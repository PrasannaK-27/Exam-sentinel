const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER },
  exam_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING(100), allowNull: false },
  detail: { type: DataTypes.TEXT },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'Activity_Logs', timestamps: false });

module.exports = ActivityLog;
