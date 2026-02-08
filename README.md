# Driving Remote Controller – Professional Mobile & Web Controller for ATS / ETS2 (vJoy)

**Driving Remote Controller** is a high-performance, professional-grade mobile and web-based controller system for **American Truck Simulator (ATS)** and **Euro Truck Simulator 2 (ETS2)** built on **vJoy**.

Transform your **phone, tablet, or any browser** into a **fully customizable steering wheel, pedals, buttons, switches, and control panel**, communicating with your PC in **real-time via WebSocket**.

This system is designed for sim-racing and truck-sim enthusiasts who want a **professional touchscreen controller** without the cost of expensive hardware.

---

## 🌟 Key Features

### 🎮 Professional Control System
- **5 Control Types**: Steering wheel, pedals/sliders, buttons, joystick, H-shifter
- **Standardized Control Registry**: Type-safe control definitions with validation
- **Advanced Configuration**: Deadzones, response curves, axis mapping, sensitivity
- **Grid-Based H-Shifter**: Configurable gear patterns (6-speed, 7-speed, custom)
- **2-Axis Joystick**: Independent X/Y configuration with circular or square gates

### 🎨 Advanced Layout System
- **Visual Layout Editor**: Drag-to-position controls, resize, customize
- **Multiple Layouts**: Create unlimited custom layouts for different vehicles
- **Layout Import/Export**: Share layouts with community via `.dr` files
- **Persistent Storage**: All layouts saved in browser local storage
- **Built-in Layouts**: Pre-configured ETS2/ATS sequential layout included

### 📱 Optimized Mobile Experience
- **Touch-First Design**: Optimized for mobile touch input
- **Works Everywhere**: Android, iOS, tablets, desktop browsers
- **No App Required**: Runs entirely in the browser
- **Responsive UI**: Adapts to any screen size
- **Low Latency**: < 15ms with optimized WebSocket protocol

### 🔌 Professional Networking
- **Optimized WebSocket Protocol**: Throttling, batching, binary encoding support
- **Auto-Reconnect**: Exponential backoff with offline message queue
- **Connection Quality Monitor**: Real-time latency and packet rate display
- **Configuration Sync**: Layouts automatically sync between browser and PC

### 🖥️ One-Click Launcher
- **Automatic Setup**: Checks and installs dependencies automatically
- **Build Caching**: Fast startup on subsequent launches
- **Network Detection**: Shows all available IPs for multi-NIC setups
- **QR Code**: Instant mobile access via QR code scan
- **Live Telemetry**: Real-time control values, packet rate, connection status

### 🕹️ vJoy Integration
- **Full vJoy Support**: All axes (X, Y, Z, RX, RY, RZ, Sliders) and 32 buttons
- **Games see it as hardware**: Works with any game that supports vJoy
- **Low-level control**: Direct axis manipulation for minimal latency

---

## 📋 System Requirements

### Server (PC)
- **OS**: Windows 10/11
- **Python**: 3.8 or newer
- **Node.js**: 18 or newer  
- **vJoy**: Installed and configured

### Client (Mobile/Browser)
- **Android**: 10+ (Chrome, Firefox)
- **iOS**: 14+ (Safari, Chrome)
- **Desktop**: Any modern browser
- **Network**: WiFi (5GHz recommended for best latency)

---

## 🚀 Quick Start

### Option 1: Using the Launcher (Recommended)

```bash
# Clone the repository
git clone https://github.com/itsayushk19/drivingRemote.git
cd drivingRemote

# Run the launcher
python launcher/launcher.py
```

The launcher will:
1. ✅ Check and install Node.js dependencies
2. ✅ Build the web controller
3. ✅ Check and install Python dependencies  
4. ✅ Display connection info with QR code
5. ✅ Guide you through starting the servers

### Option 2: Manual Setup

