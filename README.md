# Driving Remote Controller

A low-latency mobile / web controller for ATS / ETS2 using vJoy.
Your phone or browser acts as a controller and sends real-time inputs to a PC via WebSocket, which are mapped to a vJoy virtual joystick.

------------------------------------------------------------

FEATURES

- Mobile-friendly web controller
- Real-time WebSocket input
- vJoy virtual joystick output
- Customizable control layouts
- Layout import / export
- Live server telemetry (rate & cadence)
- Works with ATS / ETS2 and similar simulators

------------------------------------------------------------

PROJECT STRUCTURE

driving-remote/
├─ server.py
├─ controller/
│  ├─ src/
│  ├─ public/
│  ├─ package.json
│  └─ ...
├─ .gitignore
└─ README.md

------------------------------------------------------------

REQUIREMENTS

PC (Server):
- Windows
- Python 3.10+
- vJoy installed
- Node.js 18+

Python packages:
- flask
- flask-sock
- pyvjoy
- rich

------------------------------------------------------------

STEP 1 — INSTALL vJOY

1. Download vJoy from:
   https://sourceforge.net/projects/vjoystick/
2. Install vJoy
3. Open vJoyConf
4. Enable vJoy Device #1
5. Enable required axes and buttons
6. Click Apply

------------------------------------------------------------

STEP 2 — RUN THE SERVER

From the project root:

pip install flask flask-sock pyvjoy rich
python server.py

The server runs on port 8000 and outputs to vJoy Device #1.

------------------------------------------------------------

STEP 3 — RUN THE FRONTEND

cd controller
npm install
npm run dev

This will show a local URL such as:
http://localhost:5173

------------------------------------------------------------

STEP 4 — CONNECT FROM PHONE OR BROWSER

1. Make sure the PC and phone are on the same network
2. Open the frontend URL on your phone
3. Enter the WebSocket server address:

ws://<PC_LOCAL_IP>:8000/ws

Example:
ws://192.168.0.112:8000/ws

4. Connect

------------------------------------------------------------

STEP 5 — USE IN ATS / ETS2

1. Launch ATS or ETS2
2. Open Controls
3. Select vJoy Device
4. Bind axes and buttons
5. Start driving

------------------------------------------------------------

LAYOUTS

- Built-in layouts are included
- Custom layouts are stored in local storage
- Layouts can be renamed, exported, and imported

------------------------------------------------------------

TROUBLESHOOTING

vJoy not responding:
- Ensure vJoy Device #1 is enabled in vJoyConf
- Bind controls to vJoy in the game

Phone cannot connect:
- Check firewall allows port 8000
- Ensure correct local IP
- Use ws:// not http://

High latency:
- Use 5 GHz Wi-Fi if possible
- Keep phone screen awake
- Close background apps

------------------------------------------------------------

LICENSE

MIT

------------------------------------------------------------

Enjoy driving 🚛
