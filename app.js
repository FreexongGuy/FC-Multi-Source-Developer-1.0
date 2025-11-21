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

// Username from login
const username = localStorage.getItem('chatUsername') || "Anonymous";

// Users data (embedded)
const usersData = [
  { "user": "fluckterrainium", "pin": "2612", "role": "member" },
  { "user": "mohamed_hamooda", "pin": "1731", "role": "partner" },
  { "user": "younes_nukar", "pin": "9981", "role": "partner" },
  { "user": "mrman", "pin": "1919", "role": "partner" },
  { "user": "joethedoe", "pin": "5090", "role": "partner" },
  { "user": "hazem", "pin": "4420", "role": "partner" },
  { "user": "adamgtag", "pin": "7711", "role": "member" },
  { "user": "temo", "pin": "8118", "role": "partner" }
];

// Profile popup
const profilePopup = document.createElement('div');
profilePopup.style.position = 'absolute';
profilePopup.style.background = '#222';
profilePopup.style.color = '#fff';
profilePopup.style.border = '1px solid #555';
profilePopup.style.padding = '10px';
profilePopup.style.borderRadius = '5px';
profilePopup.style.display = 'none';
profilePopup.style.zIndex = '1000';
document.body.appendChild(profilePopup);

function showProfile(user, event) {
    const userInfo = usersData.find(u => u.user === user);
    if (!userInfo) return;

    profilePopup.innerHTML = `<strong>Username:</strong> ${userInfo.user}<br>
                              <strong>Role:</strong> ${userInfo.role}`;
    profilePopup.style.top = (event.pageY + 10) + 'px';
    profilePopup.style.left = (event.pageX + 10) + 'px';
    profilePopup.style.display = 'block';
}

// Hide popup if click outside username
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('name')) {
        profilePopup.style.display = 'none';
    }
});

// Display messages
function displayMessages(messages) {
    chatContainer.innerHTML = '';
    Object.keys(messages).forEach(key => {
        const msgData = messages[key];
        const name = msgData.name || "Anonymous";
        const text = msgData.text;

        const msgElement = document.createElement('div');
        msgElement.classList.add('chat-message');

        const nameLink = document.createElement('a');
        nameLink.href = "#";
        nameLink.classList.add('name');
        nameLink.textContent = name + ": ";
        nameLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showProfile(name, e);
        });

        msgElement.appendChild(nameLink);

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        msgElement.appendChild(textSpan);

        chatContainer.appendChild(msgElement);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Listen for last 50 messages
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
        }).then(() => messageInput.value = '')
          .catch(err => console.error("Error sending message:", err));
    }
});

messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendBtn.click();
});

// Send report
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
