import { query, pool } from "../lib/postgres.js";

const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      profile_pic TEXT DEFAULT '',
      phone VARCHAR(50) UNIQUE NOT NULL,
      dob DATE NOT NULL,
      sex VARCHAR(10) CHECK (sex IN ('male', 'female')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Users table created successfully");
  } catch (error) {
    console.error("Error creating users table:", error);
  } finally {
    pool.end();
  }
};

createUsersTable();
