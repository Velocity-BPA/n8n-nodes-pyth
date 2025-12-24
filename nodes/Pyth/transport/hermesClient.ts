/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Hermes Client
 * Client for interacting with Pyth's Hermes price service
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DEFAULT_HERMES_ENDPOINT, HERMES_API_PATHS, REQUEST_TIMEOUTS } from '../constants/endpoints';
import { normalizeFeedId } from '../utils/feedIdUtils';

export interface HermesClientConfig {
	endpoint?: string;
	apiKey?: string;
	timeout?: number;
}

export interface PriceUpdate {
	id: string;
	price: {
		price: string;
		conf: string;
		expo: number;
		publish_time: number;
	};
	ema_price: {
		price: string;
		conf: string;
		expo: number;
		publish_time: number;
	};
	metadata?: {
		slot: number;
		proof_available_time: number;
		prev_publish_time: number;
	};
}

export interface LatestPriceResponse {
	binary: {
		encoding: string;
		data: string[];
	};
	parsed: PriceUpdate[];
}

export interface VaaResponse {
	binary: {
		encoding: string;
		data: string[];
	};
	publishTime: number;
}

/**
 * Hermes Price Service Client
 */
export class HermesClient {
	private client: AxiosInstance;
	private endpoint: string;

	constructor(config: HermesClientConfig = {}) {
		this.endpoint = config.endpoint || DEFAULT_HERMES_ENDPOINT;
		
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
	 * Get latest price updates for given feed IDs
	 */
	async getLatestPriceUpdates(
		feedIds: string[],
		options: {
			encoding?: 'base64' | 'hex';
			parsed?: boolean;
		} = {},
	): Promise<LatestPriceResponse> {
		const normalizedIds = feedIds.map((id) => normalizeFeedId(id));
		
		const params = new URLSearchParams();
		normalizedIds.forEach((id) => params.append('ids[]', id));
		
		if (options.encoding) {
			params.append('encoding', options.encoding);
		}
		if (options.parsed !== undefined) {
			params.append('parsed', String(options.parsed));
		}
		
		const response = await this.client.get<LatestPriceResponse>(
			`${HERMES_API_PATHS.v2LatestPriceUpdates}?${params.toString()}`,
		);
		
		return response.data;
	}

	/**
	 * Get price feed by ID
	 */
	async getPriceFeed(feedId: string): Promise<PriceUpdate | null> {
		const response = await this.getLatestPriceUpdates([feedId], { parsed: true });
		return response.parsed?.[0] || null;
	}

	/**
	 * Get all available price feed IDs
	 */
	async getPriceFeedIds(): Promise<string[]> {
		const response = await this.client.get<string[]>(HERMES_API_PATHS.priceFeedIds);
		return response.data;
	}

	/**
	 * Get latest VAA (Verified Action Approval) for feed IDs
	 */
	async getLatestVaas(feedIds: string[]): Promise<string[]> {
		const normalizedIds = feedIds.map((id) => normalizeFeedId(id));
		
		const params = new URLSearchParams();
		normalizedIds.forEach((id) => params.append('ids[]', id));
		
		const response = await this.client.get<VaaResponse>(
			`${HERMES_API_PATHS.latestVaas}?${params.toString()}`,
		);
		
		return response.data.binary.data;
	}

	/**
	 * Get VAA for price update at specific timestamp
	 */
	async getVaa(
		feedId: string,
		publishTime: number,
	): Promise<{ vaa: string; publishTime: number }> {
		const normalizedId = normalizeFeedId(feedId);
		
		const params = new URLSearchParams();
		params.append('id', normalizedId);
		params.append('publish_time', String(publishTime));
		
		const response = await this.client.get<VaaResponse>(
			`${HERMES_API_PATHS.getVaa}?${params.toString()}`,
		);
		
		return {
			vaa: response.data.binary.data[0],
			publishTime: response.data.publishTime,
		};
	}

	/**
	 * Get price update data formatted for on-chain submission
	 */
	async getUpdateData(feedIds: string[]): Promise<string[]> {
		const response = await this.getLatestPriceUpdates(feedIds, {
			encoding: 'hex',
			parsed: false,
		});
		
		return response.binary.data.map((d) => (d.startsWith('0x') ? d : `0x${d}`));
	}

	/**
	 * Get streaming URL for price updates
	 */
	getStreamingUrl(feedIds: string[]): string {
		const normalizedIds = feedIds.map((id) => normalizeFeedId(id));
		const params = new URLSearchParams();
		normalizedIds.forEach((id) => params.append('ids[]', id));
		
		return `${this.endpoint}${HERMES_API_PATHS.v2StreamingPriceUpdates}?${params.toString()}`;
	}

	/**
	 * Get WebSocket URL for streaming
	 */
	getWebSocketUrl(): string {
		return this.endpoint.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
	}

	/**
	 * Health check
	 */
	async healthCheck(): Promise<boolean> {
		try {
			await this.getPriceFeedIds();
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
 * Create Hermes client from n8n credentials
 */
export function createHermesClient(credentials: {
	hermesEndpoint?: string;
	hermesEndpointCustom?: string;
	hermesApiEndpoint?: string;
	apiKey?: string;
}): HermesClient {
	const endpoint =
		credentials.hermesEndpoint ||
		credentials.hermesEndpointCustom ||
		credentials.hermesApiEndpoint ||
		DEFAULT_HERMES_ENDPOINT;
	
	return new HermesClient({
		endpoint,
		apiKey: credentials.apiKey,
	});
}