**1. Install vJoy**
- Download from [vJoy SourceForge](https://sourceforge.net/projects/vjoystick/)
- Install and configure vJoy Device #1
- Enable required axes and buttons in vJoyConf

**2. Install Server Dependencies**
```bash
pip install -r server/requirements.txt
```

**3. Install and Build Controller**
```bash
cd controller
npm install
npm run dev  # For development
# OR
npm run build  # For production
```

**4. Start the Server**
```bash
python server.py
```

**5. Connect from Mobile**
- Open `http://YOUR_PC_IP:5173` on your mobile device
- Or scan the QR code displayed by the launcher
- Connect to `ws://YOUR_PC_IP:8000/ws`

---

## 📖 Documentation

- **[Usage Guide](docs/USAGE.md)**: Complete user guide
- **[Control Registry](docs/CONTROL_REGISTRY.md)**: Control type documentation
- **[Development Guide](docs/DEVELOPMENT.md)**: Developer documentation

---

## 🎯 Control Types

### Steering Wheel
- Rotation-based input with configurable range (270° - 1800°)
- Soft-center response curves for realistic feel
- Adjustable sensitivity and deadzone

### Pedal/Slider
- Linear input for throttle, brake, or other analog controls
- Vertical or horizontal orientation
- Exponential curves for precise control
- Optional snap-back behavior

### Button
- Digital on/off input
- Momentary or toggle modes
- Visual press feedback
- Supports up to 32 buttons

### Joystick ⭐ NEW
- 2-axis analog input (independent X/Y)
- Circular or square gate patterns
- Return-to-center behavior
- Independent deadzones and curves per axis

### H-Shifter ⭐ NEW
- Grid-based gear shifter
- Configurable patterns (6-speed, 7-speed, custom)
- Visual gear positions with feedback
- Neutral zone and reverse gear support

---

## 🎨 Layout System

### Creating Custom Layouts

1. Open the controller
2. Arrange controls by dragging
3. Tap controls to edit properties
4. Save with a custom name

### Layout Features

- **Drag to reposition**: Long-press and drag any control
- **Property editing**: Tap to select, edit axis, deadzone, curves
- **Save/Load**: Unlimited custom layouts
- **Import/Export**: Share layouts as `.dr` files
- **Storage monitoring**: Visual indicator of local storage usage

### Pre-Built Layouts

- **ETS2/ATS Sequential**: Steering + pedals + gear buttons + horn

---

## 🔧 Configuration

### Server Configuration

Configuration is stored in `~/.drivingRemote/config.json`:

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 8000,
    "update_rate": 120
  },
  "vjoy": {
    "device_id": 1,
    "enabled": true
  },
  "network": {
    "binary_protocol": false,
    "throttle_ms": 16
  }
}
```

### Client Configuration

Stored in browser local storage:
- Server URL
- Active layout
- Theme preferences  
- Haptic feedback settings

---

## 🎮 Using with ATS/ETS2

1. **Configure vJoy** (see Quick Start)
2. **Start server and controller**
3. **Launch ATS or ETS2**
4. **Go to Options → Controls**
5. **Select "vJoy Device"**
6. **Bind controls**:
   - Steering → X Axis
   - Throttle → Y Axis
   - Brake → Z Axis
   - Gear Up → Button 2
   - Gear Down → Button 3
   - Horn → Button 1
7. **Drive!** 🚛

---

## 🐛 Troubleshooting

### vJoy Not Working
- ✅ Ensure vJoy Device #1 is enabled in vJoyConf
- ✅ Verify axes are configured correctly
- ✅ Restart the server
- ✅ Check bindings in game

### Cannot Connect
- ✅ Verify PC and mobile are on same network
- ✅ Check firewall allows port 8000
- ✅ Confirm IP address is correct
- ✅ Ensure server is running

### High Latency
- ✅ Use 5GHz WiFi
- ✅ Move closer to router
- ✅ Close background apps
- ✅ Reduce network traffic
- ✅ Enable binary protocol (when available)

### Controls Not Responding
- ✅ Check vJoy device status
- ✅ Verify axis bindings in game
- ✅ Check control configuration (axis, deadzone)
- ✅ Test with vJoyConf monitor

### Layout Won't Save
- ✅ Check browser local storage is enabled
- ✅ Check storage quota (shown in UI)
- ✅ Try exporting as backup
- ✅ Clear old layouts if storage full

For more troubleshooting, see **[Usage Guide](docs/USAGE.md)**.

---

## 📁 Project Structure

```
drivingRemote/
├── launcher/              # Server launcher with auto-setup
├── server/                # WebSocket server and vJoy interface
│   ├── receiver.py        # Main server
│   ├── config_manager.py  # Configuration handling
│   └── telemetry.py       # Telemetry tracking
├── controller/            # React web application
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── controls/  # Control implementations
│   │   │   ├── layout/    # Layout management
│   │   │   └── ui/        # UI elements
│   │   ├── services/      # Core services
│   │   │   ├── controlRegistry.js  # Control type system
│   │   │   ├── storage.js          # Local storage
│   │   │   └── websocket.js        # WebSocket client
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── layouts/       # Built-in layouts
├── docs/                  # Documentation
└── README.md
```

---

## 🤝 Contributing

We welcome contributions! See **[Development Guide](docs/DEVELOPMENT.md)** for:
- Setting up development environment
- Code style guidelines
- Adding new control types
- Testing procedures
- Pull request process

---

## 📜 License

MIT License - see LICENSE file for details

---

## 🎯 Roadmap

- [ ] UDP protocol option for ultra-low latency
- [ ] Haptic feedback support
- [ ] Custom skins and themes
- [ ] Gesture controls
- [ ] Multi-controller support
- [ ] Cloud layout sync
- [ ] Analytics dashboard
- [ ] Plugin system

---

## 💡 Use Cases

- **No Hardware?** Use your phone as a steering wheel
- **Extra Controls?** Add a secondary touchscreen panel
- **DIY Sim Rig?** Build a custom touchscreen dashboard
- **Testing?** Prototype control layouts before buying hardware
- **Portable Setup?** Take your controls anywhere

---

## ⭐ Show Your Support

If you find this project useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code
- 📢 Sharing with others

---

**Happy Driving! 🚛**
