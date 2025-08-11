// PeerManager.ts
// Handles PeerJS setup and code sync
import Peer, { DataConnection } from 'peerjs';

export class PeerManager {
  peer: Peer;
  connections: DataConnection[] = [];
  sessionId: string;
  onCodeReceived: (code: string) => void;

  constructor(sessionId: string, onCodeReceived: (code: string) => void) {
    this.sessionId = sessionId;
    this.onCodeReceived = onCodeReceived;
    this.peer = new Peer(sessionId, {
      host: 'localhost',
      port: 9000,
      path: '/myapp',
      debug: 2
    });
    this.peer.on('connection', (conn: DataConnection) => {
      this.setupConnection(conn);
      this.connections.push(conn);
    });
  }

  connectToHost(hostId: string) {
    const conn = this.peer.connect(hostId);
    this.setupConnection(conn);
    this.connections.push(conn);
  }

  setupConnection(conn: DataConnection) {
    conn.on('data', (data: any) => {
      if (typeof data === 'string') {
        this.onCodeReceived(data);
      }
    });
  }

  broadcastCode(code: string) {
    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(code);
      }
    });
  }
}
