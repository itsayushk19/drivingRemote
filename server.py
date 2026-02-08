from flask import Flask, send_from_directory
from flask_sock import Sock
import json
import time
import os
from pathlib import Path

from rich.console import Console
from rich.live import Live
from rich.table import Table
from rich.text import Text

# vJoy is Windows-only, make it optional for testing
try:
    import pyvjoy
    VJOY_AVAILABLE = True
except ImportError:
    VJOY_AVAILABLE = False
    print("⚠️  Warning: pyvjoy not available (Windows only)")

# ---------------- APP ----------------
# Get project root and controller dist path
PROJECT_ROOT = Path(__file__).parent.absolute()
CONTROLLER_DIST = PROJECT_ROOT / "controller" / "dist"

# Initialize Flask with static file serving
app = Flask(__name__, 
            static_folder=str(CONTROLLER_DIST) if CONTROLLER_DIST.exists() else None,
            static_url_path='')
sock = Sock(app)
console = Console()

# ---------------- vJOY ----------------
if VJOY_AVAILABLE:
    try:
        j = pyvjoy.VJoyDevice(1)
    except Exception as e:
        console.print(f"⚠️  Warning: Could not initialize vJoy device: {e}", style="yellow")
        VJOY_AVAILABLE = False

VJOY_AXES = {
    "X": pyvjoy.HID_USAGE_X if VJOY_AVAILABLE else 0x30,
    "Y": pyvjoy.HID_USAGE_Y if VJOY_AVAILABLE else 0x31,
    "Z": pyvjoy.HID_USAGE_Z if VJOY_AVAILABLE else 0x32,
    "RX": pyvjoy.HID_USAGE_RX if VJOY_AVAILABLE else 0x33,
    "RY": pyvjoy.HID_USAGE_RY if VJOY_AVAILABLE else 0x34,
    "RZ": pyvjoy.HID_USAGE_RZ if VJOY_AVAILABLE else 0x35,
    "SLIDER1": pyvjoy.HID_USAGE_SL0 if VJOY_AVAILABLE else 0x36,
    "SLIDER2": pyvjoy.HID_USAGE_SL1 if VJOY_AVAILABLE else 0x37,
}

def axis_to_vjoy(value, mode):
    if mode == "normal":
        value = max(0.0, min(1.0, value))
        return int(value * 32767)

    value = max(-1.0, min(1.0, value))
    return int((value + 1.0) * 16383.5)

# ---------------- LIVE STATE ----------------
state = {
    "layout": "—",
    "axes": {},
    "buttons": {},
    "pps": 0,                 # packets per second
    "cadence_raw": None,      # fast update (ms)
    "cadence": None,          # displayed (ms)
}

# ---------------- TIMING ----------------
last_ctrl_recv = None

CADENCE_DISPLAY_INTERVAL = 0.5
last_cadence_display_update = 0.0

packet_counter = 0
last_pps_time = time.time()

# ---------------- DASHBOARD ----------------
def render_dashboard():
    table = Table(title="🎮 vJoy Live Telemetry", expand=True)

    table.add_column("Metric", style="cyan", no_wrap=True)
    table.add_column("Value", style="white")

    cadence = (
        f"{state['cadence']:.1f} ms"
        if state["cadence"] is not None
        else "—"
    )

    table.add_row("🎛 Control Interval (Δ)", cadence)
    table.add_row("📦 Control Rate", f"{state['pps']} pkt/s")

    table.add_section()
    table.add_row("Layout", state["layout"])

    # ---- AXES ----
    for axis, data in state["axes"].items():
        val = data["value"]
        mode = data["mode"]
        bar_len = 20

        if mode == "centered":
            mid = bar_len // 2
            offset = int(val * mid)
            left = mid + min(offset, 0)
            right = mid + max(offset, 0)
            bar = (
                "░" * left +
                "█" * (right - left) +
                "░" * (bar_len - right)
            )
        else:
            fill = int(max(0.0, min(1.0, val)) * bar_len)
            bar = "█" * fill + "░" * (bar_len - fill)

        table.add_row(
            f"{axis} ({mode}) {val:+.2f}",
            Text(bar, style="green")
        )

    # ---- BUTTONS ----
    if state["buttons"]:
        btns = []
        for k, v in sorted(state["buttons"].items()):
            btns.append(
                f"[{'green' if v else 'red'}]{k} {'ON' if v else 'OFF'}[/]"
            )
        table.add_row("Buttons", " | ".join(btns))

    return table

