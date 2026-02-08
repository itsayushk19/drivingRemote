/**
 * WebSocket Service
 * 
 * Optimized WebSocket client for low-latency control communication
 */

let ws = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let messageQueue = [];
let connected = false;

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const MESSAGE_THROTTLE_MS = 16; // ~60Hz
const MAX_QUEUE_SIZE = 100;

let lastSendTime = 0;
let throttleTimer = null;
let pendingMessage = null;

/**
 * Connect to WebSocket server
 */
export function connect(url, callbacks = {}) {
  disconnect();

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      connected = true;
      reconnectAttempts = 0;
      console.log('✅ WebSocket connected');
      
      // Send queued messages
      flushMessageQueue();
      
      if (callbacks.onOpen) callbacks.onOpen();
    };

    ws.onclose = (event) => {
      connected = false;
      console.log('❌ WebSocket disconnected', event.code, event.reason);
      
      if (callbacks.onClose) callbacks.onClose(event);
      
      // Auto-reconnect
      if (!event.wasClean) {
        scheduleReconnect(url, callbacks);
      }
    };

    ws.onerror = (error) => {
      console.error('🔴 WebSocket error:', error);
      if (callbacks.onError) callbacks.onError(error);
    };

    ws.onmessage = (event) => {
      if (callbacks.onMessage) callbacks.onMessage(event);
    };

    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    scheduleReconnect(url, callbacks);
    return null;
  }
}

/**
 * Disconnect from WebSocket server
 */
export function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (throttleTimer) {
    clearTimeout(throttleTimer);
    throttleTimer = null;
  }

  if (ws) {
    connected = false;
    ws.close(1000, 'Client disconnecting');
    ws = null;
  }

  messageQueue = [];
  pendingMessage = null;
}

/**
 * Send a message (with throttling and queuing)
 */
export function send(message, options = {}) {
  const { priority = false, throttle = true } = options;

  // Convert to string if needed
  const data = typeof message === 'string' ? message : JSON.stringify(message);

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    // Queue message for sending when connected
    if (messageQueue.length < MAX_QUEUE_SIZE) {
      messageQueue.push({ data, priority });
    }
    return false;
  }

  if (priority || !throttle) {
    // Send immediately
    ws.send(data);
    lastSendTime = performance.now();
    return true;
  }

  // Throttle non-priority messages
  pendingMessage = data;

  if (!throttleTimer) {
    const now = performance.now();
    const elapsed = now - lastSendTime;
    const delay = Math.max(0, MESSAGE_THROTTLE_MS - elapsed);

    throttleTimer = setTimeout(() => {
      if (pendingMessage && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(pendingMessage);
        lastSendTime = performance.now();
        pendingMessage = null;
      }
      throttleTimer = null;
    }, delay);
  }

  return true;
}

/**
 * Send binary message (for low-latency control data)
 */
export function sendBinary(buffer) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return false;
  }

  ws.send(buffer);
  return true;
}

/**
 * Get WebSocket instance
 */
export function getWebSocket() {
  return ws;
}

/**
 * Check if connected
 */
export function isConnected() {
  return connected && ws && ws.readyState === WebSocket.OPEN;
}

/**
 * Get connection state
 */
export function getState() {
  if (!ws) return 'disconnected';
  
  switch (ws.readyState) {
    case WebSocket.CONNECTING:
      return 'connecting';
    case WebSocket.OPEN:
      return 'connected';
    case WebSocket.CLOSING:
      return 'closing';
    case WebSocket.CLOSED:
      return 'disconnected';
    default:
      return 'unknown';
  }
}

/**
 * Schedule reconnection with exponential backoff
 */
function scheduleReconnect(url, callbacks) {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('❌ Max reconnect attempts reached');
    if (callbacks.onMaxReconnectReached) {
      callbacks.onMaxReconnectReached();
    }
    return;
  }

  const delay = Math.min(
    BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
    MAX_RECONNECT_DELAY
  );

  reconnectAttempts++;
  console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

  reconnectTimer = setTimeout(() => {
    console.log('🔄 Attempting to reconnect...');
    connect(url, callbacks);
  }, delay);
}

/**
 * Flush queued messages
 */
function flushMessageQueue() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  // Send priority messages first
  const priorityMessages = messageQueue.filter(m => m.priority);
  const normalMessages = messageQueue.filter(m => !m.priority);

  [...priorityMessages, ...normalMessages].forEach(({ data }) => {
    ws.send(data);
  });

  messageQueue = [];
}

/**
 * Encode control data as binary message
 * Format: [type:1][controlId:2][value:4 (float32)]
 */
export function encodeControlBinary(controlId, value) {
  const buffer = new ArrayBuffer(7);
  const view = new DataView(buffer);
  
  view.setUint8(0, 1); // type: control update
  view.setUint16(1, controlId, true); // little-endian
  view.setFloat32(3, value, true);
  
  return buffer;
}

/**
 * Batch encode multiple controls
 * Format: [type:1][count:1][control1...][control2...]...
 */
export function encodeBatchControlBinary(controls) {
  const count = Math.min(controls.length, 255);
  const buffer = new ArrayBuffer(2 + count * 6);
  const view = new DataView(buffer);
  
  view.setUint8(0, 2); // type: batch control update
  view.setUint8(1, count);
  
  let offset = 2;
  for (let i = 0; i < count; i++) {
    const { controlId, value } = controls[i];
    view.setUint16(offset, controlId, true);
    view.setFloat32(offset + 2, value, true);
    offset += 6;
  }
  
  return buffer;
}

export default {
  connect,
  disconnect,
  send,
  sendBinary,
  getWebSocket,
  isConnected,
  getState,
  encodeControlBinary,
  encodeBatchControlBinary
};
