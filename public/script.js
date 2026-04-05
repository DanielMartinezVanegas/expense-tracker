// =========================
// DOM ELEMENT REFERENCES
// =========================
// These variables store references to important HTML elements
// so the script can read user input and update the page dynamically.
const form = document.getElementById("expense-form");
const expenseIdInput = document.getElementById("expense-id");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("expense_date");
const descriptionInput = document.getElementById("description");
const expenseList = document.getElementById("expense-list");
const totalSpent = document.getElementById("total-spent");
const categorySummary = document.getElementById("category-summary");
const message = document.getElementById("message");
const cancelEditBtn = document.getElementById("cancel-edit");
const formCard = document.getElementById("form-card");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const categoryFilter = document.getElementById("category-filter");
const sortExpenses = document.getElementById("sort-expenses");
const monthlySummary = document.getElementById("monthly-summary");

// =========================
// STATE VARIABLES
// =========================
// allExpenses stores the current full expense list from the backend.
// isLoading tracks whether data is still being fetched.
// currentError stores any fetch error that should be shown to the user.
let allExpenses = [];
let isLoading = false;
let currentError = "";

/*
  FORMAT AMOUNT INPUT
  When the user leaves the amount field, format the value to 2 decimal places.
  Example: 17 becomes 17.00
*/
amountInput.addEventListener("blur", () => {
  const value = amountInput.value.trim();

  if (value === "") return;

  amountInput.value = Number(value).toFixed(2);
});

/*
  FORMAT DATE FOR DISPLAY
  Converts a database date into DD/MM/YYYY for the table.
*/
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/*
  FORMAT DATE FOR INPUT
  Converts a date into YYYY-MM-DD so it works correctly with <input type="date">.
  This is needed when loading an expense back into the form for editing.
*/
function formatDateForInput(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
  FORMAT MONTH LABEL
  Converts a backend month string like 2026-03 into a readable label like March 2026.
*/
function formatMonthLabel(monthString) {
  const [year, month] = monthString.split("-");
  const date = new Date(year, month - 1);

  return date.toLocaleString("en-AU", {
    month: "long",
    year: "numeric",
  });
}

/*
  ENTER EDIT MODE
  Updates the form heading, submit button text, and card styling
  so the user can clearly see that they are editing an existing record.
*/
function enterEditMode() {
  formTitle.textContent = "Edit Expense";
  submitButton.textContent = "Update Expense";
  formCard.classList.add("editing");
}

/*
  EXIT EDIT MODE
  Restores the form to its normal create state.
*/
function exitEditMode() {
  formTitle.textContent = "Add Expense";
  submitButton.textContent = "Save Expense";
  formCard.classList.remove("editing");
}

/*
  FETCH ALL EXPENSES
  Requests all expenses from the backend, updates the local state,
  and then applies the active filter and sort settings.
*/
async function fetchExpenses() {
  isLoading = true;
  currentError = "";
  allExpenses = [];
  applyFilter();
  updateTotal([]);

  try {
    const response = await fetch("/api/expenses");

    if (!response.ok) {
      throw new Error("Unable to load expenses.");
    }

    const expenses = await response.json();

    allExpenses = expenses;
    isLoading = false;
    currentError = "";
    applyFilter();
    updateTotal(expenses);
  } catch (error) {
    isLoading = false;
    currentError = "Unable to load expenses. Please try again.";
    allExpenses = [];
    applyFilter();
    updateTotal([]);
  }
}

/*
  APPLY FILTER AND SORT
  Filters expenses by category, then sorts the filtered results
  based on the current sort dropdown.
*/
function applyFilter() {
  if (isLoading || currentError) {
    renderExpenses([]);
    return;
  }

  const selectedCategory = categoryFilter.value;

  let filteredExpenses =
    selectedCategory === "All"
      ? [...allExpenses]
      : allExpenses.filter((expense) => expense.category === selectedCategory);

  const sortValue = sortExpenses.value;

  if (sortValue === "newest") {
    filteredExpenses.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  } else if (sortValue === "oldest") {
    filteredExpenses.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date));
  } else if (sortValue === "highest") {
    filteredExpenses.sort((a, b) => Number(b.amount) - Number(a.amount));
  } else if (sortValue === "lowest") {
    filteredExpenses.sort((a, b) => Number(a.amount) - Number(b.amount));
  } else if (sortValue === "title") {
    filteredExpenses.sort((a, b) => a.title.localeCompare(b.title));
  }

  renderExpenses(filteredExpenses);
}

