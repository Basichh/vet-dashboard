// Sound alert function
function playAlert() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function init() {
  const hash = window.location.hash;

  if (hash === "#display") {
    renderDisplay();
    setInterval(renderDisplay, 5000); // Refresh every 5 sec
  } else {
    renderAdmin();
  }
}

function getVisitors() {
  return JSON.parse(localStorage.getItem("visitors") || "[]");
}

function saveVisitors(visitors) {
  localStorage.setItem("visitors", JSON.stringify(visitors));
}

function renderAdmin() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="admin-container">
      <h1>🏥 Vet Clinic Dashboard</h1>
      
      <div class="add-visitor-section">
        <h2>Add New Visitor</h2>
        <div class="form-group">
          <input id="petName" placeholder="Pet Name" />
          <input id="ownerName" placeholder="Owner Name" />
          <select id="roomSelect">
            <option value="">Select Room</option>
            <option value="1">Room 1</option>
            <option value="2">Room 2</option>
            <option value="3">Room 3</option>
            <option value="4">Room 4</option>
            <option value="5">Room 5</option>
            <option value="6">Room 6</option>
            <option value="lobby">Lobby</option>
          </select>
          <button onclick="addVisitor()">Add Visitor</button>
        </div>
      </div>

      <div class="room-management">
        <h2>Room Status</h2>
        <p class="instruction-text">💡 <strong>Tip:</strong> You can drag patient cards between rooms or use the action buttons</p>
        <div class="rooms-grid" id="roomsGrid"></div>
      </div>
      
      <div class="controls">
        <button onclick="clearAllVisitors()" class="clear-btn">Clear All (Daily Reset)</button>
        <a href="#display" class="display-link">View Display Mode</a>
      </div>
    </div>
  `;

  updateRoomsDisplay();
}

function addVisitor() {
  const petName = document.getElementById("petName").value.trim();
  const ownerName = document.getElementById("ownerName").value.trim();
  const roomSelect = document.getElementById("roomSelect").value;

  if (!petName || !ownerName) {
    alert("Please fill in pet and owner names");
    return;
  }

  const visitors = getVisitors();
  const newVisitor = {
    id: Date.now(),
    petName,
    ownerName,
    room: roomSelect || "lobby",
    status: roomSelect === "lobby" || !roomSelect ? "waiting_lobby" : "waiting_room",
    doctor: "",
    timestamp: new Date().toLocaleTimeString()
  };

  visitors.push(newVisitor);
  saveVisitors(visitors);
  
  // Play sound alert
  playAlert();
  
  // Clear form
  document.getElementById("petName").value = "";
  document.getElementById("ownerName").value = "";
  document.getElementById("roomSelect").value = "";
  
  updateRoomsDisplay();
}

function updateVisitorStatus(id, newStatus) {
  const visitors = getVisitors();
  const visitor = visitors.find(v => v.id === id);
  
  if (!visitor) return;
  
  if (newStatus === "waiting_room" && visitor.status === "waiting_lobby") {
    // Prompt for room selection when moving from lobby
    const roomNumber = prompt("Enter room number (1-6):");
    if (!roomNumber || roomNumber < 1 || roomNumber > 6) {
      alert("Please enter a valid room number (1-6)");
      return;
    }
    
    // Check if room is already occupied
    const roomOccupied = visitors.some(v => v.room == roomNumber && v.id !== id);
    if (roomOccupied) {
      const confirm = window.confirm(`Room ${roomNumber} is already occupied. Move anyway?`);
      if (!confirm) return;
    }
    
    visitor.room = roomNumber;
    visitor.status = "waiting_room";
  } else if (newStatus === "dr_assigned") {
    const doctorName = prompt("Enter doctor name:");
    if (!doctorName) return;
    visitor.doctor = doctorName.trim();
    visitor.status = newStatus;
  } else {
    visitor.status = newStatus;
  }
  
  saveVisitors(visitors);
  updateRoomsDisplay();
}

function moveVisitorToRoom(id, roomNumber) {
  const visitors = getVisitors();
  const visitor = visitors.find(v => v.id === id);
  
  if (!visitor) return;
  
  // If moving to a numbered room, check if it's valid
  if (roomNumber !== "lobby" && (roomNumber < 1 || roomNumber > 6)) {
    alert("Invalid room number");
    return;
  }
  
  // Check if room is already occupied (except lobby)
  if (roomNumber !== "lobby") {
    const roomOccupied = visitors.some(v => v.room == roomNumber && v.id !== id);
    if (roomOccupied) {
      const confirm = window.confirm(`Room ${roomNumber} is already occupied. Move anyway?`);
      if (!confirm) return;
    }
  }
  
  // Update visitor room and status
  visitor.room = roomNumber;
  
  // Update status based on room
  if (roomNumber === "lobby") {
    visitor.status = "waiting_lobby";
    // Clear doctor if moving back to lobby
    visitor.doctor = "";
  } else {
    // Only update to waiting_room if not already assigned to doctor
    if (visitor.status === "waiting_lobby") {
      visitor.status = "waiting_room";
    }
  }
  
  saveVisitors(visitors);
  updateRoomsDisplay();
}

function removeVisitor(id) {
  const visitors = getVisitors().filter(v => v.id !== id);
  saveVisitors(visitors);
  updateRoomsDisplay();
}

function updateRoomsDisplay() {
  const roomsGrid = document.getElementById("roomsGrid");
  const visitors = getVisitors();
  
  // Create room cards for rooms 1-6 plus lobby
  const rooms = ["lobby", "1", "2", "3", "4", "5", "6"];
  
  roomsGrid.innerHTML = rooms.map(roomId => {
    const roomVisitors = visitors.filter(v => v.room === roomId);
    const roomName = roomId === "lobby" ? "Lobby" : `Room ${roomId}`;
    
    return `
      <div class="room-card ${roomVisitors.length > 0 ? 'occupied' : 'empty'}" 
           data-room="${roomId}"
           ondrop="dropVisitor(event)" 
           ondragover="allowDrop(event)">
        <h3>${roomName}</h3>
        <div class="visitor-count">${roomVisitors.length} visitor(s)</div>
        
        ${roomVisitors.map(visitor => `
          <div class="visitor-info status-${visitor.status}" 
               draggable="true" 
               data-visitor-id="${visitor.id}"
               ondragstart="dragStart(event)">
            <div class="visitor-details">
              <div class="drag-handle">⋮⋮</div>
              <strong>🐾 ${visitor.petName}</strong><br>
              <span>👤 ${visitor.ownerName}</span><br>
              <small>⏰ ${visitor.timestamp}</small>
              ${visitor.doctor ? `<br><span class="doctor">👩‍⚕️ Dr. ${visitor.doctor}</span>` : ''}
            </div>
            
            <div class="status-badge status-${visitor.status}">
              ${getStatusText(visitor.status)}
            </div>
            
            <div class="action-buttons">
              ${visitor.status === "waiting_lobby" ? `
                <button onclick="updateVisitorStatus(${visitor.id}, 'waiting_room')" class="btn-move">Move to Room</button>
              ` : ''}
              
              ${visitor.status === "waiting_room" ? `
                <button onclick="updateVisitorStatus(${visitor.id}, 'dr_assigned')" class="btn-assign">Assign Doctor</button>
              ` : ''}
              
              ${visitor.status === "dr_assigned" ? `
                <button onclick="removeVisitor(${visitor.id})" class="btn-complete">Complete Visit</button>
              ` : ''}
              
              <button onclick="removeVisitor(${visitor.id})" class="btn-remove">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

// Drag and Drop Functions
let draggedVisitorId = null;

function dragStart(event) {
  draggedVisitorId = event.target.getAttribute('data-visitor-id');
  event.target.style.opacity = '0.5';
  
  // Add visual feedback
  document.querySelectorAll('.room-card').forEach(card => {
    card.classList.add('drop-zone');
  });
}

function allowDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function dropVisitor(event) {
  event.preventDefault();
  
  // Remove visual feedback
  document.querySelectorAll('.room-card').forEach(card => {
    card.classList.remove('drop-zone', 'drag-over');
  });
  
  const targetRoom = event.currentTarget.getAttribute('data-room');
  
  if (draggedVisitorId && targetRoom) {
    moveVisitorToRoom(parseInt(draggedVisitorId), targetRoom);
  }
  
  // Reset dragged element opacity
  const draggedElement = document.querySelector(`[data-visitor-id="${draggedVisitorId}"]`);
  if (draggedElement) {
    draggedElement.style.opacity = '1';
  }
  
  draggedVisitorId = null;
}

// Add dragend event listener to clean up
document.addEventListener('dragend', function(event) {
  event.target.style.opacity = '1';
  document.querySelectorAll('.room-card').forEach(card => {
    card.classList.remove('drop-zone', 'drag-over');
  });
});

// Add dragleave event listener for better UX
document.addEventListener('dragleave', function(event) {
  if (event.target.classList.contains('room-card')) {
    event.target.classList.remove('drag-over');
  }
});

function getStatusText(status) {
  switch(status) {
    case "waiting_lobby": return "📋 Waiting in Lobby";
    case "waiting_room": return "🚪 Waiting in Room";
    case "dr_assigned": return "👩‍⚕️ Doctor Assigned";
    default: return status;
  }
}

function clearAllVisitors() {
  if (confirm("Clear all visitors? This will reset the dashboard for a new day.")) {
    localStorage.removeItem("visitors");
    updateRoomsDisplay();
  }
}

function renderDisplay() {
  const app = document.getElementById("app");
  const visitors = getVisitors();

  app.innerHTML = `
    <div class="display-screen">
      <h1>🏥 Vet Clinic Room Status</h1>
      <div class="display-time">${new Date().toLocaleString()}</div>
      
      <div class="rooms-display-grid">
        ${[1, 2, 3, 4, 5, 6].map(roomNum => {
          const roomVisitors = visitors.filter(v => v.room == roomNum);
          const isEmpty = roomVisitors.length === 0;
          
          return `
            <div class="display-room-card ${isEmpty ? 'empty' : 'occupied'}">
              <h2>Room ${roomNum}</h2>
              ${isEmpty ? 
                '<p class="empty-room">Available</p>' : 
                roomVisitors.map(visitor => `
                  <div class="display-visitor">
                    <p class="pet-name">🐾 ${visitor.petName}</p>
                    <p class="owner-name">👤 ${visitor.ownerName}</p>
                    <p class="status-display ${visitor.status}">${getStatusText(visitor.status)}</p>
                    ${visitor.doctor ? `<p class="doctor-name">👩‍⚕️ Dr. ${visitor.doctor}</p>` : ''}
                  </div>
                `).join('')
              }
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="lobby-display">
        <h2>🪑 Lobby</h2>
        <div class="lobby-visitors">
          ${visitors.filter(v => v.room === "lobby").map(visitor => `
            <div class="lobby-visitor">
              <span>🐾 ${visitor.petName} (${visitor.ownerName})</span>
              <span class="wait-time">⏰ ${visitor.timestamp}</span>
            </div>
          `).join('') || '<p class="no-visitors">No one waiting in lobby</p>'}
        </div>
      </div>
      
      <div class="admin-link">
        <a href="index.html">Return to Admin</a>
      </div>
    </div>
  `;
}

window.onload = init;
