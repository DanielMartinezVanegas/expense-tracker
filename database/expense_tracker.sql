CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT
);

INSERT INTO expenses (title, category, amount, expense_date, description)
VALUES
('Groceries', 'Food', 45.90, '2026-03-01', 'Weekly supermarket shopping'),
('Bus Card', 'Transport', 25.00, '2026-03-03', 'Top up for travel'),
('Netflix', 'Entertainment', 18.99, '2026-03-05', 'Monthly subscription');