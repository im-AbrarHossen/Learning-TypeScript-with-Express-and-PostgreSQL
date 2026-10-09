import express = require("express");
import pg = require("pg");
import dotenv = require("dotenv");
import path = require("path");

dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();
const port = 8000;

// parser
app.use(express.json());

//DB
const pool = new pg.Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      age INT,
      phone VARCHAR(15),
      address TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      due_date DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

initDB();

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World! I am learning TypeScript with Express and PostgreSQL.");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