/*
  RENDER EXPENSE TABLE
  Displays the loading state, error state, empty state,
  or the full list of expenses in the table.
*/
function renderExpenses(expenses) {
  expenseList.innerHTML = "";

  if (isLoading) {
    expenseList.innerHTML = `
      <tr>
        <td colspan="6">Loading expenses...</td>
      </tr>
    `;
    return;
  }

  if (currentError) {
    expenseList.innerHTML = `
      <tr>
        <td colspan="6">${currentError}</td>
      </tr>
    `;
    return;
  }

  if (expenses.length === 0) {
    const selectedCategory = categoryFilter.value;

    expenseList.innerHTML = `
      <tr>
        <td colspan="6">
          ${
            selectedCategory === "All"
              ? "No expenses found."
              : `No expenses found in the ${selectedCategory} category.`
          }
        </td>
      </tr>
    `;
    return;
  }

  expenses.forEach((expense) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${expense.title}</td>
      <td>${expense.category}</td>
      <td>$${Number(expense.amount).toFixed(2)}</td>
      <td>${formatDate(expense.expense_date)}</td>
      <td>${expense.description || ""}</td>
      <td>
        <button class="edit-btn" onclick="editExpense(${expense.id})">Edit</button>
        <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
      </td>
    `;

    expenseList.appendChild(row);
  });
}

/*
  UPDATE TOTAL SPENT
  Calculates the total amount from the currently fetched expense list
  and displays it in the summary card.
*/
function updateTotal(expenses) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  totalSpent.textContent = `$${total.toFixed(2)}`;
}

/*
  FETCH CATEGORY SUMMARY
  Gets grouped totals by category from the backend
  and displays them in the summary section.
*/
async function fetchCategorySummary() {
  categorySummary.innerHTML = "";
  const loadingItem = document.createElement("li");
  loadingItem.textContent = "Loading category summary...";
  categorySummary.appendChild(loadingItem);

  try {
    const response = await fetch("/api/summary/category");

    if (!response.ok) {
      throw new Error("Failed to load category summary.");
    }

    const summary = await response.json();

    categorySummary.innerHTML = "";

    if (summary.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No category summary available.";
      categorySummary.appendChild(li);
      return;
    }

    summary.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.category}: $${Number(item.total).toFixed(2)}`;
      categorySummary.appendChild(li);
    });
  } catch (error) {
    categorySummary.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = "Unable to load category summary.";
    categorySummary.appendChild(li);
  }
}

