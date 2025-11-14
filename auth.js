// Login system using users.json
async function login() {
  const username = document.getElementById("username").value.trim();
  const errorEl = document.getElementById("loginError");

  if (!username) {
    errorEl.innerText = "Please enter a username.";
    return;
  }

  try {
    const res = await fetch("users.json");
    const users = await res.json();

    if (users.includes(username)) {
      // ✅ Store username for chat
      localStorage.setItem("chatUsername", username);

      // Redirect to chat
      window.location.href = "../index.html";
    } else {
      errorEl.innerText = "User not found.";
    }
  } catch (err) {
    errorEl.innerText = "Error loading users.";
    console.error(err);
  }
}

window.login = login;
