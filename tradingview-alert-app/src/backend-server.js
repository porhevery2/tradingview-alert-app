// src/backend-server.js
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const PORT = 3000;

// 1. HTTP 서버 생성
const server = createServer((req, res) => {
	// 웹훅 요청(POST /api/webhook)을 처리합니다.
	if (req.method === 'POST' && req.url === '/api/webhook') {
		let body = '';
		req.on('data', (chunk) => {
			body += chunk.toString();
		});
		req.on('end', () => {
			try {
				const alertData = JSON.parse(body);
				alertData.receivedAt = new Date().toISOString();
				console.log('🔔 [Webhook] 알림 수신:', alertData.symbol);
				
				// 모든 웹소켓 클라이언트에게 데이터를 전송합니다.
				broadcast(JSON.stringify(alertData));
				
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ status: 'ok' }));
			} catch (e) {
				res.writeHead(400, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
			}
		});
	} else {
		res.writeHead(404);
		res.end();
	}
});

// 2. 웹소켓 서버를 HTTP 서버에 연결
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
	console.log('🔌 [WSS] 클라이언트 연결');
	ws.on('close', () => {
		console.log('🔌 [WSS] 클라이언트 연결 해제');
	});
});

// 3. 브로드캐스트 함수
/** @param {any} data */
function broadcast(data) {
	wss.clients.forEach((client) => {
		if (client.readyState === 1) { // WebSocket.OPEN === 1
			client.send(data);
		}
	});
}

// 4. 서버 실행
server.listen(PORT, () => {
	console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});