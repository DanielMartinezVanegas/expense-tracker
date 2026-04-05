# Expense Tracker SPA

## Project Summary
Expense Tracker SPA is a single-page web application that helps users record, manage, and review their personal expenses in one place. The website solves the problem of manually tracking spending by giving users a simple way to add, edit, delete, and view expense records without reloading the page. It also provides useful summaries, including total spending, category totals, and monthly totals, so users can better understand their spending habits over time. The goal of the project is to combine frontend, backend, and database features into one smooth and practical application that feels like a real-world expense tracking tool.

## Technical Stack
This project uses the following technologies:

- **Frontend:** HTML and JavaScript
- **Styling:** CSS
- **Backend / Routing:** Node.js with Express
- **Database:** MySQL
- **Environment Configuration:** dotenv
- **Package Management:** npm
- **Deployment:** Local development environment only

### How the stack is used
- **HTML** is used to build the structure of the page, including the form, summaries, filters, sorting controls, and expense table.
- **CSS** is used to style the interface and improve layout, readability, responsiveness, focus states, and edit mode feedback.
- **JavaScript** is used on the frontend to handle user interactions, fetch data from the backend, render expenses, apply filtering and sorting, and update summaries dynamically without reloading the page.
- **Express** is used to create backend API routes for CRUD operations and summary endpoints.
- **MySQL** is used to store expense data permanently in the `expenses` table.
- **dotenv** is used to store database connection details securely in a local `.env` file instead of hardcoding them.

## Features
- Single-page application structure
- Add new expenses
- View all expenses dynamically from the database
- Reuse of the same form for both adding and editing expenses
- Delete expenses
- View total amount spent
- View total spending by category
- View total spending by month
- Filter expenses by category
- Sort expenses by newest date, oldest date, highest amount, lowest amount, or title
- Automatic amount formatting to two decimal places
- Expense dates displayed in DD/MM/YYYY format in the table
- Form validation for required fields
- Success and error feedback messages
- Loading, empty, and error states for expense data
- Edit mode feedback with updated heading, button text, and highlighted form styling
- Responsive table layout for smaller screens
- Dynamic page updates without full page reloads

## Folder Structure
The project is organised into three main parts:

- **public/**  
  Contains the frontend files.
  - `index.html` builds the structure of the page
  - `style.css` controls the visual design, layout, responsive styling, and interactive states
  - `script.js` handles frontend logic, including fetching data, rendering expenses, formatting values, filtering, sorting, summaries, and form submission

- **server/**  
  Contains the backend files.
  - `server.js` starts the Express server and defines all API routes
  - `db.js` creates the MySQL database connection using environment variables

- **database/**  
  Contains the SQL setup file.
  - `expense_tracker.sql` creates the database, creates the expenses table, and inserts sample data

Other important files:
- `.gitignore` prevents unnecessary or sensitive files like `node_modules` and `.env` from being uploaded to GitHub
- `package.json` stores project metadata, dependencies, and scripts
- `README.md` explains the project and setup process

## CRUD Operations
This project includes all four CRUD operations:

- **Create:** users can add a new expense through the form
- **Read:** users can view all expenses stored in the database and displayed in the table
- **Update:** users can click Edit to load an expense back into the form, then save the updated values
- **Delete:** users can remove an expense from the database after confirming the action

## How the Application Works
The frontend and backend communicate using API routes. When the page loads, JavaScript fetches expense data from the Express backend and displays it in the table. The same data is then used for filtering and sorting on the frontend so the user can adjust what they see without reloading the page. When the user adds, edits, or deletes an expense, JavaScript sends the appropriate request to the backend, which updates the MySQL database. The summaries for total spent, category totals, and monthly totals are also refreshed automatically so the dashboard always reflects the latest data.

## How to Run the Project
1. Install Node.js and MySQL
2. Open the project folder in a terminal
3. Install dependencies:

```bash
npm install
```

4. Start MySQL

```bash
brew services start mysql
```

5. Open MySQL and run the SQL setup file:

```sql
SOURCE /full/path/to/database/expense_tracker.sql;
```

6. Create a `.env` file in the project root with:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=expense_tracker
```

7. Start the backend server:

```bash
npm start
```

8. Open the application in your browser:

```text
http://localhost:3000
```

## Challenges Overcome
One challenge in this project was setting up the MySQL connection correctly and making sure the `.env` file matched the local database configuration. Another challenge was connecting the frontend form to the backend API so that expenses could be added, edited, and deleted without reloading the page. Formatting values also required extra care, especially for currency amounts and date handling, because the display format and input format were not always the same. I also had to think carefully about how to reuse one form for both create and update operations while still giving the user clear visual feedback during edit mode. Adding filtering, sorting, and monthly summaries also required careful frontend logic so the data stayed accurate and the interface remained easy to use.

## Future Improvements
Possible future improvements include:
- user authentication
- exporting expense data to CSV
- chart-based visualisations for category and monthly trends
- advanced filtering by date range
- dark mode support
- deployment to a live hosting platform

## Author
Daniel Martinez