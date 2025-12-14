// ban.js

const BAN_KEY = "fc_ban_data";

/* --------- USER SIDE --------- */
function checkBan() {
  const banData = JSON.parse(localStorage.getItem(BAN_KEY));
  if (!banData) return;

  const now = Date.now();
  if (now >= banData.from && now <= banData.to) {
    disableChat(banData);
  } else {
    localStorage.removeItem(BAN_KEY);
  }
}

function disableChat(banData) {
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  if (chatInput) chatInput.disabled = true;
  if (sendBtn) sendBtn.disabled = true;

  showBanPopup(banData);
}

function showBanPopup({ from, to, reason }) {
  const popup = document.createElement("div");
  popup.id = "ban-popup";
  popup.innerHTML = `
    <h1>Account Banned</h1>
    <p><b>From:</b> ${new Date(from).toLocaleString()}</p>
    <p><b>To:</b> ${new Date(to).toLocaleString()}</p>
    <p><b>Reason:</b> ${reason}</p>
  `;
  document.body.appendChild(popup);
}

/* --------- ADMIN SIDE --------- */
function banUser(userId) {
  const from = prompt("Ban start time (YYYY-MM-DD HH:MM)");
  const to = prompt("Ban end time (YYYY-MM-DD HH:MM)");
  const reason = prompt("Reason for ban:");

  if (!from || !to || !reason) return alert("Ban cancelled.");

  const banData = {
    userId,
    from: new Date(from).getTime(),
    to: new Date(to).getTime(),
    reason
  };

  localStorage.setItem(BAN_KEY, JSON.stringify(banData));
  alert("User banned successfully.");
}

/* Run on page load */
window.addEventListener("load", checkBan);
