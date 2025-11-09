const form = document.getElementById("transaction-form");
const desc = document.getElementById("desc");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const list = document.getElementById("transactions");
const incomeEl = document.getElementById("income");
const expensesEl = document.getElementById("expenses");
const balanceEl = document.getElementById("balance");
const filter = document.getElementById("filter");
const themeBtn = document.getElementById("toggle-theme");
const chartCanvas = document.getElementById("categoryChart");

let transactions = [];
let chart;

// Load saved transactions
function loadData() {
  const data = localStorage.getItem("transactions");
  if (data) {
    transactions = JSON.parse(data);
    updateUI();
  }
}

// Save transactions
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Add transaction
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = desc.value;
  const amt = +amount.value;
  const cat = category.value;

  const transaction = {
    id: Date.now(),
    text,
    amt,
    category: cat,
  };

  transactions.push(transaction);
  updateUI();
  desc.value = "";
  amount.value = "";
  category.value = "General";
});

// Delete transaction
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  updateUI();
}

// Update UI
function updateUI() {
  list.innerHTML = "";
  let income = 0, expenses = 0;
  const selected = filter.value;

  transactions
    .filter((t) => selected === "All" || t.category === selected)
    .forEach((t) => {
      const li = document.createElement("li");
      li.textContent = `${t.text} (${t.category}): ₹${t.amt}`;
      li.style.borderColor = t.amt > 0 ? "green" : "red";

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.onclick = () => deleteTransaction(t.id);
      li.appendChild(delBtn);

      list.appendChild(li);

      if (t.amt > 0) income += t.amt;
      else expenses += t.amt;
    });

  incomeEl.textContent = income;
  expensesEl.textContent = Math.abs(expenses);
  balanceEl.textContent = income + expenses;

  saveData();
  renderChart();
}

// Render Chart
function renderChart() {
  const categoryTotals = {};

  transactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amt;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const backgroundColors = labels.map(cat =>
    cat === "Food" ? "#ff6384" :
    cat === "Rent" ? "#36a2eb" :
    cat === "Shopping" ? "#ffce56" :
    "#4bc0c0"
  );

  const config = {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'Category Totals',
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, config);
}

// Theme toggle
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Filter change
filter.addEventListener("change", updateUI);

// Initialize
loadData();