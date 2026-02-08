"""
Telemetry Module

Tracks and displays real-time telemetry data
"""

import time
from collections import deque


class TelemetryTracker:
    def __init__(self, window_size=30):
        self.window_size = window_size
        self.reset()

    def reset(self):
        """Reset all telemetry data"""
        self.packets_received = 0
        self.packets_per_second = 0
        self.last_packet_time = None
        self.latency_history = deque(maxlen=self.window_size)
        self.cadence_history = deque(maxlen=self.window_size)
        self.last_pps_update = time.time()
        self.packet_counter = 0
        self.start_time = time.time()
        self.control_values = {}
        self.button_states = {}

    def record_packet(self):
        """Record a packet received"""
        now = time.time()
        
        # Update cadence (time between packets)
        if self.last_packet_time is not None:
            cadence_ms = (now - self.last_packet_time) * 1000
            self.cadence_history.append(cadence_ms)
        
        self.last_packet_time = now
        self.packets_received += 1
        self.packet_counter += 1

        # Update packets per second
        if now - self.last_pps_update >= 1.0:
            self.packets_per_second = self.packet_counter
            self.packet_counter = 0
            self.last_pps_update = now

    def record_latency(self, latency_ms):
        """Record a latency measurement"""
        self.latency_history.append(latency_ms)

    def update_control_value(self, axis, value, mode='centered'):
        """Update a control value"""
        self.control_values[axis] = {
            'value': value,
            'mode': mode,
            'updated_at': time.time()
        }

    def update_button_state(self, button, state):
        """Update a button state"""
        self.button_states[button] = {
            'state': state,
            'updated_at': time.time()
        }

    def get_stats(self):
        """Get current statistics"""
        avg_latency = sum(self.latency_history) / len(self.latency_history) if self.latency_history else 0
        avg_cadence = sum(self.cadence_history) / len(self.cadence_history) if self.cadence_history else 0
        uptime = time.time() - self.start_time

        return {
            'packets_received': self.packets_received,
            'packets_per_second': self.packets_per_second,
            'avg_latency_ms': avg_latency,
            'avg_cadence_ms': avg_cadence,
            'uptime_seconds': uptime,
            'control_values': self.control_values.copy(),
            'button_states': self.button_states.copy()
        }

    def get_uptime_string(self):
        """Get formatted uptime string"""
        uptime = time.time() - self.start_time
        hours = int(uptime // 3600)
        minutes = int((uptime % 3600) // 60)
        seconds = int(uptime % 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
