# Driving Remote Controller for ATS / ETS2 (vJoy Web Controller)

Driving Remote Controller is a low-latency **mobile and web-based controller** for **American Truck Simulator (ATS)** and **Euro Truck Simulator 2 (ETS2)** using **vJoy**.  
It allows your phone or any browser to act as a steering wheel, pedals, and button panel by sending real-time inputs to a Windows PC over **WebSocket**, which are then mapped to a **vJoy virtual joystick**.

This project is ideal for players who want a **custom touchscreen controller**, **secondary input device**, or **DIY sim controller** for ATS / ETS2.

------------------------------------------------------------

## Features

- Mobile-friendly web controller (phone, tablet, or browser)
- Real-time low-latency WebSocket communication
- vJoy virtual joystick integration
- Customizable control layouts
- Layout import and export (`.dr` files)
- Live server telemetry (packet rate and cadence)
- Works with ATS, ETS2, and other games supporting vJoy
- No additional hardware required

------------------------------------------------------------

## Project Structure

driving-remote/
├─ server.py              (Python server: Flask + WebSocket + vJoy)
├─ controller/            (Frontend web controller)
│  ├─ src/
│  ├─ public/
│  ├─ package.json
│  └─ ...
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
5. Enable the required axes and buttons
6. Click **Apply**

vJoy must be installed and configured before running the server.

------------------------------------------------------------

## Step 2 — Run the Python Server

From the project root directory:

pip install flask flask-sock pyvjoy rich  
python server.py

The server:
- Listens on port **8000**
- Outputs inputs to **vJoy Device #1**
- Displays live telemetry in the console

------------------------------------------------------------

## Step 3 — Run the Frontend Controller

cd controller  
npm install  
npm run dev

The frontend will start and display a local URL such as:

http://localhost:5173

------------------------------------------------------------

## Step 4 — Connect from Phone or Browser

1. Ensure your PC and phone are on the same local network
2. Open the frontend URL on your phone or browser
3. Enter the WebSocket server address:

ws://<PC_LOCAL_IP>:8000/ws

Example:
ws://192.168.0.112:8000/ws

4. Connect to the server

Once connected, all inputs from the web controller are sent to vJoy in real time.

------------------------------------------------------------

## Step 5 — Use in ATS / ETS2

1. Launch American Truck Simulator or Euro Truck Simulator 2
2. Open **Controls**
3. Select **vJoy Device** as the input device
4. Bind steering, pedals, and buttons
5. Start driving

------------------------------------------------------------

## Layouts

- Built-in layouts are included by default
- Custom layouts are saved in browser local storage
- Layouts can be renamed, exported, and imported across devices

------------------------------------------------------------

## Troubleshooting

**vJoy not responding**
- Verify vJoy Device #1 is enabled in vJoyConf
- Ensure controls are bound to vJoy inside the game

**Phone cannot connect**
- Check that port 8000 is allowed through the firewall
- Confirm the correct local IP address
- Use `ws://` (not `http://`)

**High latency**
- Prefer 5 GHz Wi-Fi
- Keep the phone screen awake
- Close background apps on the phone

------------------------------------------------------------

## License

MIT License

------------------------------------------------------------

Driving Remote Controller provides a flexible and powerful way to use your phone as a controller for ATS and ETS2 using vJoy. Enjoy driving 🚛
