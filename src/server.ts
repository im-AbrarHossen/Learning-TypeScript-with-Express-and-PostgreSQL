import express, { Request, Response } from "express";
import config from "./config";
import initDB, { pool } from "./config/db";
import logger from "./middleware/logger";
import { userRoutes } from "./modules/user/user.routes";

const app = express();
const port = config.port;

// parser
app.use(express.json());

// initialize database
initDB();

// logger middleware
app.get("/", logger, (req: Request, res: Response) => {
  res.send(
    "Hello frieds! How are you? Come on, let's learn TypeScript with Express and PostgreSQL.",
  );
});

//users CRUD operations
app.use("/users", userRoutes);

// todos CRUD operations
app.post("/todos", async (req: Request, res: Response) => {
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

app.get("/todos", async (req: Request, res: Response) => {
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
app.get("/todos/:id", async (req: Request, res: Response) => {
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

app.put("/todos/:id", async (req: Request, res: Response) => {
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

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
