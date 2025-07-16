// Global error handler for debugging
window.addEventListener('error', function(e) {
  console.error('🚨 JavaScript Error:', e.error);
  console.error('🚨 Error message:', e.message);
  console.error('🚨 Error location:', e.filename + ':' + e.lineno);
});

// Debug function availability
window.addEventListener('load', function() {
  console.log('🔍 Checking function availability...');
  console.log('🔍 addVisitor function:', typeof window.addVisitor);
  console.log('🔍 saveVisitors function:', typeof window.saveVisitors);
  console.log('🔍 getVisitors function:', typeof window.getVisitors);
});

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

// Startup sync function
function performStartupSync() {
  const localData = JSON.parse(localStorage.getItem("visitors") || "[]");
  
  if (localData.length > 0) {
    console.log('🔄 Checking if localStorage sync needed...');
    
    // Send localStorage data to server for sync check
    fetch('/api/sync-localStorage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localData)
    })
    .then(response => response.json())
    .then(result => {
      if (result.status === 'synced') {
        console.log('✅ Startup sync completed:', result.message);
      } else {
        console.log('ℹ️ No sync needed:', result.message);
      }
    })
    .catch(error => {
      console.warn('⚠️ Startup sync failed:', error);
    });
  } else {
    console.log('ℹ️ No localStorage data to sync');
  }
}

function init() {
  const hash = window.location.hash;

  // Perform startup sync first
  performStartupSync();

  if (hash === "#display") {
    renderDisplay();
    setInterval(renderDisplay, 5000); // Refresh every 5 sec
    // Update time display every second for accuracy
    setInterval(updateCurrentTimeDisplay, 1000);
  } else {
    renderAdmin();
  }
}

function getVisitors() {
  // Always try server first, fallback to localStorage
  return fetch('/api/visitors')
    .then(response => response.json())
    .then(serverData => {
      // Keep localStorage in sync with server data
      localStorage.setItem("visitors", JSON.stringify(serverData));
      return serverData;
    })
    .catch(error => {
      console.warn('API not available, using localStorage:', error);
      return JSON.parse(localStorage.getItem("visitors") || "[]");
    });
}

