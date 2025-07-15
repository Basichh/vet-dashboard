# 🏥 Vet Clinic Dashboard

A modern, real-time veterinary clinic management dashboard for tracking patient flow, room status, and staff assignments. Perfect for small to medium-sized vet practices looking to improve their daily operations.

## 🌟 Features

### 📋 Patient Management
- **Add new visitors** with pet and owner information
- **Real-time room assignments** (6 examination rooms + lobby)
- **Drag-and-drop interface** for moving patients between rooms
- **Tech and doctor assignments** with visual status indicators
- **Automatic timestamping** for visit tracking

### 🖥️ Dual Interface System
- **Admin Dashboard** (`index.html`) - Full management interface for staff
- **TV Display Mode** (`tv.html`) - Clean, large-text display for waiting areas
- **Responsive design** that works on tablets, computers, and TVs

### 🔄 Data Synchronization
- **Dual storage system** (local storage + server-side JSON)
- **Automatic data sync** between multiple devices
- **Offline capability** with localStorage fallback
- **Real-time updates** across all connected devices

### 📊 Status Tracking
- Visual status indicators for different stages:
  - 📋 Waiting in Lobby
  - 🚪 Waiting in Room
  - 🔧 Tech Assigned
  - 👩‍⚕️ Doctor Assigned
- **Live statistics panel** with visitor counts and status breakdowns
- **Audio notifications** for new visitors (TV mode)

## 🚀 Quick Start

### Prerequisites
- Python 3.6+ (for the server)
- Modern web browser
- Local network access (for multi-device usage)

### Installation & Setup

1. **Clone or download** this repository
```bash
git clone https://github.com/Basichh/vet-dashboard.git
cd vet-dashboard
```

2. **Start the server**

**Windows (PowerShell):**
```powershell
.\start-server.ps1
```

**Windows (Command Prompt):**
```cmd
start-server.bat
```

**Manual start:**
```bash
python server.py
```

3. **Access the dashboard**
- **Admin Interface**: `http://localhost:8000/index.html`
- **TV Display**: `http://localhost:8000/tv.html`
- **Network Access**: `http://[YOUR-IP]:8000/`

The startup script will display your local IP address for network access.

## 📱 Usage Guide

### Admin Dashboard (`index.html`)

#### Adding New Visitors
1. Fill in the **Pet Name** and **Owner Name**
2. Select a **room** or leave as "Lobby"
3. Click **"Add Visitor"**

#### Managing Patient Flow
- **Drag and drop** patient cards between rooms
- Use **action buttons** for status changes:
  - "Move to Room" - Assign a room number
  - "Assign Tech" - Add tech staff member
  - "Assign Doctor" - Add veterinarian
  - "Complete Visit" - Remove from dashboard
  - "Remove" - Immediate removal

#### Room Management
- **Real-time occupancy** indicators
- **Automatic conflict detection** for room assignments
- **Visual status badges** for each patient

### TV Display Mode (`tv.html`)

Perfect for waiting room displays:
- **Large, clear text** visible from a distance
- **Auto-refresh** every 5 seconds
- **Clean interface** without management controls
- **Audio notifications** for new arrivals
- **Full-screen mode** support

## 🛠️ Technical Details

### File Structure
```
vet-dashboard/
├── index.html          # Admin dashboard interface
├── tv.html             # TV display mode
├── script.js           # Main JavaScript functionality
├── style.css           # Styling for all interfaces
├── server.py           # Python backend server
├── data.json           # Visitor data storage
├── start-server.ps1    # Windows PowerShell startup
├── start-server.bat    # Windows batch startup
└── update.ps1/.bat     # Git update scripts
```

### Server API Endpoints
- `GET /api/visitors` - Retrieve all visitor data
- `POST /api/visitors` - Save visitor data
- `POST /api/sync-localStorage` - Sync local storage with server

### Data Storage
The system uses a **dual storage approach**:
1. **Server-side**: `data.json` file for persistence
2. **Client-side**: Browser localStorage for offline access

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 🔧 Configuration

### Port Configuration
Default port is `8000`. To change:
1. Edit `server.py`, line ~145: `PORT = 8000`
2. Or set environment variable: `PORT=8080 python server.py`

### Network Access
- Server binds to `0.0.0.0` for network access
- Use the IP address shown during startup for other devices
- Ensure firewall allows connections on the chosen port

## 🎯 Use Cases

### Perfect For:
- **Small to medium vet clinics** (1-6 examination rooms)
- **Daily patient flow management**
- **Waiting room information displays**
- **Staff coordination** and assignment tracking
- **Multi-device clinic setups**

### Typical Setup:
- **Reception desk**: Admin dashboard for patient intake
- **Examination rooms**: Quick status updates
- **Waiting area**: TV display showing room status
- **Staff devices**: Mobile access for real-time updates

## 🔄 Daily Workflow

1. **Morning setup**: Start server, clear previous day's data
2. **Patient intake**: Add visitors as they arrive
3. **Room management**: Move patients through the process
4. **Staff assignments**: Track tech and doctor availability
5. **End of day**: Clear all visitors for fresh start

## 🚨 Troubleshooting

### Common Issues

**Server won't start:**
- Check if Python is installed: `python --version`
- Ensure port 8000 is available
- Check firewall settings

**Data not syncing:**
- Verify server is running
- Check network connectivity
- Look for JavaScript console errors

**Display issues:**
- Clear browser cache
- Disable browser extensions
- Try incognito/private mode

### Reset Data
To clear all visitor data:
- Use "Clear All (Daily Reset)" button in admin interface
- Or delete `data.json` file and restart server

## 📈 Future Enhancements

Potential improvements for future versions:
- [ ] Database integration (SQLite/PostgreSQL)
- [ ] User authentication system
- [ ] Appointment scheduling integration
- [ ] Email/SMS notifications
- [ ] Detailed analytics and reporting
- [ ] Mobile app companion

## 🤝 Contributing

This project is open for improvements! Areas where contributions are welcome:
- UI/UX enhancements
- Additional features
- Mobile responsiveness
- Performance optimizations
- Documentation improvements

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Create an issue on GitHub
3. Review the code comments for implementation details

---

**Made with ❤️ for veterinary professionals**

*Last updated: July 2025*
