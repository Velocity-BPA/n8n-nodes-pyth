/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Streaming Client
 * Client for subscribing to real-time Pyth price updates via SSE and WebSocket
 */

import EventSource from 'eventsource';
import WebSocket from 'ws';
import { DEFAULT_HERMES_ENDPOINT, HERMES_API_PATHS } from '../constants/endpoints';
import { normalizeFeedId } from '../utils/feedIdUtils';

export interface StreamingClientConfig {
	endpoint?: string;
	apiKey?: string;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
}

export interface StreamingPriceUpdate {
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
}

export type PriceUpdateCallback = (update: StreamingPriceUpdate) => void;
export type ErrorCallback = (error: Error) => void;
export type ConnectCallback = () => void;
export type DisconnectCallback = () => void;

/**
 * SSE (Server-Sent Events) Streaming Client
 */
export class SseStreamingClient {
	private eventSource: EventSource | null = null;
	private endpoint: string;
	private apiKey?: string;
	private feedIds: string[] = [];
	private reconnectInterval: number;
	private maxReconnectAttempts: number;
	private reconnectAttempts = 0;
	private isConnected = false;
	
	private onPriceUpdate?: PriceUpdateCallback;
	private onError?: ErrorCallback;
	private onConnect?: ConnectCallback;
	private onDisconnect?: DisconnectCallback;

	constructor(config: StreamingClientConfig = {}) {
		this.endpoint = config.endpoint || DEFAULT_HERMES_ENDPOINT;
		this.apiKey = config.apiKey;
		this.reconnectInterval = config.reconnectInterval || 5000;
		this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
	}

	/**
	 * Subscribe to price feeds
	 */
	subscribe(
		feedIds: string[],
		callbacks: {
			onPriceUpdate?: PriceUpdateCallback;
			onError?: ErrorCallback;
			onConnect?: ConnectCallback;
			onDisconnect?: DisconnectCallback;
		},
	): void {
		this.feedIds = feedIds.map((id) => normalizeFeedId(id));
		this.onPriceUpdate = callbacks.onPriceUpdate;
		this.onError = callbacks.onError;
		this.onConnect = callbacks.onConnect;
		this.onDisconnect = callbacks.onDisconnect;
		
		this.connect();
	}

	/**
	 * Connect to SSE stream
	 */
	private connect(): void {
		if (this.eventSource) {
			this.eventSource.close();
		}
		
		const params = new URLSearchParams();
		this.feedIds.forEach((id) => params.append('ids[]', id));
		params.append('parsed', 'true');
		
		const url = `${this.endpoint}${HERMES_API_PATHS.v2StreamingPriceUpdates}?${params.toString()}`;
		
		const eventSourceInit: EventSource.EventSourceInitDict = {};
		if (this.apiKey) {
			eventSourceInit.headers = {
				'X-API-Key': this.apiKey,
			};
		}
		
		this.eventSource = new EventSource(url, eventSourceInit);
		
		this.eventSource.onopen = () => {
			this.isConnected = true;
			this.reconnectAttempts = 0;
			this.onConnect?.();
		};
		
		this.eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.parsed && Array.isArray(data.parsed)) {
					data.parsed.forEach((update: StreamingPriceUpdate) => {
						this.onPriceUpdate?.(update);
					});
				}
			} catch (error) {
				this.onError?.(error as Error);
			}
		};
		
		this.eventSource.onerror = (error) => {
			this.isConnected = false;
			this.onError?.(new Error('SSE connection error'));
			this.onDisconnect?.();
			
			// Attempt reconnection
			if (this.reconnectAttempts < this.maxReconnectAttempts) {
				this.reconnectAttempts++;
				setTimeout(() => this.connect(), this.reconnectInterval);
			}
		};
	}

	/**
	 * Unsubscribe and close connection
	 */
	unsubscribe(): void {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}
		this.isConnected = false;
		this.feedIds = [];
	}

	/**
	 * Check if connected
	 */
	getIsConnected(): boolean {
		return this.isConnected;
	}

	/**
	 * Get subscribed feed IDs
	 */
	getSubscribedFeeds(): string[] {
		return [...this.feedIds];
	}
}

/**
 * WebSocket Streaming Client
 */
export class WebSocketStreamingClient {
	private ws: WebSocket | null = null;
	private endpoint: string;
	private apiKey?: string;
	private feedIds: string[] = [];
	private reconnectInterval: number;
	private maxReconnectAttempts: number;
	private reconnectAttempts = 0;
	private isConnected = false;
	private pingInterval: NodeJS.Timeout | null = null;
	
	private onPriceUpdate?: PriceUpdateCallback;
	private onError?: ErrorCallback;
	private onConnect?: ConnectCallback;
	private onDisconnect?: DisconnectCallback;

