#!/usr/bin/env python3
"""
Build script for creating standalone DrivingRemote.exe

This script:
1. Ensures controller is built
2. Packages everything using PyInstaller
3. Creates a single executable file

Usage:
    python build_exe.py
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def main():
    print("=" * 60)
    print("🔨 Building DrivingRemote Standalone Executable")
    print("=" * 60)
    print()

    # Get project root
    root = Path(__file__).parent.absolute()
    controller_dir = root / "controller"
    dist_dir = controller_dir / "dist"
    build_output = root / "dist"
    
    # Step 1: Check for Node.js
    print("📦 Step 1: Checking Node.js...")
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Node.js not found. Please install Node.js 18+ first.")
            sys.exit(1)
        print(f"   ✅ Node.js {result.stdout.strip()}")
    except FileNotFoundError:
        print("❌ Node.js not found. Please install Node.js 18+ first.")
        sys.exit(1)
    
    # Step 2: Install controller dependencies
    print()
    print("📦 Step 2: Installing controller dependencies...")
    if not (controller_dir / "node_modules").exists():
        print("   Running npm install...")
        result = subprocess.run(["npm", "install"], cwd=controller_dir)
        if result.returncode != 0:
            print("❌ Failed to install dependencies")
            sys.exit(1)
    print("   ✅ Dependencies installed")
    
    # Step 3: Build controller
    print()
    print("🔨 Step 3: Building controller...")
    
    # Clean old dist
    if dist_dir.exists():
        print("   Cleaning old build...")
        shutil.rmtree(dist_dir)
    
    print("   Running npm run build...")
    result = subprocess.run(["npm", "run", "build"], cwd=controller_dir)
    if result.returncode != 0:
        print("❌ Failed to build controller")
        sys.exit(1)
    
    if not dist_dir.exists():
        print("❌ Build failed: dist/ folder not created")
        sys.exit(1)
    
    print("   ✅ Controller built")
    
    # Step 4: Install PyInstaller
    print()
    print("📦 Step 4: Checking PyInstaller...")
    try:
        import PyInstaller
        print("   ✅ PyInstaller already installed")
    except ImportError:
        print("   Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("   ✅ PyInstaller installed")
    
    # Step 5: Build executable
    print()
    print("🔨 Step 5: Building executable...")
    
    # Clean old build
    if build_output.exists():
        print("   Cleaning old executable...")
        shutil.rmtree(build_output)
    
    build_dir = root / "build"
    if build_dir.exists():
        shutil.rmtree(build_dir)
    
    spec_file = root / "DrivingRemote.spec"
    if spec_file.exists():
        spec_file.unlink()
    
    # PyInstaller command
    cmd = [
        "pyinstaller",
        "--onefile",
        "--name=DrivingRemote",
        "--clean",
        "--noconfirm",
        f"--add-data={dist_dir}{os.pathsep}controller/dist",
        "--hidden-import=flask",
        "--hidden-import=flask_sock",
        "--hidden-import=pyvjoy",
        "--hidden-import=rich",
        "--hidden-import=rich.console",
        "--hidden-import=rich.panel",
        "--hidden-import=rich.table",
        "--hidden-import=rich.live",
        "--hidden-import=rich.text",
        "--hidden-import=qrcode",
        "--collect-all=flask",
        "--collect-all=flask_sock",
        "launcher/launcher.py"
    ]
    
    print(f"   Running PyInstaller...")
    result = subprocess.run(cmd, cwd=root)
    
    if result.returncode != 0:
        print("❌ Failed to build executable")
        sys.exit(1)
    
    exe_file = build_output / ("DrivingRemote.exe" if sys.platform == "win32" else "DrivingRemote")
    
    if not exe_file.exists():
        print("❌ Executable not found after build")
        sys.exit(1)
    
    print()
    print("=" * 60)
    print("✅ BUILD SUCCESSFUL!")
    print("=" * 60)
    print()
    print(f"📦 Executable location: {exe_file}")
    print(f"📊 File size: {exe_file.stat().st_size / 1024 / 1024:.1f} MB")
    print()
    print("To run:")
    print(f"   {exe_file}")
    print()

if __name__ == "__main__":
    main()