function saveVisitors(visitors) {
  console.log('🔄 saveVisitors called with:', visitors.length, 'visitors');
  
  // Save to both server and localStorage
  const serverPromise = fetch('/api/visitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitors)
  })
  .then(response => {
    console.log('📡 Server response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Data saved to server:', data.message || 'Success');
    console.log('📊 Server now has:', data.count || 'unknown', 'visitors');
    return data;
  })
  .catch(error => {
    console.warn('⚠️ Server save failed:', error);
    throw error;
  });

  // Always save to localStorage immediately (don't wait for server)
  localStorage.setItem("visitors", JSON.stringify(visitors));
  console.log('💾 Data saved to localStorage (', visitors.length, 'visitors)');

  return serverPromise;
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
            <option value="1">Preston</option>
            <option value="2">Charles</option>
            <option value="3">Rusty</option>
            <option value="4">Moosh</option>
            <option value="5">Caleb</option>
            <option value="6">Clifford</option>
            <option value="7">Lorie</option>
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
      </div>
    </div>
  `;

  updateRoomsDisplay();
}

function addVisitor() {
  console.log('🆕 addVisitor function called');
  
  const petName = document.getElementById("petName").value.trim();
  const ownerName = document.getElementById("ownerName").value.trim();
  const roomSelect = document.getElementById("roomSelect").value;

  console.log('📝 Form values - Pet:', petName, 'Owner:', ownerName, 'Room:', roomSelect);

  if (!petName || !ownerName) {
    alert("Please fill in pet and owner names");
    return;
  }

  getVisitors().then(visitors => {
    console.log('📊 Current visitors before adding:', visitors.length);
    
    const newVisitor = {
      id: Date.now(),
      petName,
      ownerName,
      room: roomSelect || "lobby",
      status: roomSelect === "lobby" || !roomSelect ? "waiting_lobby" : "waiting_room",
      doctor: "",
      tech: "",
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    };

    console.log('👤 Creating new visitor:', newVisitor);
    visitors.push(newVisitor);
    console.log('📊 Total visitors after adding:', visitors.length);
    
    // Save to both data.json (via API) and localStorage
    saveVisitors(visitors).then(() => {
      console.log('🎉 New visitor added and synced to both storage locations');
      
      // Clear form
      document.getElementById("petName").value = "";
      document.getElementById("ownerName").value = "";
      document.getElementById("roomSelect").value = "";
      
      updateRoomsDisplay();
    }).catch(error => {
      console.error('❌ Error saving visitor:', error);
      // Even if server fails, localStorage was updated, so continue
      document.getElementById("petName").value = "";
      document.getElementById("ownerName").value = "";
      document.getElementById("roomSelect").value = "";
      updateRoomsDisplay();
    });
  });
}

function updateVisitorStatus(id, newStatus) {
  getVisitors().then(visitors => {
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
    } else if (newStatus === "tech_assigned") {
      const techName = prompt("Enter tech name:");
      if (!techName) return;
      visitor.tech = techName.trim();
      visitor.status = newStatus;
    } else if (newStatus === "dr_assigned") {
      const doctorName = prompt("Enter doctor name:");
      if (!doctorName) return;
      visitor.doctor = doctorName.trim();
      visitor.status = newStatus;
    } else {
      visitor.status = newStatus;
    }
    
    saveVisitors(visitors).then(() => {
      updateRoomsDisplay();
    });
  });
}

function moveVisitorToRoom(id, roomNumber) {
  getVisitors().then(visitors => {
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
      // Clear doctor and tech if moving back to lobby
      visitor.doctor = "";
      visitor.tech = "";
    } else {
      // Only update to waiting_room if not already assigned to doctor
      if (visitor.status === "waiting_lobby") {
        visitor.status = "waiting_room";
      }
    }
    
    saveVisitors(visitors).then(() => {
      updateRoomsDisplay();
    });
  });
}

function removeVisitor(id) {
  getVisitors().then(visitors => {
    const filteredVisitors = visitors.filter(v => v.id !== id);
    saveVisitors(filteredVisitors).then(() => {
      updateRoomsDisplay();
    });
  });
}

function updateRoomsDisplay() {
  const roomsGrid = document.getElementById("roomsGrid");
  if (!roomsGrid) return;
  
  // Room name mapping
  const roomNames = {
    1: 'Preston',
    2: 'Charles', 
    3: 'Rusty',
    4: 'Moosh',
    5: 'Caleb',
    6: 'Clifford',
    7: 'Lorie'
  };
  
  getVisitors().then(visitors => {
    // Create room cards for rooms 1-7 plus lobby
    const rooms = ["lobby", "1", "2", "3", "4", "5", "6", "7"];
    
    roomsGrid.innerHTML = rooms.map(roomId => {
      const roomVisitors = visitors.filter(v => v.room === roomId);
      const roomName = roomId === "lobby" ? "Lobby" : (roomNames[roomId] || `Room ${roomId}`);
      
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
                ${visitor.tech ? `<br><span class="tech">🔧 Tech: ${visitor.tech}</span>` : ''}
                ${visitor.doctor ? `<br><span class="doctor">👩‍⚕️ Dr. ${visitor.doctor}</span>` : ''}
              </div>
              
              <div class="status-badge status-${visitor.status}">
                ${getDisplayStatus(visitor)}
              </div>
              
              <div class="action-buttons">
                ${visitor.status === "waiting_lobby" ? `
                  <button onclick="updateVisitorStatus(${visitor.id}, 'waiting_room')" class="btn-move">Move to Room</button>
                ` : ''}
                
                ${visitor.status === "waiting_room" || visitor.status === "tech_assigned" || visitor.status === "dr_assigned" ? `
                  ${!visitor.tech ? `
                    <button onclick="assignTech(${visitor.id})" class="btn-assign-tech">Assign Tech</button>
                  ` : `
                    <button onclick="removeTech(${visitor.id})" class="btn-remove-tech">Remove Tech</button>
                  `}
                ` : ''}
                
                ${visitor.status === "waiting_room" || visitor.status === "tech_assigned" || visitor.status === "dr_assigned" ? `
                  ${!visitor.doctor ? `
                    <button onclick="assignDoctor(${visitor.id})" class="btn-assign-doctor">Assign Doctor</button>
                  ` : `
                    <button onclick="removeDoctor(${visitor.id})" class="btn-remove-doctor">Remove Doctor</button>
                  `}
                ` : ''}
                
                ${(visitor.tech || visitor.doctor) ? `
                  <button onclick="removeVisitor(${visitor.id})" class="btn-complete">Complete Visit</button>
                ` : ''}
                
                <button onclick="removeVisitor(${visitor.id})" class="btn-remove">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
    
    // Add or update stats panel
    let existingStatsPanel = document.querySelector('.stats-panel');
    if (existingStatsPanel) {
      existingStatsPanel.remove();
    }
    document.body.insertAdjacentHTML('beforeend', generateStatsPanel(visitors));
  });
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
    case "tech_assigned": return "🔧 Tech Assigned";
    case "dr_assigned": return "👩‍⚕️ Doctor Assigned";
    default: return status;
  }
}

function clearAllVisitors() {
  if (confirm("Clear all visitors? This will reset the dashboard for a new day.")) {
    saveVisitors([]).then(() => {
      updateRoomsDisplay();
    });
  }
}

// Function to generate stats panel HTML
function generateStatsPanel(visitors) {
  const totalVisitors = visitors.length;
  const lobbyCount = visitors.filter(v => v.room === "lobby").length;
  const roomCount = visitors.filter(v => v.room !== "lobby").length;
  const techAssigned = visitors.filter(v => v.tech).length;
  const doctorAssigned = visitors.filter(v => v.doctor).length;
  const bothAssigned = visitors.filter(v => v.tech && v.doctor).length;
  
  return `
    <div class="stats-panel minimized" id="statsPanel">
      <div class="stats-header" onclick="toggleStatsPanel()">
        <span class="stats-title">📊 Dashboard Stats</span>
        <span class="stats-summary">(${totalVisitors} total)</span>
        <span class="toggle-icon">▶</span>
      </div>
      <div class="stats-content" id="statsContent">
        <div class="stats-item">
          <span class="stats-label">Total Visitors:</span>
          <span class="stats-value">${totalVisitors}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">In Lobby:</span>
          <span class="stats-value">${lobbyCount}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">In Rooms:</span>
          <span class="stats-value">${roomCount}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">With Tech:</span>
          <span class="stats-value">${techAssigned}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">With Doctor:</span>
          <span class="stats-value">${doctorAssigned}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">Tech + Doctor:</span>
          <span class="stats-value">${bothAssigned}</span>
        </div>
        <div class="auto-refresh-indicator">
          🔄 Auto-refresh active
        </div>
      </div>
    </div>
  `;
}

// --- Track last visitor IDs for display mode (sound moved to tv.html) ---
let lastVisitorIds = [];

function renderDisplay() {
  const app = document.getElementById("app");
  
  getVisitors().then(visitors => {
    // --- Track visitor IDs for other purposes (sound now handled in tv.html) ---
    const currentIds = visitors.map(v => v.id);
    lastVisitorIds = currentIds;
    
    const currentTime = new Date().toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    app.innerHTML = `
      <div class="display-screen">
        <h1>🏥 Vet Clinic Room Status</h1>
        <div class="display-time" id="currentTime">${currentTime}</div>
        
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
                      <p class="status-display ${visitor.status}">${getDisplayStatus(visitor)}</p>
                      ${visitor.tech ? `<p class="tech-name">🔧 Tech: ${visitor.tech}</p>` : ''}
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
    
    // Add stats panel to display mode
    let existingStatsPanel = document.querySelector('.stats-panel');
    if (existingStatsPanel) {
      existingStatsPanel.remove();
    }
    document.body.insertAdjacentHTML('beforeend', generateStatsPanel(visitors));
    
    // Update the current time every second
    updateCurrentTimeDisplay();
  });
}

