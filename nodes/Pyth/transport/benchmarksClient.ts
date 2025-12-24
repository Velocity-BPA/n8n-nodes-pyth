/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Benchmarks Client
 * Client for interacting with Pyth's Benchmarks API for historical price data
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DEFAULT_BENCHMARKS_ENDPOINT, BENCHMARKS_API_PATHS, REQUEST_TIMEOUTS } from '../constants/endpoints';

export interface BenchmarksClientConfig {
	endpoint?: string;
	apiKey?: string;
	timeout?: number;
}

export interface HistoricalBar {
	t: number; // timestamp
	o: number; // open
	h: number; // high
	l: number; // low
	c: number; // close
	v?: number; // volume (if available)
}

export interface HistoricalDataResponse {
	s: 'ok' | 'error' | 'no_data';
	t: number[]; // timestamps
	o: number[]; // opens
	h: number[]; // highs
	l: number[]; // lows
	c: number[]; // closes
	v?: number[]; // volumes
	nextTime?: number;
	errmsg?: string;
}

export interface SymbolInfo {
	symbol: string;
	description: string;
	exchange: string;
	type: string;
	ticker: string;
	pricescale: number;
	minmov: number;
	session: string;
	timezone: string;
	has_intraday: boolean;
	has_daily: boolean;
	has_weekly_and_monthly: boolean;
	supported_resolutions: string[];
}

export interface SearchResult {
	symbol: string;
	full_name: string;
	description: string;
	exchange: string;
	ticker: string;
	type: string;
}

/**
 * Benchmarks API Client for Historical Data
 */
export class BenchmarksClient {
	private client: AxiosInstance;
	private endpoint: string;

	constructor(config: BenchmarksClientConfig = {}) {
		this.endpoint = config.endpoint || DEFAULT_BENCHMARKS_ENDPOINT;
		
		const axiosConfig: AxiosRequestConfig = {
			baseURL: this.endpoint,
			timeout: config.timeout || REQUEST_TIMEOUTS.default,
			headers: {
				'Content-Type': 'application/json',
			},
		};
		
		if (config.apiKey) {
			axiosConfig.headers = {
				...axiosConfig.headers,
				'X-API-Key': config.apiKey,
			};
		}
		
		this.client = axios.create(axiosConfig);
	}

	/**
	 * Get historical OHLC data
	 */
	async getHistory(
		symbol: string,
		from: number,
		to: number,
		resolution: string = '1D',
	): Promise<HistoricalBar[]> {
		const params = new URLSearchParams({
			symbol,
			from: String(from),
			to: String(to),
			resolution,
		});
		
		const response = await this.client.get<HistoricalDataResponse>(
			`${BENCHMARKS_API_PATHS.historicalPrice}?${params.toString()}`,
		);
		
		if (response.data.s !== 'ok') {
			if (response.data.s === 'no_data') {
				return [];
			}
			throw new Error(response.data.errmsg || 'Failed to fetch historical data');
		}
		
		const bars: HistoricalBar[] = [];
		for (let i = 0; i < response.data.t.length; i++) {
			bars.push({
				t: response.data.t[i],
				o: response.data.o[i],
				h: response.data.h[i],
				l: response.data.l[i],
				c: response.data.c[i],
				v: response.data.v?.[i],
			});
		}
		
		return bars;
	}

	/**
	 * Get price at specific timestamp
	 */
	async getPriceAtTime(symbol: string, timestamp: number): Promise<HistoricalBar | null> {
		const from = timestamp - 3600; // 1 hour before
		const to = timestamp + 3600; // 1 hour after
		
		const bars = await this.getHistory(symbol, from, to, '1');
		
		if (bars.length === 0) return null;
		
		// Find the bar closest to the requested timestamp
		let closest = bars[0];
		let minDiff = Math.abs(bars[0].t - timestamp);
		
		for (const bar of bars) {
			const diff = Math.abs(bar.t - timestamp);
			if (diff < minDiff) {
				minDiff = diff;
				closest = bar;
			}
		}
		
		return closest;
	}

	/**
	 * Get TWAP (Time-Weighted Average Price)
	 */
	async getTwap(
		symbol: string,
		from: number,
		to: number,
		resolution: string = '1',
	): Promise<number> {
		const bars = await this.getHistory(symbol, from, to, resolution);
		
		if (bars.length === 0) {
			throw new Error('No data available for TWAP calculation');
		}
		
		// Calculate time-weighted average using typical price (H+L+C)/3
		let totalWeightedPrice = 0;
		let totalWeight = 0;
		
		for (let i = 0; i < bars.length; i++) {
			const typicalPrice = (bars[i].h + bars[i].l + bars[i].c) / 3;
			const weight = i < bars.length - 1 ? bars[i + 1].t - bars[i].t : 1;
			
			totalWeightedPrice += typicalPrice * weight;
			totalWeight += weight;
		}
		
		return totalWeight > 0 ? totalWeightedPrice / totalWeight : 0;
	}

	/**
	 * Search for symbols
	 */
	async searchSymbols(query: string, limit = 30): Promise<SearchResult[]> {
		const params = new URLSearchParams({
			query,
			limit: String(limit),
		});
		
		const response = await this.client.get<SearchResult[]>(
			`${BENCHMARKS_API_PATHS.search}?${params.toString()}`,
		);
		
		return response.data;
	}

	/**
	 * Get symbol info
	 */
	async getSymbolInfo(symbol: string): Promise<SymbolInfo> {
		const params = new URLSearchParams({ symbol });
		
		const response = await this.client.get<SymbolInfo>(
			`${BENCHMARKS_API_PATHS.symbols}?${params.toString()}`,
		);
		
		return response.data;
	}

	/**
	 * Get server time
	 */
	async getServerTime(): Promise<number> {
		const response = await this.client.get<number>(BENCHMARKS_API_PATHS.serverTime);
		return response.data;
	}

	/**
	 * Get first available timestamp for a symbol
	 */
	async getFirstAvailableTime(symbol: string): Promise<number | null> {
		try {
			// Try to get data from a very early timestamp
			const from = 0;
			const to = Math.floor(Date.now() / 1000);
			
			const bars = await this.getHistory(symbol, from, to, '1D');
			
			if (bars.length > 0) {
				return bars[0].t;
			}
			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Get last available timestamp for a symbol
	 */
	async getLastAvailableTime(symbol: string): Promise<number | null> {
		try {
			const now = Math.floor(Date.now() / 1000);
			const from = now - 86400 * 30; // Last 30 days
			
			const bars = await this.getHistory(symbol, from, now, '1D');
			
			if (bars.length > 0) {
				return bars[bars.length - 1].t;
			}
			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Health check
	 */
	async healthCheck(): Promise<boolean> {
		try {
			await this.getServerTime();
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get endpoint URL
	 */
	getEndpoint(): string {
		return this.endpoint;
	}
}

/**
 * Create Benchmarks client from n8n credentials
 */
export function createBenchmarksClient(credentials: {
	benchmarksEndpoint?: string;
	benchmarksApiEndpoint?: string;
	apiKey?: string;
}): BenchmarksClient {
	const endpoint =
		credentials.benchmarksEndpoint ||
		credentials.benchmarksApiEndpoint ||
		DEFAULT_BENCHMARKS_ENDPOINT;
	
	return new BenchmarksClient({
		endpoint,
		apiKey: credentials.apiKey,
	});
}
