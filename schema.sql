-- ============================================================
-- ExamSentinel — MySQL Schema
-- Run this BEFORE starting the backend for the first time,
-- OR let Sequelize auto-create via `sequelize.sync({ alter: true })`.
-- ============================================================

CREATE DATABASE IF NOT EXISTS examsentinel_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE examsentinel_db;

-- ─────────────────────────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Users (
  id                  INT           AUTO_INCREMENT PRIMARY KEY,
  username            VARCHAR(100)  NOT NULL,
  email               VARCHAR(150)  NOT NULL UNIQUE,
  password_hash       VARCHAR(255)  NOT NULL,
  role                ENUM('ADMIN','STUDENT','QUESTION_MANAGER') NOT NULL,
  reset_token         VARCHAR(255)  DEFAULT NULL,
  reset_token_expires DATETIME      DEFAULT NULL,
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 2. EXAMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Exams (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  duration    INT          NOT NULL COMMENT 'Duration in minutes',
  created_by  INT          DEFAULT NULL,
  CONSTRAINT fk_exams_creator
    FOREIGN KEY (created_by) REFERENCES Users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 3. EXAM ENROLLMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Exam_Enrollments (
  id          INT       AUTO_INCREMENT PRIMARY KEY,
  student_id  INT       NOT NULL,
  exam_id     INT       NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enroll_student
    FOREIGN KEY (student_id) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_enroll_exam
    FOREIGN KEY (exam_id) REFERENCES Exams(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, exam_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 4. QUESTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Questions (
  id              INT          AUTO_INCREMENT PRIMARY KEY,
  exam_id         INT          DEFAULT NULL,
  question_text   TEXT         NOT NULL,
  option_a        VARCHAR(255) DEFAULT NULL,
  option_b        VARCHAR(255) DEFAULT NULL,
  option_c        VARCHAR(255) DEFAULT NULL,
  option_d        VARCHAR(255) DEFAULT NULL,
  correct_answer  CHAR(1)      DEFAULT NULL COMMENT 'A, B, C, or D',
  CONSTRAINT fk_questions_exam
    FOREIGN KEY (exam_id) REFERENCES Exams(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 5. STUDENT RESPONSES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Student_Responses (
  id               INT    AUTO_INCREMENT PRIMARY KEY,
  student_id       INT    DEFAULT NULL,
  exam_id          INT    DEFAULT NULL,
  question_id      INT    DEFAULT NULL,
  selected_answer  CHAR(1) DEFAULT NULL,
  saved_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resp_student
    FOREIGN KEY (student_id) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_resp_exam
    FOREIGN KEY (exam_id) REFERENCES Exams(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_resp_question
    FOREIGN KEY (question_id) REFERENCES Questions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 6. EXAM SESSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Exam_Sessions (
  id               INT  AUTO_INCREMENT PRIMARY KEY,
  student_id       INT  NOT NULL,
  exam_id          INT  NOT NULL,
  started_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at         TIMESTAMP NULL DEFAULT NULL,
  status           ENUM('IN_PROGRESS','COMPLETED','TERMINATED') DEFAULT 'IN_PROGRESS',
  violation_count  INT DEFAULT 0,
  CONSTRAINT fk_session_student
    FOREIGN KEY (student_id) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_session_exam
    FOREIGN KEY (exam_id) REFERENCES Exams(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 7. RESULTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Results (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT DEFAULT NULL,
  exam_id       INT DEFAULT NULL,
  score         INT DEFAULT NULL,
  submitted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_result_student
    FOREIGN KEY (student_id) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_result_exam
    FOREIGN KEY (exam_id) REFERENCES Exams(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 8. ACTIVITY LOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Activity_Logs (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  student_id  INT           DEFAULT NULL,
  exam_id     INT           DEFAULT NULL,
  action      VARCHAR(100)  NOT NULL,
  detail      TEXT          DEFAULT NULL,
  timestamp   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_student
    FOREIGN KEY (student_id) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_log_exam
    FOREIGN KEY (exam_id) REFERENCES Exams(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 9. EXPRESS-MYSQL-SESSION (auto-created by the package,
--    included here for reference)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  session_id  VARCHAR(128) NOT NULL,
  expires     INT(11)      UNSIGNED NOT NULL,
  data        MEDIUMTEXT,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- Verify tables created
-- ─────────────────────────────────────────────────────────────
SHOW TABLES;
