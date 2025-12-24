/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { createHermesClient, SseStreamingClient } from './transport';
import { applyExpo, normalizeFeedId, feedIdToSymbol, symbolToFeedId } from './utils';

// Emit licensing notice once on module load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licenseNoticeEmitted = false;

function emitLicensingNotice(): void {
	if (!licenseNoticeEmitted) {
		console.warn(LICENSING_NOTICE);
		licenseNoticeEmitted = true;
	}
}

export class PythTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pyth Trigger',
		name: 'pythTrigger',
		icon: 'file:pyth.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger workflows on Pyth Network price events',
		defaults: {
			name: 'Pyth Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'pythApiCredentials',
				required: false,
			},
		],
		properties: [
			// Event Type
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Price Updated', value: 'priceUpdated', description: 'Trigger when price is updated' },
					{ name: 'Price Above Threshold', value: 'priceAbove', description: 'Trigger when price exceeds threshold' },
					{ name: 'Price Below Threshold', value: 'priceBelow', description: 'Trigger when price falls below threshold' },
					{ name: 'Price Change Percent', value: 'priceChangePercent', description: 'Trigger on percentage price change' },
					{ name: 'Confidence Changed', value: 'confidenceChanged', description: 'Trigger when confidence interval changes significantly' },
					{ name: 'Price Stale', value: 'priceStale', description: 'Trigger when price becomes stale' },
				],
				default: 'priceUpdated',
			},

			// Feed ID
			{
				displayName: 'Feed ID or Symbol',
				name: 'feedId',
				type: 'string',
				default: '',
				placeholder: 'ETH/USD or 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
				description: 'Price feed ID (32-byte hex) or trading symbol (e.g., BTC/USD)',
				required: true,
			},

			// Price Threshold (for above/below triggers)
			{
				displayName: 'Price Threshold',
				name: 'priceThreshold',
				type: 'number',
				default: 0,
				description: 'Price threshold to trigger on',
				displayOptions: {
					show: {
						event: ['priceAbove', 'priceBelow'],
					},
				},
			},

			// Percentage Change (for percentage trigger)
			{
				displayName: 'Change Percent',
				name: 'changePercent',
				type: 'number',
				default: 5,
				description: 'Percentage change to trigger on',
				displayOptions: {
					show: {
						event: ['priceChangePercent'],
					},
				},
			},

			// Confidence Threshold
			{
				displayName: 'Confidence Change Percent',
				name: 'confidenceChangePercent',
				type: 'number',
				default: 50,
				description: 'Percentage change in confidence to trigger on',
				displayOptions: {
					show: {
						event: ['confidenceChanged'],
					},
				},
			},

			// Staleness Threshold
			{
				displayName: 'Staleness Threshold (Seconds)',
				name: 'stalenessThreshold',
				type: 'number',
				default: 60,
				description: 'Seconds after which price is considered stale',
				displayOptions: {
					show: {
						event: ['priceStale'],
					},
				},
			},

			// Polling Interval (for non-streaming events)
			{
				displayName: 'Poll Interval (Seconds)',
				name: 'pollInterval',
				type: 'number',
				default: 10,
				description: 'How often to check for price updates (minimum 5 seconds)',
				displayOptions: {
					show: {
						event: ['priceAbove', 'priceBelow', 'priceChangePercent', 'confidenceChanged', 'priceStale'],
					},
				},
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		emitLicensingNotice();

		const event = this.getNodeParameter('event') as string;
		const feedIdInput = this.getNodeParameter('feedId') as string;
		
		// Resolve feed ID
		let feedId: string;
		const symbolFeedId = symbolToFeedId(feedIdInput.toUpperCase());
		if (symbolFeedId) {
			feedId = symbolFeedId;
		} else {
			feedId = normalizeFeedId(feedIdInput);
		}

		// Get credentials
		let apiCredentials: any = {};
		try {
			apiCredentials = await this.getCredentials('pythApiCredentials');
		} catch {
			// Credentials not required
		}

		const hermesClient = createHermesClient({
			hermesEndpoint: apiCredentials.hermesApiEndpoint,
			apiKey: apiCredentials.apiKey,
		});

		let lastPrice: number | null = null;
		let lastConfidence: number | null = null;
		let lastPublishTime: number | null = null;
		let intervalId: NodeJS.Timeout | null = null;
		let sseClient: SseStreamingClient | null = null;

		const emitEvent = (data: any) => {
			this.emit([
				this.helpers.returnJsonArray([
					{
						feedId,
						symbol: feedIdToSymbol(feedId),
						event,
						timestamp: Math.floor(Date.now() / 1000),
						...data,
					},
				]),
			]);
		};

		// For priceUpdated, use SSE streaming
		if (event === 'priceUpdated') {
			sseClient = new SseStreamingClient({
				endpoint: apiCredentials.hermesApiEndpoint,
				apiKey: apiCredentials.apiKey,
			});

			sseClient.subscribe([feedId], {
				onPriceUpdate: (update) => {
					const price = applyExpo(update.price.price, update.price.expo);
					const confidence = applyExpo(update.price.conf, update.price.expo);
					
					emitEvent({
						price,
						confidence,
						confidencePercent: (confidence / price) * 100,
						publishTime: update.price.publish_time,
						emaPrice: applyExpo(update.ema_price.price, update.ema_price.expo),
					});
				},
				onError: (error) => {
					console.error('Pyth SSE error:', error.message);
				},
				onConnect: () => {
					console.log('Connected to Pyth price stream');
				},
				onDisconnect: () => {
					console.log('Disconnected from Pyth price stream');
				},
			});
		}
		// For other events, use polling
		else {
			const pollInterval = Math.max(5, this.getNodeParameter('pollInterval') as number) * 1000;

			const checkPrice = async () => {
				try {
					const priceData = await hermesClient.getPriceFeed(feedId);
					if (!priceData) return;

					const price = applyExpo(priceData.price.price, priceData.price.expo);
					const confidence = applyExpo(priceData.price.conf, priceData.price.expo);
					const publishTime = priceData.price.publish_time;

					// Price Above Threshold
					if (event === 'priceAbove') {
						const threshold = this.getNodeParameter('priceThreshold') as number;
						if (price > threshold && (lastPrice === null || lastPrice <= threshold)) {
							emitEvent({
								price,
								threshold,
								confidence,
								publishTime,
							});
						}
					}

					// Price Below Threshold
					else if (event === 'priceBelow') {
						const threshold = this.getNodeParameter('priceThreshold') as number;
						if (price < threshold && (lastPrice === null || lastPrice >= threshold)) {
							emitEvent({
								price,
								threshold,
								confidence,
								publishTime,
							});
						}
					}

					// Price Change Percent
					else if (event === 'priceChangePercent') {
						const changePercent = this.getNodeParameter('changePercent') as number;
						if (lastPrice !== null) {
							const percentChange = Math.abs((price - lastPrice) / lastPrice) * 100;
							if (percentChange >= changePercent) {
								emitEvent({
									price,
									previousPrice: lastPrice,
									percentChange,
									threshold: changePercent,
									direction: price > lastPrice ? 'up' : 'down',
									publishTime,
								});
							}
						}
					}

					// Confidence Changed
					else if (event === 'confidenceChanged') {
						const confidenceChangePercent = this.getNodeParameter('confidenceChangePercent') as number;
						if (lastConfidence !== null && lastConfidence > 0) {
							const confChange = Math.abs((confidence - lastConfidence) / lastConfidence) * 100;
							if (confChange >= confidenceChangePercent) {
								emitEvent({
									price,
									confidence,
									previousConfidence: lastConfidence,
									confidenceChangePercent: confChange,
									threshold: confidenceChangePercent,
									publishTime,
								});
							}
						}
					}

					// Price Stale
					else if (event === 'priceStale') {
						const stalenessThreshold = this.getNodeParameter('stalenessThreshold') as number;
						const ageSeconds = Math.floor(Date.now() / 1000) - publishTime;
						
						if (ageSeconds > stalenessThreshold && 
							(lastPublishTime === null || Math.floor(Date.now() / 1000) - lastPublishTime <= stalenessThreshold)) {
							emitEvent({
								price,
								publishTime,
								ageSeconds,
								threshold: stalenessThreshold,
								isStale: true,
							});
						}
					}

					// Update last values
					lastPrice = price;
					lastConfidence = confidence;
					lastPublishTime = publishTime;
				} catch (error) {
					console.error('Pyth polling error:', (error as Error).message);
				}
			};

			// Initial check
			await checkPrice();
			
			// Set up polling
			intervalId = setInterval(checkPrice, pollInterval);
		}

		// Cleanup function
		const closeFunction = async () => {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
			if (sseClient) {
				sseClient.unsubscribe();
				sseClient = null;
			}
		};

		return {
			closeFunction,
		};
	}
}
