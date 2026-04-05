// Import the libraries needed for the backend server
const express = require("express");
const cors = require("cors");
const db = require("./db");

// Create the Express app and define the server port
const app = express();
const PORT = 3000;

// Middleware
// cors() allows requests between frontend and backend
// express.json() lets Express read JSON request bodies
// express.static("public") serves the frontend files from the public folder
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/*
  READ ALL EXPENSES
  This route returns every expense in the database.
  Expenses are sorted by newest date first, then newest id first.
*/
app.get("/api/expenses", (req, res) => {
  const sql = "SELECT * FROM expenses ORDER BY expense_date DESC, id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch expenses." });
    }

    res.json(results);
  });
});

/*
  READ ONE EXPENSE BY ID
  This route is used when the user clicks Edit.
  It fetches the selected expense so the form can be filled back in.
*/
app.get("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM expenses WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch expense." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.json(results[0]);
  });
});

/*
  CREATE NEW EXPENSE
  This route inserts a new expense into the database.
  Basic validation is included so required fields cannot be empty.
*/
app.post("/api/expenses", (req, res) => {
  const { title, category, amount, expense_date, description } = req.body;

  if (!title || !category || !amount || !expense_date) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  const sql = `
    INSERT INTO expenses (title, category, amount, expense_date, description)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, category, amount, expense_date, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to add expense." });
    }

    res.status(201).json({
      message: "Expense added successfully.",
      id: result.insertId
    });
  });
});

/*
  UPDATE EXISTING EXPENSE
  This route updates an existing expense using its id.
  The same frontend form is reused for both create and update operations.
*/
app.put("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const { title, category, amount, expense_date, description } = req.body;

  if (!title || !category || !amount || !expense_date) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  const sql = `
    UPDATE expenses
    SET title = ?, category = ?, amount = ?, expense_date = ?, description = ?
    WHERE id = ?
  `;

  db.query(sql, [title, category, amount, expense_date, description, id], (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to update expense." });
    }

    res.json({ message: "Expense updated successfully." });
  });
});

/*
  DELETE EXPENSE
  This route removes an expense from the database using its id.
*/
app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM expenses WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete expense." });
    }

    res.json({ message: "Expense deleted successfully." });
  });
});

/*
  CATEGORY SUMMARY
  This route groups expenses by category and returns the total spent in each category.
  It is used in the dashboard summary section.
*/
app.get("/api/summary/category", (req, res) => {
  const sql = `
    SELECT category, SUM(amount) AS total
    FROM expenses
    GROUP BY category
    ORDER BY total DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch category summary." });
    }

    res.json(results);
  });
});

/*
  MONTHLY SUMMARY
  This route groups expenses by month and returns the total for each month.
  It is used to show spending trends over time.
*/
app.get("/api/summary/monthly", (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(expense_date, '%Y-%m') AS month,
      SUM(amount) AS total
    FROM expenses
    GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
    ORDER BY month DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch monthly summary." });
    }

    res.json(results);
  });
});

/*
  START SERVER
  Starts the Express app and listens on port 3000.
*/
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});