// Function to update just the time display without re-rendering everything
function updateCurrentTimeDisplay() {
  const timeElement = document.getElementById('currentTime');
  if (timeElement) {
    const currentTime = new Date().toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    timeElement.textContent = currentTime;
  }
}

// Make functions globally accessible
window.addVisitor = addVisitor;
window.saveVisitors = saveVisitors;
window.getVisitors = getVisitors;
window.updateVisitorStatus = updateVisitorStatus;
window.moveVisitorToRoom = moveVisitorToRoom;
window.removeVisitor = removeVisitor;
window.clearAllVisitors = clearAllVisitors;
window.assignTech = assignTech;
window.assignDoctor = assignDoctor;
window.removeTech = removeTech;
window.removeDoctor = removeDoctor;
window.toggleStatsPanel = toggleStatsPanel;

// New functions for tech and doctor assignment
window.assignTech = assignTech;
window.assignDoctor = assignDoctor;
window.removeTech = removeTech;
window.removeDoctor = removeDoctor;

window.onload = init;

// --- New functions for tech and doctor assignment ---
function assignTech(id) {
  getVisitors().then(visitors => {
    const visitor = visitors.find(v => v.id === id);
    
    if (!visitor) return;
    
    const techName = prompt("Enter tech name:");
    if (!techName) return;
    
    visitor.tech = techName.trim();
    
    saveVisitors(visitors).then(() => {
      updateRoomsDisplay();
    });
  });
}

