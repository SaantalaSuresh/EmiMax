const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5008;
const dbFile = path.join(__dirname, "taskmanagerApp.db");
let db = null;

app.use(express.json());

const initialization = async () => {
  try {
    db = await open({
      filename: dbFile,
      driver: sqlite3.Database,
    });
    await db.run(`CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    );`);
    await db.run(`CREATE TABLE IF NOT EXISTS Tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      status TEXT,
      assignee_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(assignee_id) REFERENCES Users(id)
    );`);
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
  }
};

initialization();

const authorizeToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];
  let token;
  if (authHeader !== undefined) {
    token = authHeader.split(" ")[1];
  }
  if (token === undefined) {
    response.status(401).send("Invalid JWT Token");
  } else {
    jwt.verify(token, "Epimax", async (error, payload) => {
      if (error) {
        response.status(401).send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
};

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const query = `SELECT * FROM Users WHERE username="${username}"`;
  const user = await db.get(query);
  if (user === undefined) {
    response.status(400).send("Invalid user");
  } else {
    const isMatched = await bcrypt.compare(password, user.password_hash);
    if (isMatched) {
      const payload = { username: username };
      const token = await jwt.sign(payload, "Epimax");
      response.send({ token });
      console.log(token);
    } else {
      response.status(400).send("Invalid password");
    }
  }
});

app.post("/register/", async (request, response) => {
  const { username, password } = request.body;
  const userQuery = `SELECT * FROM Users WHERE username='${username}'`;
  const userData = await db.get(userQuery);
  const passwordLength = password.length;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
  if (userData === undefined) {
    if (passwordLength > 6) {
      const insertUserQuery = `INSERT INTO Users (username, password_hash)
          VALUES ('${username}','${hashedPassword}') `;
      await db.run(insertUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400).send("Password is too short");
    }
  } else {
    response.status(400).send("User already exists");
  }
});

app.post("/tasks", authorizeToken, async (request, response) => {
  const { title, description, status, assignee_id } = request.body;
  const createTaskQuery = `
    INSERT INTO Tasks (title, description, status, assignee_id, created_at, updated_at)
    VALUES ('${title}', '${description}', '${status}', '${assignee_id}', datetime('now'), datetime('now'));
  `;
  await db.run(createTaskQuery);
  response.status(200).send("Task created successfully");
});

app.get("/tasks", authorizeToken, async (request, response) => {
  const getTasksQuery = `SELECT * FROM Tasks`;
  const tasks = await db.all(getTasksQuery);
  response.send(tasks);
});

app.get("/tasks/:id", authorizeToken, async (request, response) => {
  const { id } = request.params;
  const getTaskQuery = `SELECT * FROM Tasks WHERE id = '${id}'`;
  const task = await db.get(getTaskQuery);
  if (task) {
    response.send(task);
  } else {
    response.status(404).send("Task not found");
  }
});

app.put("/tasks/:id", authorizeToken, async (request, response) => {
  const { id } = request.params;
  const { title, description, status, assignee_id } = request.body;
  const updateTaskQuery = `
    UPDATE Tasks 
    SET title = '${title}', description = '${description}', status = '${status}', assignee_id = '${assignee_id}', updated_at = datetime('now')
    WHERE id = '${id}';
  `;
  await db.run(updateTaskQuery);
  response.send("Task updated successfully");
});

app.delete("/tasks/:id", authorizeToken, async (request, response) => {
  const { id } = request.params;
  const deleteTaskQuery = `DELETE FROM Tasks WHERE id = '${id}'`;
  await db.run(deleteTaskQuery);
  response.send("Task deleted successfully");
});

module.exports = app;
