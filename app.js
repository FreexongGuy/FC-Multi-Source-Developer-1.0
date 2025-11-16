// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApJyJrg_dLkBdA08heBNlfIZObSY9LqXk",
  authDomain: "fc-multi-source.firebaseapp.com",
  databaseURL: "https://fc-multi-source-default-rtdb.firebaseio.com",
  projectId: "fc-multi-source",
  storageBucket: "fc-multi-source.firebasestorage.app",
  messagingSenderId: "602428529893",
  appId: "1:602428529893:web:5da6267bead4539113080c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// References
const dbRef = firebase.database().ref('messages');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const reportText = document.getElementById('report-text');
const reportBtn = document.getElementById('report-btn');
const reportStatus = document.getElementById('report-status');

// Get username from login
const username = localStorage.getItem('chatUsername') || "Anonymous";

// Display messages
function displayMessages(messages) {
    chatContainer.innerHTML = '';
    Object.keys(messages).forEach(key => {
        const messageData = messages[key];
        const textValue = messageData.text;
        const nameValue = messageData.name || "Anonymous";

        if (textValue) {
            const msgElement = document.createElement('div');
            msgElement.classList.add('chat-message');

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('name');
            nameSpan.textContent = nameValue + ": ";
            msgElement.appendChild(nameSpan);

            const textSpan = document.createElement('span');
            textSpan.textContent = textValue;
            msgElement.appendChild(textSpan);

            chatContainer.appendChild(msgElement);
        }
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Real-time listener for last 50 messages
dbRef.limitToLast(50).on('value', snapshot => {
    const data = snapshot.val();
    if (data) displayMessages(data);
});

// Send chat message
sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text !== '') {
        dbRef.push().set({
            name: username,
            text: text,
            timestamp: Date.now()
        }).then(() => {
            messageInput.value = '';
        }).catch(err => console.error("Error sending message:", err));
    }
});

messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendBtn.click();
});

// Send report via EmailJS with 10s timeout
reportBtn.addEventListener('click', () => {
    if (typeof emailjs === "undefined") {
        reportStatus.textContent = "Email service not loaded!";
        reportStatus.style.color = "red";
        return;
    }

    const reportContent = reportText.value.trim();
    if (!reportContent) {
        reportStatus.textContent = "Please write something.";
        reportStatus.style.color = "orange";
        return;
    }

    reportStatus.textContent = "Sending…";
    reportStatus.style.color = "blue";

    let timeoutReached = false;

    // 10-second timeout
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
