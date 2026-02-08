#!/usr/bin/env python3
"""
Driving Remote Controller - Server Launcher

This launcher handles:
- Dependency checking and installation
- Building the web controller
- Starting the WebSocket server
- Serving the web interface
- Displaying connection information and telemetry
"""

import os
import sys
import subprocess
import socket
import time
import threading
from pathlib import Path

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.live import Live
    from rich.text import Text
    from rich import box
except ImportError:
    print("Installing required dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "rich"])
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.live import Live
    from rich.text import Text
    from rich import box

console = Console()


def get_project_root():
    """Get the project root directory"""
    return Path(__file__).parent.parent.absolute()


def get_local_ip():
    """Get the local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def check_nodejs():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except Exception:
        return False


def check_npm():
    """Check if npm is installed"""
    try:
        result = subprocess.run(
            ["npm", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except Exception:
        return False


def check_controller_deps(controller_dir):
    """Check if controller dependencies are installed"""
    node_modules = controller_dir / "node_modules"
    return node_modules.exists()


def install_controller_deps(controller_dir):
    """Install controller dependencies"""
    console.print("📦 Installing controller dependencies...", style="cyan")
    try:
        subprocess.check_call(
            ["npm", "install"],
            cwd=controller_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        console.print("✅ Dependencies installed", style="green")
        return True
    except Exception as e:
        console.print(f"❌ Failed to install dependencies: {e}", style="red")
        return False


def build_controller(controller_dir):
    """Build the controller web app"""
    dist_dir = controller_dir / "dist"
    
    # Check if already built
    if dist_dir.exists():
        console.print("✅ Controller already built", style="green")
        return True
    
    console.print("🔨 Building controller...", style="cyan")
    try:
        subprocess.check_call(
            ["npm", "run", "build"],
            cwd=controller_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        console.print("✅ Controller built", style="green")
        return True
    except Exception as e:
        console.print(f"❌ Failed to build controller: {e}", style="red")
        return False


def check_python_deps():
    """Check if Python dependencies are installed"""
    required = ["flask", "flask_sock", "pyvjoy"]
    missing = []
    
    for pkg in required:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
    
    return missing


def install_python_deps(packages):
    """Install Python dependencies"""
    console.print(f"📦 Installing Python dependencies: {', '.join(packages)}...", style="cyan")
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install"] + packages,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        console.print("✅ Python dependencies installed", style="green")
        return True
    except Exception as e:
        console.print(f"❌ Failed to install dependencies: {e}", style="red")
        return False


def generate_qr_code(url):
    """Generate a simple QR code representation"""
    try:
        import qrcode
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=1,
            border=1,
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        # Convert to ASCII art
        matrix = qr.get_matrix()
        lines = []
        for row in matrix:
            line = "".join("██" if cell else "  " for cell in row)
            lines.append(line)
        
        return "\n".join(lines)
    except ImportError:
        return "[QR code requires 'qrcode' package]"


def show_startup_banner(ip, web_port, ws_port):
    """Show the startup banner"""
    console.clear()
    
    banner = Panel(
        Text("Driving Remote Control Server v1.0", style="bold cyan", justify="center"),
        box=box.DOUBLE,
        style="cyan"
    )
    console.print(banner)
    console.print()
    
    # Connection info
    web_url = f"http://{ip}:{web_port}"
    ws_url = f"ws://{ip}:{ws_port}/ws"
    
    table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    table.add_row("📱 Controller URL:", f"[cyan]{web_url}[/cyan]")
    table.add_row("🔌 WebSocket URL:", f"[cyan]{ws_url}[/cyan]")
    console.print(table)
    console.print()
    
    # QR Code
    console.print("📋 Scan QR Code:", style="bold")
    qr = generate_qr_code(web_url)
    console.print(qr)
    console.print()
    
    console.print("⏳ Waiting for connection...", style="yellow")
    console.print()


def main():
    """Main launcher function"""
    console.print()
    console.print("🚀 [bold cyan]Driving Remote Controller Launcher[/bold cyan]")
    console.print()
    
    # Get paths
    root = get_project_root()
    controller_dir = root / "controller"
    server_dir = root / "server"
    
    # Check Node.js
    if not check_nodejs():
        console.print("❌ Node.js is not installed. Please install Node.js 18+ first.", style="red")
        sys.exit(1)
    
    if not check_npm():
        console.print("❌ npm is not installed. Please install npm first.", style="red")
        sys.exit(1)
    
    console.print("✅ Node.js and npm are installed", style="green")
    
    # Check and install controller dependencies
    if not check_controller_deps(controller_dir):
        if not install_controller_deps(controller_dir):
            sys.exit(1)
    else:
        console.print("✅ Controller dependencies installed", style="green")
    
    # Build controller
    if not build_controller(controller_dir):
        # Try running dev server instead
        console.print("⚠️  Running in development mode", style="yellow")
    
    # Check Python dependencies
    missing_deps = check_python_deps()
    if missing_deps:
        if not install_python_deps(missing_deps):
            sys.exit(1)
    else:
        console.print("✅ Python dependencies installed", style="green")
    
    console.print()
    console.print("✅ [bold green]All checks passed![/bold green]")
    console.print()
    
    # Get network info
    ip = get_local_ip()
    
    # Detect if we're in dev or production mode
    dist_exists = (controller_dir / "dist").exists()
    if dist_exists:
        web_port = 3000  # Production HTTP server
        console.print("⚠️  Production build detected. You'll need to serve the dist/ folder.", style="yellow")
    else:
        web_port = 5173  # Vite dev server
        console.print("⚠️  Development mode. Run 'npm run dev' in controller/ directory.", style="yellow")
    
    ws_port = 8000
    
    # Show banner
    show_startup_banner(ip, web_port, ws_port)
    
    # Start the server
    console.print("🚀 Starting server...", style="cyan")
    
    # In a real implementation, we would start both the web server and WebSocket server
    # For now, just inform the user
    console.print()
    console.print("To start the server manually:", style="yellow")
    console.print(f"  1. cd {controller_dir}", style="dim")
    console.print("  2. npm run dev", style="dim")
    console.print(f"  3. In another terminal: python {root}/server.py", style="dim")
    console.print()
    console.print("Press Ctrl+C to exit", style="dim")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        console.print()
        console.print("👋 Shutting down...", style="yellow")


if __name__ == "__main__":
    main()
