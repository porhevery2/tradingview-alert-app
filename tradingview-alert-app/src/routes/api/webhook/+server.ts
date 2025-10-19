// src/hooks.server.ts

import { json, type Handle } from '@sveltejs/kit';
import { WebSocketServer, WebSocket } from 'ws';
import type { AlertItem } from '$lib/types'; // 👈 이 오류는 아래 2단계에서 해결됩니다.
import { parse } from 'url';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';

// --- WebSocket 서버 설정 ---
const wss = new WebSocketServer({ noServer: true });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
	console.log('🔌 [WSS] 클라이언트 연결');
	clients.add(ws);
	ws.on('close', () => {
		console.log('🔌 [WSS] 클라이언트 연결 해제');
		clients.delete(ws);
	});
});

console.log('🚀 [WSS] 웹소켓 서버 로직이 준비되었습니다.');

function broadcast(data: AlertItem) {
	const payload = JSON.stringify(data);
	for (const client of clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(payload);
		}
	}
}

// --- SvelteKit 서버 핸들러 ---
export const handle: Handle = async ({ event, resolve }) => {
	// ⚠️ FIX: event.platform이 없는 환경(e.g. 프로덕션 빌드)을 고려하여 안전하게 서버 인스턴스를 가져옵니다.
	// @ts-ignore - 개발 서버에서만 존재하는 속성이므로 타입 에러를 무시합니다.
    const server = event.platform?.viteDevServer?.httpServer;
	if (!server) {
		return resolve(event); // 서버가 없으면 일반 요청으로 처리
	}
	
	server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
		const { pathname } = parse(req.url || '');
		if (pathname === '/websocket') {
			wss.handleUpgrade(req, socket, head, (ws) => {
				wss.emit('connection', ws, req);
			});
		}
	});

	if (event.url.pathname === '/api/webhook' && event.request.method === 'POST') {
		try {
			const body = await event.request.json();
			const alertData: AlertItem = {
				exchange: body.exchange,
				symbol: body.symbol,
				timeframe: body.timeframe,
				type: body.type,
				message: body.message,
				receivedAt: new Date().toISOString()
			};
			console.log('🔔 [Webhook] 알림 수신:', alertData.symbol);
			broadcast(alertData);
			return json({ status: 'ok' });
		} catch (err) {
			// ... (이하 생략)
		}
	}

	return resolve(event);
};