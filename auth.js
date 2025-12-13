import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyApJyJrg_dLkBdA08heBNlfIZObSY9LqXk",
  authDomain: "fc-multi-source.firebaseapp.com",
  databaseURL: "https://fc-multi-source-default-rtdb.firebaseio.com",
  projectId: "fc-multi-source",
  storageBucket: "fc-multi-source.firebasestorage.app",
  messagingSenderId: "602428529893",
  appId: "1:602428529893:web:5da6267bead4539113080c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function login() {
  const username = document.getElementById("username").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const errorEl = document.getElementById("loginError");

  if (!username || !pin) {
    errorEl.innerText = "Enter both username and PIN.";
    return;
  }

  const snap = await get(ref(db, "users"));
  if (!snap.exists()) {
    errorEl.innerText = "No users found.";
    return;
  }

  const users = snap.val();

  for (const id in users) {
    const u = users[id];

    if (u.user === username) {

      if (u.state === "Terminated") {
        errorEl.innerText = "This account is banned.";
        return;
      }

      if (u.pin !== pin) {
        errorEl.innerText = "Incorrect PIN.";
        return;
      }

      localStorage.setItem("chatUsername", username);
      window.location.href = "index.html";
      return;
    }
  }

  errorEl.innerText = "User does not exist.";
}

window.login = login;
