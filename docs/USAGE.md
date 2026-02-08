# Usage Guide

Complete guide to using the Driving Remote Controller system.

## Quick Start

### Method 1: Using the Launcher (Recommended)

1. **Run the launcher**:
   ```bash
   python launcher/launcher.py
   ```

   The launcher will automatically:
   - Check and install Node.js dependencies
   - Build the web controller
   - Check and install Python dependencies
   - Display connection information with QR code

2. **Start the servers** (follow launcher instructions):
   ```bash
   # Terminal 1: Start web controller
   cd controller
   npm run dev

   # Terminal 2: Start WebSocket server
   python server.py
   ```

3. **Connect from your mobile device**:
   - Open the displayed URL on your phone/tablet
   - Or scan the QR code
   - Enter the WebSocket server URL if needed

### Method 2: Manual Setup

1. **Install controller dependencies**:
   ```bash
   cd controller
   npm install
   npm run dev
   ```

2. **Install server dependencies**:
   ```bash
   pip install -r server/requirements.txt
   ```

3. **Run the server**:
   ```bash
   python server.py
   ```

4. **Connect**:
   - Open `http://YOUR_IP:5173` on your mobile device
   - Connect to `ws://YOUR_IP:8000/ws`

## Using the Controller

### Connection Page

1. **Enter Server URL**:
   - Format: `ws://YOUR_PC_IP:8000/ws`
   - Example: `ws://192.168.1.100:8000/ws`

2. **Connect**:
   - Tap "Connect" button
   - Wait for green "Connected" status
   - Latency will be displayed

### Layout Management

#### Viewing Layouts

- Tap the "Layouts" tab in the bottom bar
- See all available layouts:
  - **Built-in layouts**: Default layouts (cannot be deleted)
  - **Custom layouts**: Your saved layouts

#### Opening a Layout

- Tap any layout card
- The layout will load in the Controller page
- All controls will be interactive

#### Creating a Custom Layout

1. Start with an existing layout (or default)
2. Tap the "💾 Save" button in the Controller page
3. Enter a name for your layout
4. Tap "Save"

Your layout is now saved and can be selected from the Layouts page.

#### Editing a Layout

1. Open the layout you want to edit
2. Controls are already editable by default
3. **Move controls**: Long-press and drag
4. **Edit properties**: Tap a control to select it
5. Use the property panel to adjust:
   - Axis assignment
   - Deadzone
   - Sensitivity
   - Curves
   - Other control-specific settings

#### Deleting a Layout

1. Go to the Layouts page
2. Find your custom layout
3. Tap the "Delete" button
4. Confirm deletion

#### Importing/Exporting Layouts

**Export**:
1. Go to Layouts page
2. Find the layout to export
3. Tap "Export" button
4. A `.dr` file will be downloaded

**Import**:
1. Go to Layouts page
2. Tap "⤵ Import" button
3. Select a `.dr` file
4. The layout will be added to your layouts

### Controller Page

This is where you actually control the game.

#### Available Controls

- **Steering Wheel**: Rotate to steer
- **Pedals/Sliders**: Slide up/down for throttle, brake
- **Buttons**: Tap for horn, lights, etc.
- **Joystick**: 2-axis analog control
- **H-Shifter**: Tap gear positions to shift

#### Top Bar

- **Menu (☰)**: Expand bottom bar if collapsed
- **Layout Selector**: Switch between layouts
- **Save**: Save current layout as new
- **Rename**: Rename current layout
- **Delete**: Delete current layout
- **Storage Meter**: Shows local storage usage
- **Latency**: Current network latency in ms

#### Edit Mode

Controls are editable by default. To move them:
1. Long-press a control
2. Drag to new position
3. Release

To edit properties:
1. Tap a control to select it
2. Use the property panel (if visible)

## Control Types

### Steering Wheel

