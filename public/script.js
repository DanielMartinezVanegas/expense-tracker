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
let allExpenses = [];
let isLoading = false;
let currentError = "";

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
function formatMonthLabel(monthString) {
  const [year, month] = monthString.split("-");
  const date = new Date(year, month - 1);

  return date.toLocaleString("en-AU", {
    month: "long",
    year: "numeric",
  });
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

function updateTotal(expenses) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  totalSpent.textContent = `$${total.toFixed(2)}`;
}

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

async function fetchMonthlySummary() {
  monthlySummary.innerHTML = "";
  const loadingItem = document.createElement("li");
  loadingItem.textContent = "Loading monthly summary...";
  monthlySummary.appendChild(loadingItem);

  try {
    const response = await fetch("/api/summary/monthly");

    if (!response.ok) {
      throw new Error("Failed to load monthly summary.");
    }

    const summary = await response.json();

    monthlySummary.innerHTML = "";

    if (summary.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No monthly summary available.";
      monthlySummary.appendChild(li);
      return;
    }

    summary.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${formatMonthLabel(item.month)}: $${Number(item.total).toFixed(2)}`;
      monthlySummary.appendChild(li);
    });
  } catch (error) {
    monthlySummary.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = "Unable to load monthly summary.";
    monthlySummary.appendChild(li);
  }
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
  fetchMonthlySummary();
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
  fetchMonthlySummary();
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
sortExpenses.addEventListener("change", () => {
  applyFilter();
});

categoryFilter.addEventListener("change", () => {
  applyFilter();
});



cancelEditBtn.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled.", "gray");
});

fetchExpenses();
fetchCategorySummary();
fetchMonthlySummary();