	constructor(config: StreamingClientConfig = {}) {
		this.endpoint = config.endpoint || DEFAULT_HERMES_ENDPOINT;
		this.apiKey = config.apiKey;
		this.reconnectInterval = config.reconnectInterval || 5000;
		this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
	}

	/**
	 * Subscribe to price feeds
	 */
	subscribe(
		feedIds: string[],
		callbacks: {
			onPriceUpdate?: PriceUpdateCallback;
			onError?: ErrorCallback;
			onConnect?: ConnectCallback;
			onDisconnect?: DisconnectCallback;
		},
	): void {
		this.feedIds = feedIds.map((id) => normalizeFeedId(id));
		this.onPriceUpdate = callbacks.onPriceUpdate;
		this.onError = callbacks.onError;
		this.onConnect = callbacks.onConnect;
		this.onDisconnect = callbacks.onDisconnect;
		
		this.connect();
	}

	/**
	 * Connect to WebSocket
	 */
	private connect(): void {
		if (this.ws) {
			this.ws.close();
		}
		
		const wsUrl = this.endpoint.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
		
		const headers: Record<string, string> = {};
		if (this.apiKey) {
			headers['X-API-Key'] = this.apiKey;
		}
		
		this.ws = new WebSocket(wsUrl, { headers });
		
		this.ws.on('open', () => {
			this.isConnected = true;
			this.reconnectAttempts = 0;
			
			// Subscribe to feeds
			const subscribeMessage = {
				type: 'subscribe',
				ids: this.feedIds,
			};
			this.ws?.send(JSON.stringify(subscribeMessage));
			
			// Start ping interval
			this.pingInterval = setInterval(() => {
				if (this.ws?.readyState === WebSocket.OPEN) {
					this.ws.ping();
				}
			}, 30000);
			
			this.onConnect?.();
		});
		
		this.ws.on('message', (data) => {
			try {
				const message = JSON.parse(data.toString());
				
				if (message.type === 'price_update' && message.price_feed) {
					this.onPriceUpdate?.(message.price_feed);
				}
			} catch (error) {
				this.onError?.(error as Error);
			}
		});
		
		this.ws.on('error', (error) => {
			this.onError?.(error);
		});
		
		this.ws.on('close', () => {
			this.isConnected = false;
			
			if (this.pingInterval) {
				clearInterval(this.pingInterval);
				this.pingInterval = null;
			}
			
			this.onDisconnect?.();
			
			// Attempt reconnection
			if (this.reconnectAttempts < this.maxReconnectAttempts) {
				this.reconnectAttempts++;
				setTimeout(() => this.connect(), this.reconnectInterval);
			}
		});
	}

	/**
	 * Unsubscribe and close connection
	 */
	unsubscribe(): void {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
		
		if (this.ws) {
			// Send unsubscribe message
			if (this.ws.readyState === WebSocket.OPEN) {
				const unsubscribeMessage = {
					type: 'unsubscribe',
					ids: this.feedIds,
				};
				this.ws.send(JSON.stringify(unsubscribeMessage));
			}
			
			this.ws.close();
			this.ws = null;
		}
		
		this.isConnected = false;
		this.feedIds = [];
	}

	/**
	 * Add feed to subscription
	 */
	addFeed(feedId: string): void {
		const normalized = normalizeFeedId(feedId);
		
		if (!this.feedIds.includes(normalized)) {
			this.feedIds.push(normalized);
			
			if (this.ws?.readyState === WebSocket.OPEN) {
				const subscribeMessage = {
					type: 'subscribe',
					ids: [normalized],
				};
				this.ws.send(JSON.stringify(subscribeMessage));
			}
		}
	}

	/**
	 * Remove feed from subscription
	 */
	removeFeed(feedId: string): void {
		const normalized = normalizeFeedId(feedId);
		const index = this.feedIds.indexOf(normalized);
		
		if (index !== -1) {
			this.feedIds.splice(index, 1);
			
			if (this.ws?.readyState === WebSocket.OPEN) {
				const unsubscribeMessage = {
					type: 'unsubscribe',
					ids: [normalized],
				};
				this.ws.send(JSON.stringify(unsubscribeMessage));
			}
		}
	}

	/**
	 * Check if connected
	 */
	getIsConnected(): boolean {
		return this.isConnected;
	}

	/**
	 * Get subscribed feed IDs
	 */
	getSubscribedFeeds(): string[] {
		return [...this.feedIds];
	}
}

/**
 * Create SSE streaming client
 */
export function createSseClient(config: StreamingClientConfig = {}): SseStreamingClient {
	return new SseStreamingClient(config);
}

/**
 * Create WebSocket streaming client
 */
export function createWebSocketClient(config: StreamingClientConfig = {}): WebSocketStreamingClient {
	return new WebSocketStreamingClient(config);
}
