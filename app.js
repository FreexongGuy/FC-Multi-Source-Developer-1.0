// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyApJyJrg_dLkBdA08heBNlfIZObSY9LqXk",
  authDomain: "fc-multi-source.firebaseapp.com",
  projectId: "fc-multi-source",
  storageBucket: "fc-multi-source.firebasestorage.app",
  messagingSenderId: "602428529893",
  appId: "1:602428529893:web:5da6267bead4539113080c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Generate random username
const username = "User-" + Math.random().toString(36).substring(7);

// Elements
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const notificationsToggle = document.getElementById("notificationsToggle");

// Timestamp of last clear
let clearTimestamp = null;

// Track last message count for notifications
let lastMessageCount = 0;

// Format timestamps like "5:42 PM"
function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// 🔹 Send text message
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  try {
    await db.collection("messages").add({
      username,
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    input.value = "";
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Failed to send message. Check console.");
  }
}

// Send message on button click
sendBtn.addEventListener("click", sendMessage);

// Send message on Enter key press
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// Clear chat for this client only
clearBtn.addEventListener("click", () => {
  messagesDiv.innerHTML = "";
  clearTimestamp = new Date(); // all older messages ignored
});

// 🔹 Request notification permission on load
window.addEventListener("load", () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // Load saved settings
  const darkMode = localStorage.getItem("darkMode") || "on";
  const notifications = localStorage.getItem("notifications") || "on";

  if (darkMode === "off") {
    document.body.classList.add("light-mode");
    darkModeToggle.checked = false;
  } else {
    document.body.classList.remove("light-mode");
    darkModeToggle.checked = true;
  }

  notificationsToggle.checked = notifications === "on";
});

// 🔹 Display messages in real-time
db.collection("messages")
  .orderBy("createdAt", "asc")
  .onSnapshot((snapshot) => {
    messagesDiv.innerHTML = "";
    const notificationsEnabled = localStorage.getItem("notifications") !== "off";
    const newMessageCount = snapshot.size;

    snapshot.forEach((doc) => {
      const msg = doc.data();
      const msgTime = msg.createdAt ? msg.createdAt.toDate() : new Date();

      // Skip messages older than last clear
      if (clearTimestamp && msgTime <= clearTimestamp) return;

      const time = msg.createdAt ? formatTime(msg.createdAt.toDate()) : "";
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `<strong>${msg.username}</strong>: ${msg.text}<div class="timestamp">${time}</div>`;
      messagesDiv.appendChild(div);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Browser notifications for new messages from others
    if (notificationsEnabled && newMessageCount > lastMessageCount) {
      const lastMsg = snapshot.docs[snapshot.docs.length - 1].data();
      if (lastMsg.username !== username && Notification.permission === "granted") {
        new Notification(`New message from ${lastMsg.username}`, {
          body: lastMsg.text,
          icon: "", // Optional: URL to small icon
        });
      }
    }

    lastMessageCount = newMessageCount;
  });

// 🔹 Settings modal open/close
settingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "flex";
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

// 🔹 Dark mode toggle
darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    document.body.classList.remove("light-mode");
    localStorage.setItem("darkMode", "on");
  } else {
    document.body.classList.add("light-mode");
    localStorage.setItem("darkMode", "off");
  }
});

// 🔹 Notifications toggle
notificationsToggle.addEventListener("change", () => {
  const enabled = notificationsToggle.checked;
  localStorage.setItem("notifications", enabled ? "on" : "off");
});