function assignDoctor(id) {
  getVisitors().then(visitors => {
    const visitor = visitors.find(v => v.id === id);
    
    if (!visitor) return;
    
    const doctorName = prompt("Enter doctor name:");
    if (!doctorName) return;
    
    visitor.doctor = doctorName.trim();
    
    saveVisitors(visitors).then(() => {
      updateRoomsDisplay();
    });
  });
}

function removeTech(id) {
  getVisitors().then(visitors => {
    const visitor = visitors.find(v => v.id === id);
    
    if (!visitor) return;
    
    visitor.tech = "";
    
    saveVisitors(visitors).then(() => {
      updateRoomsDisplay();
    });
  });
}

function removeDoctor(id) {
  getVisitors().then(visitors => {
    const visitor = visitors.find(v => v.id === id);
    
    if (!visitor) return;
    
    visitor.doctor = "";
    
    saveVisitors(visitors).then(() => {
      updateRoomsDisplay();
    });
  });
}

function getDisplayStatus(visitor) {
  if (visitor.status === "waiting_lobby") {
    return "📋 Waiting in Lobby";
  }
  
  if (visitor.status === "waiting_room" && !visitor.tech && !visitor.doctor) {
    return "🚪 Waiting in Room";
  }
  
  // Build status based on assignments
  let statusParts = [];
  if (visitor.tech) statusParts.push("🔧 Tech");
  if (visitor.doctor) statusParts.push("👩‍⚕️ Doctor");
  
  if (statusParts.length > 0) {
    return statusParts.join(" + ") + " Assigned";
  }
  
  return getStatusText(visitor.status);
}

function toggleStatsPanel() {
  const panel = document.getElementById('statsPanel');
  const content = document.getElementById('statsContent');
  const icon = panel.querySelector('.toggle-icon');
  
  if (panel.classList.contains('minimized')) {
    panel.classList.remove('minimized');
    content.style.display = 'block';
    icon.textContent = '▼';
  } else {
    panel.classList.add('minimized');
    content.style.display = 'none';
    icon.textContent = '▶';
  }
}
