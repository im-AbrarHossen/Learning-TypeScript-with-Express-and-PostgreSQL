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
  res.send(
    "Hello World! I am learning TypeScript with Express and PostgreSQL.",
  );
});

//users CRUD operations
app.post("/users", async (req: express.Request, res: express.Response) => {
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`,
      [name, email],
    );
    //console.log(result.rows[0]);
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/users", async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// /users/:id
app.get("/users/:id", async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.put("/users/:id", async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *`,
      [name, email, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.delete(
  "/users/:id",
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING *`,
        [id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: result.rows[0],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// todos CRUD operations
app.post("/todos", async (req: express.Request, res: express.Response) => {
  const { user_id, title } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING *`,
      [user_id, title],
    );
    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/todos", async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query(`SELECT * FROM todos`);
    return res.status(200).json({
      success: true,
      message: "Todos retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// /todos/:id
app.get("/todos/:id", async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM todos WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Todo retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.put("/todos/:id", async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  try {
    const result = await pool.query(
      `UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *`,
      [title, completed, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.delete(
  "/todos/:id",
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `DELETE FROM todos WHERE id = $1 RETURNING *`,
        [id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Todo not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Todo deleted successfully",
        data: result.rows[0],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
