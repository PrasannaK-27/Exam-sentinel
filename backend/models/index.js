const sequelize = require('../config/db');
const User = require('./User');
const Exam = require('./Exam');
const ExamEnrollment = require('./ExamEnrollment');
const Question = require('./Question');
const StudentResponse = require('./StudentResponse');
const ExamSession = require('./ExamSession');
const Result = require('./Result');
const ActivityLog = require('./ActivityLog');

// User <-> Exam (creator)
User.hasMany(Exam, { foreignKey: 'created_by', as: 'createdExams' });
Exam.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Exam <-> Students (enrollments)
Exam.belongsToMany(User, { through: ExamEnrollment, foreignKey: 'exam_id', otherKey: 'student_id', as: 'enrolledStudents' });
User.belongsToMany(Exam, { through: ExamEnrollment, foreignKey: 'student_id', otherKey: 'exam_id', as: 'enrolledExams' });
ExamEnrollment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
ExamEnrollment.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

// Exam <-> Questions
Exam.hasMany(Question, { foreignKey: 'exam_id', as: 'questions' });
Question.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

// Student Responses
User.hasMany(StudentResponse, { foreignKey: 'student_id' });
Exam.hasMany(StudentResponse, { foreignKey: 'exam_id' });
Question.hasMany(StudentResponse, { foreignKey: 'question_id' });
StudentResponse.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
StudentResponse.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
StudentResponse.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// Exam Sessions
User.hasMany(ExamSession, { foreignKey: 'student_id' });
Exam.hasMany(ExamSession, { foreignKey: 'exam_id' });
ExamSession.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
ExamSession.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

// Results
User.hasMany(Result, { foreignKey: 'student_id' });
Exam.hasMany(Result, { foreignKey: 'exam_id' });
Result.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Result.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

// Activity Logs
User.hasMany(ActivityLog, { foreignKey: 'student_id' });
Exam.hasMany(ActivityLog, { foreignKey: 'exam_id' });
ActivityLog.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
ActivityLog.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

module.exports = {
  sequelize,
  User,
  Exam,
  ExamEnrollment,
  Question,
  StudentResponse,
  ExamSession,
  Result,
  ActivityLog,
};
