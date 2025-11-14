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

const username = window.chatUsername || "UnknownUser";
let clearTimestamp = null;
let lastMessageCount = 0;

// Load messages
let messages = JSON.parse(localStorage.getItem("chatMessages") || "[]");

// Format time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Render messages
function renderMessages() {
  messagesDiv.innerHTML = "";
  const notificationsEnabled = localStorage.getItem("notifications") !== "off";

  messages.forEach(msg => {
    if (clearTimestamp && new Date(msg.time) <= clearTimestamp) return;
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<strong>${msg.user}</strong>: ${msg.text}<div class="timestamp">${formatTime(new Date(msg.time))}</div>`;
    messagesDiv.appendChild(div);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  if (notificationsEnabled && messages.length > lastMessageCount) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.user !== username && Notification.permission === "granted") {
      new Notification(`New message from ${lastMsg.user}`, { body: lastMsg.text });
    }
  }

  lastMessageCount = messages.length;
}

// Send message
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const msg = { user: username, text, time: new Date().toISOString() };
  messages.push(msg);
  localStorage.setItem("chatMessages", JSON.stringify(messages));
  renderMessages();
  input.value = "";
}

// Clear chat
function clearChat() {
  clearTimestamp = new Date();
  renderMessages();
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });
clearBtn.addEventListener("click", clearChat);

// Settings modal
settingsBtn.addEventListener("click", () => { settingsModal.style.display = "flex"; });
closeSettingsBtn.addEventListener("click", () => { settingsModal.style.display = "none"; });

// Dark mode toggle
darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    document.body.classList.remove("light-mode");
    localStorage.setItem("darkMode", "on");
  } else {
    document.body.classList.add("light-mode");
    localStorage.setItem("darkMode", "off");
  }
});

// Notifications toggle
notificationsToggle.addEventListener("change", () => {
  localStorage.setItem("notifications", notificationsToggle.checked ? "on" : "off");
});

// Request notifications & load settings
window.addEventListener("load", () => {
  if ("Notification" in window && Notification.permission !== "granted") Notification.requestPermission();

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

  renderMessages();
});
