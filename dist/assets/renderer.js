const inventoryList = document.getElementById("inventoryList");
const searchResults = document.getElementById("searchResults");
const cartList = document.getElementById("cartList");
const totalAmount = document.getElementById("totalAmount");
const transactionHistoryDisplay = document.getElementById("transactionHistoryDisplay");

let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
let cart = [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = localStorage.getItem("currentUser") || null;

// Initialize the app based on user login status
function initializeApp() {
    if (currentUser) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("signupPage").style.display = "none";
        document.getElementById("mainApp").style.display = "block";
        showPage("cartPage"); // Redirect to cart after login

        // Load user-specific inventory and transactions
        loadUserData();
    } else {
        document.getElementById("loginPage").style.display = "block";
        document.getElementById("signupPage").style.display = "none";
        document.getElementById("mainApp").style.display = "none";
    }
}

// Show only the selected page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    highlightActiveTab(pageId);
}

// Handle navigation bar active tab highlighting
function highlightActiveTab(pageId) {
    const navLinks = document.querySelectorAll('.sidebar li');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.getElementById(pageId + 'Link');
    if (activeLink) activeLink.classList.add('active');
}

// Login function with improved UX
function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        currentUser = username;
        localStorage.setItem("currentUser", username);
        localStorage.setItem("loginTime", new Date().toLocaleString());

        loadUserData();  // Load user-specific data
        initializeApp();
    } else {
        alert("Invalid credentials. Please try again.");
    }
}


// Sign-up function
function signup() {
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (username && password) {
        if (users.some(user => user.username === username)) {
            alert("Username already exists. Please choose another.");
            return;
        }

        users.push({ username, password });
        localStorage.setItem("users", JSON.stringify(users));

        // Create separate storage for new user
        localStorage.setItem(`inventory_${username}`, JSON.stringify([]));
        localStorage.setItem(`transactions_${username}`, JSON.stringify([]));
        localStorage.setItem(`cart_${username}`, JSON.stringify([]));

        alert("User registered successfully!");
        showPage('loginPage');
    } else {
        alert("Please fill out both fields.");
    }
}


// Logout function without page reload for a smoother UX
function logout() {
    localStorage.removeItem("currentUser");
    initializeApp(); // Reinitialize app to show login page
}

// Logout Function without page reload (smoother UX)
function logout() {
    localStorage.removeItem("currentUser"); // Clear the current user from localStorage
    document.getElementById("loginPage").style.display = "block"; // Show the login page
    document.getElementById("signupPage").style.display = "none"; // Hide the signup page
    document.getElementById("mainApp").style.display = "none"; // Hide the main app
    document.getElementById("cartPage").style.display = "none"; // Hide the cart page
    showPage("loginPage"); // Go back to the login page without reloading the app
}

// Save transactions to localStorage
function saveInventory() {
    if (!currentUser) return;
    localStorage.setItem(`inventory_${currentUser}`, JSON.stringify(inventory));
    alert("Inventory saved successfully!");
}


// Add a product to the inventory
function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value.trim());
    const quantity = parseInt(document.getElementById("productQuantity").value.trim());
    const date = new Date().toLocaleDateString();

    if (!name || isNaN(price) || isNaN(quantity) || quantity <= 0 || price <= 0) {
        alert("Please enter valid product details.");
        return;
    }

    inventory.push({ name, price, quantity, date });
    updateInventoryList();
    saveInventory();
    alert("Product added successfully!");
}

// Update the inventory list display
function updateInventoryList() {
    inventoryList.innerHTML = "";
    inventory.forEach((product, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>${product.date}</td>
            <td><button class="delete-btn" onclick="deleteProduct(${index})">Delete</button></td>
        `;
        inventoryList.appendChild(row);
    });
}

// Delete a product from the inventory
function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        inventory.splice(index, 1);
        updateInventoryList();
        saveInventory();
        alert("Product deleted successfully!");
    }
}

// Search for products in the inventory
function searchProducts() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    searchResults.innerHTML = "";

    if (query) {
        const filteredProducts = inventory.filter(product =>
            product.name.toLowerCase().includes(query)
        );

        filteredProducts.forEach(product => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${product.name} - $${product.price.toFixed(2)}
                <button onclick="selectProduct('${product.name}', ${product.price})">Add</button>
            `;
            searchResults.appendChild(li);
        });
    }
}

