import pg from "pg";
import { ENV } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: ENV.POSTGRES_URI,
});

if (!ENV.POSTGRES_URI) {
    console.error("CRITICAL ERROR: POSTGRES_URI is not defined in environment variables!");
} else {
    console.log("PostgreSQL Pool initialized with URI length:", ENV.POSTGRES_URI.length);
}

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