- **Rotate**: Touch and drag around the wheel
- **Returns to center**: Automatically when released
- **Configurable rotation range**: 270° to 1800°

### Pedal/Slider

- **Vertical**: Slide up/down
- **Value**: 0 (bottom) to 1 (top)
- **Optional snap-back**: Returns to 0 when released

### Button

- **Momentary**: Active only while pressed
- **Toggle**: Stays on/off until pressed again

### Joystick

- **2-axis control**: Move in any direction
- **Circular or square gate**: Configurable
- **Returns to center**: When released (if enabled)
- **Independent X/Y configuration**: Different deadzones and curves

### H-Shifter

- **Grid layout**: Visual gear positions
- **Tap to shift**: Select a gear position
- **Returns to neutral**: When released
- **Configurable pattern**: Standard 6-speed, 7-speed, etc.

## Advanced Features

### Response Curves

Adjust how controls respond to input:

- **Linear**: Direct 1:1 mapping
- **Soft Center**: Less sensitive near center (good for steering)
- **Exponential**: More sensitive away from center (good for pedals)

### Deadzone

Set a zone where small inputs are ignored:
- Reduces jitter
- Makes it easier to hit exact values (like 0)
- Typical values: 0.02 - 0.1

### Axis Assignment

Map controls to different vJoy axes:
- **X, Y, Z**: Standard axes
- **RX, RY, RZ**: Rotation axes
- **SLIDER1, SLIDER2**: Slider axes

## Troubleshooting

### Cannot Connect

- Check that PC and mobile are on the same network
- Verify the IP address is correct
- Check Windows Firewall allows port 8000
- Make sure server is running

### High Latency

- Use 5GHz WiFi if available
- Move closer to router
- Close background apps on mobile
- Reduce network traffic

### Controls Not Working

- Check vJoy is installed and configured
- Verify vJoy Device #1 is enabled
- Check axis bindings in game settings
- Restart the server

### Layout Not Saving

- Check browser local storage is enabled
- Check storage quota (shown in top bar)
- Try exporting layout as backup

### Storage Full

- Delete unused layouts
- Export important layouts
- Clear browser data for the app
- Use "Delete All" button (with caution!)

## Performance Tips

### For Best Latency

1. Use a direct WiFi connection (not through mobile data)
2. Use 5GHz WiFi band if available
3. Keep phone screen awake
4. Close background apps
5. Use binary protocol (when enabled)

### For Smooth Operation

1. Don't run too many controls simultaneously
2. Keep layouts simple
3. Use appropriate deadzone values
4. Test latency before playing

## Game Setup (ATS/ETS2)

1. **Install and configure vJoy** (see main README)
2. **Start the server and controller**
3. **Launch the game**
4. **Go to Options > Controls**
5. **Select "vJoy Device" as input**
6. **Bind controls**:
   - Steering → X Axis
   - Throttle → Y Axis
   - Brake → Z Axis
   - Buttons → Corresponding button numbers
7. **Test in-game**
8. **Adjust sensitivity** in game settings if needed

## Keyboard Shortcuts

(When focused on controller page)

- **Esc**: Return to layouts page
- **Space**: Toggle edit mode (when implemented)
- **Ctrl+S**: Save layout
- **Ctrl+Z**: Undo (when implemented)
- **Ctrl+Y**: Redo (when implemented)

## Mobile Device Compatibility

### Tested Devices

- ✅ Android 10+ (Chrome, Firefox)
- ✅ iOS 14+ (Safari, Chrome)
- ✅ Tablets (all sizes)
- ✅ Desktop browsers (for testing)

### Recommended

- Screen size: 5" or larger
- WiFi 5GHz capable
- Recent browser version
- Touch screen (obviously!)

## Support

If you encounter issues:

1. Check this guide
2. Check the main README
3. Check the GitHub Issues page
4. Create a new issue with:
   - Your setup (PC, mobile device, network)
   - Steps to reproduce
   - Error messages or screenshots
