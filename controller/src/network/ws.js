let ws = null;

export function connectWS(url) {
  if (ws && ws.readyState <= WebSocket.OPEN) {
    return ws;
  }

  ws = new WebSocket(url);
  return ws;
}

export function disconnectWS() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function getWS() {
  return ws;
}