# ---------------- WS HANDLER ----------------
@sock.route("/ws")
def ws_handler(ws):
    global last_ctrl_recv
    global packet_counter, last_pps_time, last_cadence_display_update

    console.print("\n📱 Client connected", style="bold green")

    with Live(render_dashboard(), console=console, refresh_per_second=25) as live:
        try:
            while True:
                msg = ws.receive()
                if msg is None:
                    break

                if isinstance(msg, bytes):
                    try:
                        msg = msg.decode("utf-8")
                    except:
                        continue

                try:
                    packet = json.loads(msg)
                except:
                    continue

                # ---- ONLY CONTROL PACKETS ----
                if packet.get("type") != "controls":
                    continue

                packet_counter += 1
                now_perf = time.perf_counter()

                # ---- CONTROL CADENCE (Δ) ----
                if last_ctrl_recv is not None:
                    state["cadence_raw"] = (now_perf - last_ctrl_recv) * 1000
                last_ctrl_recv = now_perf

                # ---- THROTTLE DISPLAY (0.5 s) ----
                now_wall = time.time()
                if (
                    state["cadence_raw"] is not None
                    and now_wall - last_cadence_display_update >= CADENCE_DISPLAY_INTERVAL
                ):
                    state["cadence"] = state["cadence_raw"]
                    last_cadence_display_update = now_wall

                data = packet.get("data", {})
                state["layout"] = data.get("meta", {}).get("layoutName", "—")

                axes = data.get("axes", {})
                buttons = data.get("buttons", {})

                state["axes"] = {
                    k: {
                        "value": float(v.get("value", 0)),
                        "mode": v.get("mode", "centered"),
                    }
                    for k, v in axes.items()
                    if isinstance(v, dict)
                }

                state["buttons"] = {
                    int(k): bool(v)
                    for k, v in buttons.items()
                }

                # ---- APPLY TO vJOY (FULL RATE) ----
                if VJOY_AVAILABLE:
                    for axis, axis_data in axes.items():
                        if axis not in VJOY_AXES:
                            continue
                        try:
                            j.set_axis(
                                VJOY_AXES[axis],
                                axis_to_vjoy(
                                    float(axis_data.get("value", 0)),
                                    axis_data.get("mode", "centered"),
                                ),
                            )
                        except Exception:
                            pass

                    for btn, pressed in buttons.items():
                        try:
                            j.set_button(int(btn), int(bool(pressed)))
                        except Exception:
                            pass

                # ---- PACKETS PER SECOND ----
                if now_wall - last_pps_time >= 1.0:
                    state["pps"] = packet_counter
                    packet_counter = 0
                    last_pps_time = now_wall

                live.update(render_dashboard())

        except Exception as e:
            console.print(f"\n❌ WebSocket error: {e}", style="bold red")

    console.print("\n❌ Client disconnected", style="bold red")

# ---------------- STATIC FILE ROUTES ----------------
@app.route('/')
def index():
    """Serve the controller web app index.html"""
    if CONTROLLER_DIST.exists():
        return send_from_directory(str(CONTROLLER_DIST), 'index.html')
    else:
        return """
        <html>
            <head><title>Driving Remote Controller</title></head>
            <body style="font-family: sans-serif; padding: 40px; background: #111; color: #fff;">
                <h1>⚠️ Controller Not Built</h1>
                <p>The controller web app has not been built yet.</p>
                <p>Please run:</p>
                <pre style="background: #222; padding: 10px; border-radius: 5px;">cd controller && npm install && npm run build</pre>
                <p>Or use the launcher:</p>
                <pre style="background: #222; padding: 10px; border-radius: 5px;">python launcher/launcher.py</pre>
            </body>
        </html>
        """, 503

@app.route('/<path:path>')
def static_files(path):
    """Serve static files from the controller dist folder"""
    if CONTROLLER_DIST.exists():
        return send_from_directory(str(CONTROLLER_DIST), path)
    else:
        return "Controller not built", 404

# ---------------- START ----------------
if __name__ == "__main__":
    console.print("🚀 vJoy WebSocket Server running on :8000", style="bold cyan")
    if CONTROLLER_DIST.exists():
        console.print(f"📁 Serving controller from {CONTROLLER_DIST}", style="green")
        console.print("🌐 Open http://localhost:8000 in your browser", style="cyan")
    else:
        console.print(f"⚠️  Controller not built at {CONTROLLER_DIST}", style="yellow")
        console.print("   Run: python launcher/launcher.py", style="dim")
    app.run(host="0.0.0.0", port=8000)
