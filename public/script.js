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
let allExpenses = [];

amountInput.addEventListener("blur", () => {
  const value = amountInput.value.trim();

  if (value === "") return;

  amountInput.value = Number(value).toFixed(2);
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDateForInput(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
function enterEditMode() {
  formTitle.textContent = "Edit Expense";
  submitButton.textContent = "Update Expense";
  formCard.classList.add("editing");
}

function exitEditMode() {
  formTitle.textContent = "Add Expense";
  submitButton.textContent = "Save Expense";
  formCard.classList.remove("editing");
}

async function fetchExpenses() {
  const response = await fetch("/api/expenses");
  const expenses = await response.json();

  allExpenses = expenses;
  applyFilter();
  updateTotal(expenses);
}

function applyFilter() {
  const selectedCategory = categoryFilter.value;
  let filteredExpenses = allExpenses;

  if (selectedCategory !== "All") {
    filteredExpenses = allExpenses.filter((expense) => expense.category === selectedCategory);
  }

  renderExpenses(filteredExpenses);
}
categoryFilter.addEventListener("change", () => {
  applyFilter();
});

function renderExpenses(expenses) {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    expenseList.innerHTML = `
      <tr>
        <td colspan="6">No expenses found.</td>
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

function updateTotal(expenses) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  totalSpent.textContent = `$${total.toFixed(2)}`;
}

async function fetchCategorySummary() {
  const response = await fetch("/api/summary/category");
  const summary = await response.json();

  categorySummary.innerHTML = "";

  summary.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.category}: $${Number(item.total).toFixed(2)}`;
    categorySummary.appendChild(li);
  });
}

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
});

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
}

function resetForm() {
  form.reset();
  expenseIdInput.value = "";
  exitEditMode();
}

function showMessage(text, color) {
  message.textContent = text;
  message.style.color = color;

  setTimeout(() => {
    message.textContent = "";
  }, 3000);
}

cancelEditBtn.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled.", "gray");
});

fetchExpenses();
fetchCategorySummary();