// Add a selected product to the cart
function selectProduct(name, price) {
    cart.push({ name, price, quantity: 1 });
    updateCart();
    alert(`${name} added to cart!`);
}

// Update the cart display
function updateCart() {
    cartList.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - $${item.price.toFixed(2)}
            <input type="number" value="${item.quantity}" min="1" oninput="updateQuantity(${index}, this.value)">
            <button onclick="removeFromCart(${index})">Delete</button>
        `;
        cartList.appendChild(li);
    });

    totalAmount.innerText = `Total: $${total.toFixed(2)}`;
}

// Update product quantity in the cart
function updateQuantity(index, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1 || isNaN(newQuantity)) return;
    cart[index].quantity = newQuantity;
    updateCart();
}

// Remove a product from the cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Checkout and save transaction
function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    transactions.push(cart);
    saveTransactions();
    updateTransactionHistory();

    cart = [];
    saveCart();
    updateCart();
    alert("Checkout successful!");
}


// Display the transaction history
function updateTransactionHistory() {
    transactionHistoryDisplay.innerHTML = "";
    
    if (transactions.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6">No transactions available</td>`;
        transactionHistoryDisplay.appendChild(row);
    } else {
        transactions.forEach((transaction, index) => {
            transaction.forEach(item => {
                const row = document.createElement("tr");
                const totalPrice = item.price * item.quantity;
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>$${totalPrice.toFixed(2)}</td>
                    <td>${new Date().toLocaleDateString()}</td>
                `;
                transactionHistoryDisplay.appendChild(row);
            });
        });
    }
}

// Clear the transaction history
function clearTransactionHistory() {
    const password = prompt("Enter password to clear transactions:");

    if (password === "fush231") {
        transactions = [];
        saveTransactions();
        updateTransactionHistory();
        alert("Transaction history cleared!");
    } else {
        alert("Incorrect password. History not cleared.");
    }
}


//Function Load User Data
function loadUserData() {
    if (!currentUser) return;

    inventory = JSON.parse(localStorage.getItem(`inventory_${currentUser}`)) || [];
    cart = JSON.parse(localStorage.getItem(`cart_${currentUser}`)) || [];
    transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser}`)) || [];

    updateInventoryList();
    updateTransactionHistory();
    updateCart();
}

//Function Save Transaction
function saveTransactions() {
    if (!currentUser) return;
    localStorage.setItem(`transactions_${currentUser}`, JSON.stringify(transactions));
}

//Function Save Cart per user
function saveCart() {
    if (!currentUser) return;
    localStorage.setItem(`cart_${currentUser}`, JSON.stringify(cart));
}



// Event listeners for form submissions and actions
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    updateInventoryList();
    updateTransactionHistory();
    document.getElementById("clearTransactionHistoryBtn").addEventListener("click", clearTransactionHistory);
});

//Highlight Active Tab.
function highlightActiveTab(pageId) {
    // Remove 'active' class from all navbar links
    const navLinks = document.querySelectorAll('.sidebar li');
    navLinks.forEach(link => link.classList.remove('active'));

    // Add 'active' class to the clicked link
    if (pageId === 'addInventoryPage') {
        document.getElementById('addInventoryLink').classList.add('active');
    } else if (pageId === 'inventoryListPage') {
        document.getElementById('inventoryListLink').classList.add('active');
    } else if (pageId === 'cartPage') {
        document.getElementById('cartLink').classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);


// Load data on startup
initializeApp();
updateInventoryList();
updateTransactionHistory();
showPage('loginPage');