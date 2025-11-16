// Login system using users.json
async function login() {
  const username = document.getElementById("username").value.trim();
  const errorEl = document.getElementById("loginError");

  // Check if username is empty
  if (!username) {
    errorEl.innerText = "Please enter a username.";
    return;
  }

  try {
    // Fetch users list from users.json
    const res = await fetch("users.json");
    const users = await res.json();

    // Check if username exists
    if (users.includes(username)) {
      // ✅ Store username for chat
      localStorage.setItem("chatUsername", username);

      // Redirect to chat page
      window.location.href = "../index.html";
    } else {
      errorEl.innerText = "User not found.";
    }
  } catch (err) {
    errorEl.innerText = "Error loading users.";
    console.error("Login error:", err);
  }
}

// Make login function available globally
window.login = login;
