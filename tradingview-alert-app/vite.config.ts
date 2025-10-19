import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// 👇 이 부분을 추가해주세요.
	preview: {
		host: '0.0.0.0',
		port: 10000,
		// 👇 이 부분이 핵심입니다.
		allowedHosts: ['tradingview-frontend.onrender.com'] 
	}
});