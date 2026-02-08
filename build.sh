#!/bin/bash
# Build script for DrivingRemote on Linux/Mac

set -e

echo "========================================"
echo "Building DrivingRemote Executable"
echo "========================================"
echo

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found. Please install Python 3.8+ first."
    exit 1
fi

# Run the build script
python3 build_exe.py

echo
echo "Build completed successfully!"
echo
