-- Remove existing tables if they exist
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS logged_hours;
DROP TABLE IF EXISTS FlashcardSet;
DROP TABLE IF EXISTS Flashcard;
DROP TABLE IF EXISTS Folders;

-- Create user table with username as the primary key
-- The number in the badge key refers to how many and what badge they have. i.e badges are linear in progression
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  badge INTEGER       -- badge level/progress
);

-- Table to store user-defined courses
CREATE TABLE course (
  user_username TEXT NOT NULL,  -- Reference to the username of the user
  course_name TEXT NOT NULL,    -- Course name
  PRIMARY KEY (user_username, course_name),  -- Composite primary key to ensure uniqueness
  FOREIGN KEY (user_username) REFERENCES user(username)
);

-- Table to log hours spent by users on courses
CREATE TABLE logged_hours (
  user_username TEXT NOT NULL,         -- Reference to the username of the user
  course_name TEXT NOT NULL,           -- Course name
  hours DECIMAL(5, 2) NOT NULL,        -- Hours logged
  week_number INTEGER DEFAULT 0,       -- Week number (default is 0)
  log_date DATE NOT NULL,              -- Date of logging
  FOREIGN KEY (user_username, course_name) REFERENCES course(user_username, course_name) -- Composite foreign key
);

CREATE TABLE FlashcardSet (
  set_id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_name TEXT NOT NULL,
  user_username TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  FOREIGN KEY (user_username) REFERENCES user(user_username) ON DELETE CASCADE,
  FOREIGN KEY (folder_name) REFERENCES Folders(folder_name) ON DELETE CASCADE
  -- if a user is deleted, their sets are automatically deleted
);

CREATE TABLE Flashcard (
  flashcard_id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_id INTEGER NOT NULL,
  place INTEGER NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  FOREIGN KEY (set_id) REFERENCES FlashcardSet(set_id) ON DELETE CASCADE,
  UNIQUE (set_id, place) -- Prevents duplicate card positions in a single set
);


-- Table for flashcard folders
CREATE TABLE Folders (
  folder_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_username TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  FOREIGN KEY (user_username) REFERENCES user(user_username) ON DELETE CASCADE
);