/*
  FETCH MONTHLY SUMMARY
  Gets grouped totals by month from the backend
  and displays them in the summary section.
*/
async function fetchMonthlySummary() {
  monthlySummary.innerHTML = "<p>Loading monthly summary...</p>";

  try {
    const response = await fetch("/api/summary/monthly");

    if (!response.ok) {
      throw new Error("Failed to load monthly summary.");
    }

    const summary = await response.json();

    monthlySummary.innerHTML = "";

    if (summary.length === 0) {
      monthlySummary.innerHTML = "<p>No monthly summary available.</p>";
      return;
    }

    // Find the largest monthly total so bar widths can be scaled proportionally
    const maxTotal = Math.max(...summary.map((item) => Number(item.total)));

    summary.forEach((item) => {
      const total = Number(item.total);
      const percent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

      const chartRow = document.createElement("div");
      chartRow.classList.add("chart-row");

      chartRow.innerHTML = `
        <div class="chart-label">${formatMonthLabel(item.month)}</div>
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="width: ${percent}%"></div>
        </div>
        <div class="chart-value">$${total.toFixed(2)}</div>
      `;

      monthlySummary.appendChild(chartRow);
    });
  } catch (error) {
    monthlySummary.innerHTML = "<p>Unable to load monthly summary.</p>";
  }
}
/*
  FORM SUBMISSION
  Handles both create and update actions.
  If an expense id exists, the request updates that record.
  If no id exists, the request creates a new one.
*/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expenseData = {
    title: titleInput.value.trim(),
    category: categoryInput.value,
    amount: amountInput.value,
    expense_date: dateInput.value,
    description: descriptionInput.value.trim(),
  };

  if (!expenseData.title || !expenseData.category || !expenseData.amount || !expenseData.expense_date) {
    showMessage("Please fill in all required fields.", "red");
    return;
  }

  const id = expenseIdInput.value;
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/expenses/${id}` : "/api/expenses";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  const result = await response.json();

  if (!response.ok) {
    showMessage(result.error || "Something went wrong.", "red");
    return;
  }

  showMessage(result.message, "green");
  resetForm();
  fetchExpenses();
  fetchCategorySummary();
  fetchMonthlySummary();
});

/*
  EDIT EXPENSE
  Fetches a single expense and loads its values back into the form.
  This allows the user to update an existing record.
*/
async function editExpense(id) {
  const response = await fetch(`/api/expenses/${id}`);
  const expense = await response.json();

  expenseIdInput.value = expense.id;
  titleInput.value = expense.title;
  categoryInput.value = expense.category;
  amountInput.value = Number(expense.amount).toFixed(2);
  dateInput.value = formatDateForInput(expense.expense_date);
  descriptionInput.value = expense.description || "";

  enterEditMode();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/*
  DELETE EXPENSE
  Confirms with the user first, then removes the selected expense.
  After deletion, the summaries and list are refreshed.
*/
async function deleteExpense(id) {
  const confirmed = confirm("Are you sure you want to delete this expense?");
  if (!confirmed) return;

  const response = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    showMessage(result.error || "Failed to delete expense.", "red");
    return;
  }

  showMessage(result.message, "green");
  fetchExpenses();
  fetchCategorySummary();
  fetchMonthlySummary();
}

/*
  RESET FORM
  Clears the form and exits edit mode.
*/
function resetForm() {
  form.reset();
  expenseIdInput.value = "";
  exitEditMode();
}

/*
  SHOW FEEDBACK MESSAGE
  Displays a short success or error message for the user,
  then clears it after a few seconds.
*/
function showMessage(text, color) {
  message.textContent = text;
  message.style.color = color;

  message.classList.remove("success", "error", "neutral");

  if (color === "green") {
    message.classList.add("success");
  } else if (color === "red") {
    message.classList.add("error");
  } else {
    message.classList.add("neutral");
  }

  setTimeout(() => {
    message.textContent = "";
    message.classList.remove("success", "error", "neutral");
  }, 3000);
}

/*
  SORT CHANGE LISTENER
  Re-renders the expense list when the sort option changes.
*/
sortExpenses.addEventListener("change", () => {
  applyFilter();
});

/*
  FILTER CHANGE LISTENER
  Re-renders the expense list when the category filter changes.
*/
categoryFilter.addEventListener("change", () => {
  applyFilter();
});

/*
  CANCEL EDIT LISTENER
  Resets the form and returns it to normal create mode.
*/
cancelEditBtn.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled.", "gray");
});

/*
  INITIAL PAGE LOAD
  Fetch the main expense list and both summary sections
  as soon as the page opens.
*/
fetchExpenses();
fetchCategorySummary();
fetchMonthlySummary();