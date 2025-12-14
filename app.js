// ---------------- Firebase ----------------
const firebaseConfig = {
  apiKey: "AIzaSyApJyJrg_dLkBdA08heBNlfIZObSY9LqXk",
  authDomain: "fc-multi-source.firebaseapp.com",
  databaseURL: "https://fc-multi-source-default-rtdb.firebaseio.com",
  projectId: "fc-multi-source",
  storageBucket: "fc-multi-source.firebasestorage.app",
  messagingSenderId: "602428529893",
  appId: "1:602428529893:web:5da6267bead4539113080c"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref("messages");
const usersRef = db.ref("users");

// ---------------- DOM Elements ----------------
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const reportText = document.getElementById('report-text');
const reportBtn = document.getElementById('report-btn');
const reportStatus = document.getElementById('report-status');

// ---------------- Check login ----------------
const currentUser = localStorage.getItem("fc_current_user");

if (!currentUser) {
  window.location.href = "login.html";
} else {
  // Check user state
  usersRef.orderByChild("user").equalTo(currentUser).once("value", snapshot => {
    const userData = snapshot.val();
    if (!userData) return;

    const uid = Object.keys(userData)[0];
    const state = userData[uid].state || "Open";
    localStorage.setItem("fc_current_user_state", state);

    if (state === "Terminated") {
      window.location.href = "ban.html";
    }
  });
}

// ---------------- Load users.json ----------------
let usersList = [];
fetch('users.json')
  .then(res => res.json())
  .then(data => usersList = data)
  .catch(err => console.error("Error loading users.json:", err));

// ---------------- Display messages ----------------
function displayMessages(messages) {
  chatContainer.innerHTML = '';
  const keys = Object.keys(messages).slice(-50); // last 50 messages

  keys.forEach(key => {
    const messageData = messages[key];
    const textValue = messageData.text;
    const nameValue = messageData.name || "Anonymous";

    if (textValue) {
      const msgElement = document.createElement('div');
      msgElement.classList.add('chat-message');

      const nameSpan = document.createElement('span');
      nameSpan.classList.add('name');
      nameSpan.textContent = nameValue + ": ";
      nameSpan.addEventListener('click', () => showProfile(nameValue));
      msgElement.appendChild(nameSpan);

      const textSpan = document.createElement('span');
      textSpan.classList.add('text');
      textSpan.textContent = textValue;
      msgElement.appendChild(textSpan);

      chatContainer.appendChild(msgElement);
    }
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ---------------- Real-time listener ----------------
messagesRef.limitToLast(50).on('value', snapshot => {
  const data = snapshot.val();
  if (data) displayMessages(data);
});

// ---------------- Send message ----------------
sendBtn.addEventListener('click', () => {
  const username = localStorage.getItem('fc_current_user') || "Anonymous"; // latest
  const text = messageInput.value.trim();
  if (!text) return;

  messagesRef.push().set({
    name: username,
    text: text,
    timestamp: Date.now()
  }).then(() => {
    messageInput.value = '';
  });
});

messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendBtn.click();
});

// ---------------- Profile popup ----------------
const profilePopup = document.createElement('div');
profilePopup.id = 'profile-popup';
document.body.appendChild(profilePopup);

function showProfile(name) {
  const user = usersList.find(u => u.user === name) || { role: "member", user: name };
  profilePopup.innerHTML = `<strong>${user.user}</strong><br>Role: ${user.role}`;
  profilePopup.style.display = 'block';
}

document.addEventListener('click', e => {
  if (!e.target.classList.contains('name')) profilePopup.style.display = 'none';
});

chatContainer.addEventListener('click', e => {
  if (e.target.classList.contains('name')) {
    const rect = e.target.getBoundingClientRect();
    profilePopup.style.top = rect.bottom + window.scrollY + 5 + 'px';
    profilePopup.style.left = rect.left + window.scrollX + 'px';
  }
});

// ---------------- Send report via EmailJS ----------------
reportBtn.addEventListener('click', () => {
  if (typeof emailjs === "undefined") {
    reportStatus.textContent = "Email service not loaded!";
    reportStatus.style.color = "red";
    return;
  }

  const username = localStorage.getItem('fc_current_user') || "Anonymous"; // latest
  const reportContent = reportText.value.trim();
  if (!reportContent) {
    reportStatus.textContent = "Please write something.";
    reportStatus.style.color = "orange";
    return;
  }

  reportStatus.textContent = "Sending…";
  reportStatus.style.color = "blue";

  let timeoutReached = false;
  const timer = setTimeout(() => {
    timeoutReached = true;
    reportStatus.textContent = "Duration Time ended ❌";
    reportStatus.style.color = "red";
  }, 10000);

  emailjs.send("service_tusp0cx", "template_ghapews", {
    to_name: "Owner Name",
    from_name: username,
    message: reportContent,
    subject: `FC Multi-Source Report from ${username}`
  })
  .then(() => {
    if (!timeoutReached) {
      clearTimeout(timer);
      reportStatus.textContent = "Sent ✅";
      reportStatus.style.color = "green";
      reportText.value = '';
    }
  })
  .catch(err => {
    if (!timeoutReached) {
      clearTimeout(timer);
      reportStatus.textContent = "Error ❌";
      reportStatus.style.color = "red";
      console.error("Report failed:", err);
    }
  });
});
