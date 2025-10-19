<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { AlertItem } from '$lib/types';
	import { parseBraille } from '$lib/braille-parser'; // 👈 만들어 두었던 점자 해석기를 가져옵니다.

	let alerts: AlertItem[] = [];
	let connState: '연결 중...' | '연결됨' | '연결 끊김' = '연결 중...';
	let ws: WebSocket;

	// 페이지가 로드될 때 웹소켓에 연결합니다.
	onMount(() => {
		// SvelteKit 서버의 웹소켓 주소로 연결
		const wsUrl = `ws://localhost:3000`;
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			connState = '연결됨';
		};

		// 서버로부터 메시지를 받으면 alerts 배열 맨 앞에 추가합니다.
		ws.onmessage = (event) => {
			const newAlert: AlertItem = JSON.parse(event.data);
			alerts = [newAlert, ...alerts];
		};

		ws.onclose = () => {
			connState = '연결 끊김';
		};
	});

	// 페이지를 벗어날 때 연결을 깔끔하게 종료합니다.
	onDestroy(() => {
		if (ws) {
			ws.close();
		}
	});

	function formatTime(isoString: string) {
		return new Date(isoString).toLocaleTimeString('ko-KR');
	}

	const stateColors = {
		'연결 중...': 'text-yellow-400',
		'연결됨': 'text-green-400',
		'연결 끊김': 'text-red-400'
	};
</script>

<div class="bg-gray-900 text-white min-h-screen font-sans">
	<header class="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-gray-700">
		<div class="container mx-auto flex justify-between items-center">
			<h1 class="text-2xl font-bold">📈 실시간 트레이딩 알림</h1>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 rounded-full animate-pulse {connState === '연결됨' ? 'bg-green-500' : connState === '연결 중...' ? 'bg-yellow-500' : 'bg-red-500'}"></div>
				<span class="font-medium {stateColors[connState]}">{connState}</span>
			</div>
		</div>
	</header>

	<main class="container mx-auto p-4 md:p-6">
		{#if alerts.length === 0}
			<div class="text-center py-20">
				<p class="text-gray-400 text-lg">TradingView에서 신호를 기다립니다...</p>
			</div>
		{/if}

		<div class="grid gap-4">
			{#each alerts as alert (alert.receivedAt)}
				{@const signals = parseBraille(alert.message)}
				{@const isSupport = alert.type === 'support'}
				<div class="rounded-lg p-5 border {isSupport ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}">
					<div class="flex flex-wrap justify-between items-start gap-2 mb-4">
						<div class="flex items-center gap-4">
							<span class="font-bold text-2xl {isSupport ? 'text-green-400' : 'text-red-400'}">{alert.symbol}</span>
							<div class="flex gap-2 text-sm">
								<span class="bg-gray-700 px-2 py-1 rounded-md">{alert.exchange}</span>
								<span class="bg-gray-700 px-2 py-1 rounded-md">{alert.timeframe}</span>
							</div>
						</div>
						<div class="text-right">
							<span class="text-gray-400 font-mono text-sm">{formatTime(alert.receivedAt)}</span>
							<p class="font-bold text-lg {isSupport ? 'text-green-400' : 'text-red-400'}">
								{isSupport ? '지지(Support)' : '저항(Resistance)'}
							</p>
						</div>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-gray-300 mr-2">활성 신호:</span>
						{#if signals.length > 0}
							{#each signals as signal}
								<span class="font-mono px-2.5 py-1 text-sm rounded-full {isSupport ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">
									{signal}
								</span>
							{/each}
						{:else}
							<span class="text-gray-500">없음</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</main>
</div>