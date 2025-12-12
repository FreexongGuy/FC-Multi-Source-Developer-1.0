const localPreview = document.getElementById('local-preview');
const remoteAudios = document.getElementById('remote-audios');
const joinBtn = document.getElementById('join-room');
const roomInput = document.getElementById('room-name');
const controls = document.getElementById('controls');
const muteBtn = document.getElementById('mute-btn');
const leaveBtn = document.getElementById('leave-btn');

let localStream;
let peer;
const peers = {}; // peerId -> call object
let isMuted = false;

// Get mic access
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then(stream => {
    localStream = stream;
    localPreview.srcObject = stream;
    localPreview.autoplay = true;
  })
  .catch(err => alert("Error accessing mic: " + err.message));

// Join room
joinBtn.addEventListener('click', () => {
  const roomName = roomInput.value.trim();
  if (!roomName) return alert("Please enter a room name");
  startPeer(roomName);
  document.getElementById('room-container').style.display = 'none';
  controls.style.display = 'flex';
});

// Mute/unmute
muteBtn.addEventListener('click', () => {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks()[0].enabled = !isMuted;
  muteBtn.textContent = isMuted ? "Unmute" : "Mute";
});

// Leave call
leaveBtn.addEventListener('click', () => {
  if (peer && !peer.destroyed) peer.destroy();
  Object.values(peers).forEach(call => call.close());
  remoteAudios.innerHTML = '';
  controls.style.display = 'none';
  document.getElementById('room-container').style.display = 'flex';
});

// Start PeerJS connection
function startPeer(roomName) {
  peer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });

  peer.on('open', id => {
    console.log('My peer ID:', id);
    joinRoom(roomName, id);
  });

  peer.on('call', call => {
    call.answer(localStream);
    call.on('stream', stream => addRemoteAudio(call.peer, stream));
    peers[call.peer] = call;
  });

  window.addEventListener('beforeunload', () => {
    if (peer && !peer.destroyed) peer.destroy();
  });
}

// Join room using localStorage
function joinRoom(roomName, myId) {
  let roomUsers = JSON.parse(localStorage.getItem(roomName) || '[]');

  roomUsers.forEach(peerId => {
    if (peerId !== myId && !peers[peerId]) {
      const call = peer.call(peerId, localStream);
      call.on('stream', stream => addRemoteAudio(peerId, stream));
      peers[peerId] = call;
    }
  });

  roomUsers.push(myId);
  localStorage.setItem(roomName, JSON.stringify(roomUsers));
}

// Add remote audio dynamically
function addRemoteAudio(peerId, stream) {
  if (document.getElementById(`audio-${peerId}`)) return;

  const card = document.createElement('div');
  card.className = 'audio-card';
  card.id = `audio-${peerId}`;
  card.textContent = peerId.slice(0, 4);

  const audioEl = document.createElement('audio');
  audioEl.autoplay = true;
  audioEl.srcObject = stream;

  card.appendChild(audioEl);
  remoteAudios.appendChild(card);
}
