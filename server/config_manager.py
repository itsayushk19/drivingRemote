"""
Configuration Manager

Handles loading, saving, and syncing of controller configurations
"""

import json
import os
from pathlib import Path

CONFIG_DIR = Path.home() / ".drivingRemote"
CONFIG_FILE = CONFIG_DIR / "config.json"
LAYOUTS_FILE = CONFIG_DIR / "layouts.json"


class ConfigManager:
    def __init__(self):
        self.config = {}
        self.layouts = {}
        self.ensure_config_dir()
        self.load()

    def ensure_config_dir(self):
        """Create config directory if it doesn't exist"""
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    def load(self):
        """Load configuration from disk"""
        try:
            if CONFIG_FILE.exists():
                with open(CONFIG_FILE, 'r') as f:
                    self.config = json.load(f)
            else:
                self.config = self.get_default_config()
                self.save_config()
        except Exception as e:
            print(f"Failed to load config: {e}")
            self.config = self.get_default_config()

        try:
            if LAYOUTS_FILE.exists():
                with open(LAYOUTS_FILE, 'r') as f:
                    self.layouts = json.load(f)
        except Exception as e:
            print(f"Failed to load layouts: {e}")
            self.layouts = {}

    def save_config(self):
        """Save configuration to disk"""
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.config, f, indent=2)
            return True
        except Exception as e:
            print(f"Failed to save config: {e}")
            return False

    def save_layouts(self):
        """Save layouts to disk"""
        try:
            with open(LAYOUTS_FILE, 'w') as f:
                json.dump(self.layouts, f, indent=2)
            return True
        except Exception as e:
            print(f"Failed to save layouts: {e}")
            return False

    def get_default_config(self):
        """Get default configuration"""
        return {
            "server": {
                "host": "0.0.0.0",
                "port": 8000,
                "update_rate": 120
            },
            "vjoy": {
                "device_id": 1,
                "enabled": True
            },
            "network": {
                "binary_protocol": False,
                "throttle_ms": 16
            }
        }

    def get_config(self, key=None):
        """Get configuration value"""
        if key is None:
            return self.config
        
        keys = key.split('.')
        value = self.config
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return None
        return value

    def set_config(self, key, value):
        """Set configuration value"""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
        self.save_config()

    def update_layout(self, layout_id, layout_data):
        """Update or add a layout"""
        self.layouts[layout_id] = layout_data
        self.save_layouts()

    def delete_layout(self, layout_id):
        """Delete a layout"""
        if layout_id in self.layouts:
            del self.layouts[layout_id]
            self.save_layouts()
            return True
        return False

    def get_layout(self, layout_id):
        """Get a specific layout"""
        return self.layouts.get(layout_id)

    def get_all_layouts(self):
        """Get all layouts"""
        return self.layouts

    def sync_from_client(self, client_layouts):
        """Sync layouts from client (merge strategy)"""
        # Simple merge: client layouts overwrite server layouts
        updated = False
        for layout_id, layout_data in client_layouts.items():
            if layout_id not in self.layouts or self.layouts[layout_id] != layout_data:
                self.layouts[layout_id] = layout_data
                updated = True
        
        if updated:
            self.save_layouts()
        
        return self.layouts

    def get_config_path(self):
        """Get config directory path"""
        return str(CONFIG_DIR)
