// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

// 모든 요청을 기본 SvelteKit이 처리하도록 둡니다.
export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};