# Driving Remote Controller – Mobile & Web Controller for ATS / ETS2 (vJoy)

Driving Remote Controller is a **high-performance mobile and web-based controller** for **American Truck Simulator (ATS)** and **Euro Truck Simulator 2 (ETS2)** built on top of **vJoy**.  
It allows your **phone, tablet, or any browser** to act as a **steering wheel, pedals, buttons, switches, and custom control panel**, communicating with your PC in **real time via WebSocket**.

This project is designed for sim-racing and truck-sim enthusiasts who want a **custom touchscreen controller**, **secondary input device**, or **DIY simulator controller** without buying expensive hardware.

------------------------------------------------------------

## Why Driving Remote Controller?

Unlike generic mobile controller apps, Driving Remote Controller is:

- Built **specifically for ATS / ETS2**
- Designed around **real truck controls** (steering, pedals, gearbox, toggles)
- Fully **customizable with layouts**
- **Low-latency** and optimized for real-time control
- **Open-source** and fully transparent
- Uses **vJoy**, making it compatible with many other PC games as well

------------------------------------------------------------

## Key Features (Detailed)

### 🎮 Real-Time Control via WebSocket
- Uses raw WebSocket communication for **extremely low latency**
- Control updates are sent at high frequency
- Server displays **live packet rate and cadence** for debugging and tuning

### 📱 Mobile-Friendly Web Controller
- Works on **Android, iOS, tablets, and desktop browsers**
- No app installation required — runs entirely in the browser
- Responsive UI designed for touch input

### 🕹 vJoy Virtual Joystick Integration
- Outputs all inputs to **vJoy virtual joystick**
- Games see the controller as a **real hardware joystick**
- Supports axes, sliders, and buttons
- Compatible with ATS, ETS2, and any game that supports vJoy

### 🧩 Custom Control Layouts
- Multiple layouts supported
- Layouts define:
  - Control positions
  - Axis behavior
  - Button mappings
- Easily switch layouts depending on vehicle or game

### 💾 Layout Persistence
- Layouts are saved in browser **local storage**
- No server-side database required
- Layouts persist across page reloads

### 📦 Layout Import & Export
- Export layouts as `.dr` files
- Share layouts between devices or users
- Import layouts instantly
- Ideal for community sharing

### 📊 Live Server Telemetry
- Console dashboard shows:
  - Connection status
  - Active layout name
  - Packets per second (control rate)
  - Control cadence (Δ ms)
- Helps diagnose latency, dropped packets, or network issues

### ⚡ Optimized for Low Latency
- No polling frameworks
- No unnecessary UI animations
- Minimal JSON payloads
- Designed for **real-time simulation**, not casual input

### 🔌 Network-Based Control
- Phone and PC communicate over local Wi-Fi
- No USB cables
- No Bluetooth pairing
- Multiple devices can connect (with layout control)

### 🛠 Developer-Friendly
- Clean project structure
- Easy to modify layouts and UI
- Frontend and backend clearly separated
- Suitable for experimentation and extension

------------------------------------------------------------

## Project Structure

driving-remote/
├─ server.py # Python server (Flask + WebSocket + vJoy)
├─ controller/ # Frontend web controller
│ ├─ src/
│ ├─ public/
│ ├─ package.json
│ └─ ...
├─ .gitignore
└─ README.md


------------------------------------------------------------

## System Requirements

### Server (PC)
- Windows 10 / 11
- Python 3.10 or newer
- vJoy installed and configured
- Node.js 18 or newer

### Python Dependencies
- flask
- flask-sock
- pyvjoy
- rich

------------------------------------------------------------

## Step 1 — Install and Configure vJoy

1. Download vJoy from:
   https://sourceforge.net/projects/vjoystick/
2. Install vJoy on your PC
3. Open **vJoyConf**
4. Enable **vJoy Device #1**
5. Enable required axes and buttons
6. Click **Apply**

vJoy must be installed and configured before running the server.

------------------------------------------------------------

## Step 2 — Run the Python Server

From the project root directory:

pip install flask flask-sock pyvjoy rich  
python server.py

The server:
- Listens on port **8000**
- Outputs all inputs to **vJoy Device #1**
- Displays a live telemetry dashboard in the console

------------------------------------------------------------

## Step 3 — Run the Frontend Controller

cd controller  
npm install  
npm run dev  

The frontend will start and show a local URL such as:

http://localhost:5173

------------------------------------------------------------

## Step 4 — Connect from Phone or Browser

1. Ensure your PC and phone are on the same local network
2. Open the frontend URL on your phone or browser
3. Enter the WebSocket server address:

ws://<PC_LOCAL_IP>:8000/ws

Example:
ws://192.168.0.112:8000/ws

4. Connect

Once connected, your phone becomes a real-time controller for your PC.

------------------------------------------------------------

## Step 5 — Use in ATS / ETS2

1. Launch American Truck Simulator or Euro Truck Simulator 2
2. Open **Controls**
3. Select **vJoy Device** as the active controller
4. Bind steering, pedals, gearbox, and buttons
5. Start driving

------------------------------------------------------------

## Layout System Explained

- Built-in layouts are provided by default
- Custom layouts are stored locally in the browser
- Each layout can define:
  - Axis type (centered or normal)
  - Button mappings
  - Control grouping
- Layouts can be exported and imported using `.dr` files

------------------------------------------------------------

## Troubleshooting

**vJoy not responding**
- Ensure vJoy Device #1 is enabled in vJoyConf
- Verify bindings inside the game
- Restart the server if needed

**Phone cannot connect**
- Check firewall allows port 8000
- Verify PC local IP address
- Ensure `ws://` is used (not `http://`)

**High latency or jitter**
- Use 5 GHz Wi-Fi if available
- Keep phone screen awake
- Close background apps on the phone
- Avoid crowded networks

------------------------------------------------------------

## Who Is This For?

- ATS / ETS2 players without steering wheels
- Players who want extra buttons or panels
- DIY simulator builders
- Developers experimenting with vJoy
- Anyone who wants a customizable mobile controller

------------------------------------------------------------

## License

MIT License

------------------------------------------------------------

Driving Remote Controller is a powerful, flexible, and open-source solution for using your phone as a professional-grade controller for ATS and ETS2 using vJoy.

Enjoy driving 🚛

   
