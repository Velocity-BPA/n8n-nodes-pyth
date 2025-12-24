/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Network API Endpoints
 * Configuration for Hermes, Benchmarks, and other services
 */

export interface HermesEndpoint {
	url: string;
	name: string;
	network: 'mainnet' | 'testnet';
	wsUrl?: string;
}

/**
 * Hermes Price Service Endpoints
 */
export const HERMES_ENDPOINTS: Record<string, HermesEndpoint> = {
	mainnet: {
		url: 'https://hermes.pyth.network',
		name: 'Hermes Mainnet',
		network: 'mainnet',
		wsUrl: 'wss://hermes.pyth.network/ws',
	},
	testnet: {
		url: 'https://hermes-beta.pyth.network',
		name: 'Hermes Testnet (Beta)',
		network: 'testnet',
		wsUrl: 'wss://hermes-beta.pyth.network/ws',
	},
};

/**
 * Benchmarks API Endpoints (Historical Data)
 */
export const BENCHMARKS_ENDPOINTS: Record<string, string> = {
	mainnet: 'https://benchmarks.pyth.network',
	testnet: 'https://benchmarks-beta.pyth.network',
};

/**
 * Pyth Explorer Endpoints
 */
export const EXPLORER_ENDPOINTS: Record<string, string> = {
	mainnet: 'https://pyth.network/price-feeds',
	testnet: 'https://pyth.network/price-feeds?cluster=testnet',
};

/**
 * Pythnet RPC Endpoints
 */
export const PYTHNET_RPC_ENDPOINTS: string[] = [
	'https://pythnet.rpcpool.com',
	'https://pythnet.blockrazor.xyz',
];

/**
 * Hermes API Paths
 */
export const HERMES_API_PATHS = {
	// Price endpoints
	latestPriceUpdates: '/api/latest_price_feeds',
	priceUpdates: '/api/get_price_feed',
	latestVaas: '/api/latest_vaas',
	getVaa: '/api/get_vaa',
	
	// Streaming endpoints
	streamPriceUpdates: '/v2/updates/price/stream',
	
	// Info endpoints
	priceFeedIds: '/api/price_feed_ids',
	
	// V2 API
	v2LatestPriceUpdates: '/v2/updates/price/latest',
	v2StreamingPriceUpdates: '/v2/updates/price/stream',
} as const;

/**
 * Benchmarks API Paths
 */
export const BENCHMARKS_API_PATHS = {
	// Historical price endpoints
	historicalPrice: '/v1/shims/tradingview/history',
	priceAtTime: '/v1/shims/tradingview/history',
	ohlc: '/v1/shims/tradingview/history',
	
	// Query endpoints
	search: '/v1/shims/tradingview/search',
	symbols: '/v1/shims/tradingview/symbols',
	
	// Time endpoints
	serverTime: '/v1/shims/tradingview/time',
} as const;

/**
 * Default Request Timeouts (ms)
 */
export const REQUEST_TIMEOUTS = {
	default: 30000,
	streaming: 60000,
	onChain: 120000,
} as const;

/**
 * Rate Limits by Tier
 */
export const RATE_LIMITS = {
	free: {
		requestsPerMinute: 30,
		requestsPerDay: 10000,
	},
	basic: {
		requestsPerMinute: 100,
		requestsPerDay: 50000,
	},
	professional: {
		requestsPerMinute: 500,
		requestsPerDay: 250000,
	},
	enterprise: {
		requestsPerMinute: 2000,
		requestsPerDay: 1000000,
	},
} as const;

/**
 * Default Hermes Endpoint (Mainnet)
 */
export const DEFAULT_HERMES_ENDPOINT = HERMES_ENDPOINTS.mainnet.url;

/**
 * Default Benchmarks Endpoint
 */
export const DEFAULT_BENCHMARKS_ENDPOINT = BENCHMARKS_ENDPOINTS.mainnet;

/**
 * Get Hermes endpoint URL
 */
export function getHermesEndpoint(network: 'mainnet' | 'testnet' = 'mainnet'): string {
	return HERMES_ENDPOINTS[network]?.url || DEFAULT_HERMES_ENDPOINT;
}

/**
 * Get Hermes WebSocket URL
 */
export function getHermesWsEndpoint(network: 'mainnet' | 'testnet' = 'mainnet'): string {
	return HERMES_ENDPOINTS[network]?.wsUrl || 'wss://hermes.pyth.network/ws';
}

/**
 * Get Benchmarks endpoint URL
 */
export function getBenchmarksEndpoint(network: 'mainnet' | 'testnet' = 'mainnet'): string {
	return BENCHMARKS_ENDPOINTS[network] || DEFAULT_BENCHMARKS_ENDPOINT;
}
