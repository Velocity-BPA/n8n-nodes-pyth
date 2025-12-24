/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { createHermesClient, createBenchmarksClient, createEvmClient } from './transport';
import {
	formatPythPrice,
	priceToDecimal,
	isPriceStale,
	getPriceAge,
	confidenceToPercent,
	getConfidenceLevel,
	getConfidenceBounds,
	getSafeCollateralPrice,
	normalizeFeedId,
	isValidFeedId,
	feedIdToSymbol,
	symbolToFeedId,
	applyExpo,
} from './utils';
import { ALL_PRICE_FEEDS, CRYPTO_PRICE_FEEDS, getFeedsByAssetType } from './constants/priceFeeds';
import { ALL_CHAINS, getPythContract, getEntropyContract } from './constants/contracts';

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

export class Pyth implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pyth Network',
		name: 'pyth',
		icon: 'file:pyth.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Pyth Network oracle protocol for real-time price feeds, on-chain updates, and DeFi integrations',
		defaults: {
			name: 'Pyth',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'pythNetworkCredentials',
				required: false,
			},
			{
				name: 'pythApiCredentials',
				required: false,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Price Feed', value: 'priceFeed' },
					{ name: 'Real-Time Price', value: 'realTimePrice' },
					{ name: 'On-Chain Update', value: 'onChainUpdate' },
					{ name: 'Hermes (Price Service)', value: 'hermes' },
					{ name: 'Benchmarks (Historical)', value: 'benchmarks' },
					{ name: 'Asset', value: 'asset' },
					{ name: 'Confidence', value: 'confidence' },
					{ name: 'EMA (Moving Average)', value: 'ema' },
					{ name: 'Smart Contract', value: 'smartContract' },
					{ name: 'Entropy (Randomness)', value: 'entropy' },
					{ name: 'Utility', value: 'utility' },
				],
				default: 'priceFeed',
				description: 'The resource to operate on',
			},

			// Price Feed Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['priceFeed'] } },
				options: [
					{ name: 'Get Price', value: 'getPrice', action: 'Get price' },
					{ name: 'Get Price with Confidence', value: 'getPriceWithConfidence', action: 'Get price with confidence' },
					{ name: 'Get Price No Older Than', value: 'getPriceNoOlderThan', action: 'Get price no older than' },
					{ name: 'Get EMA Price', value: 'getEmaPrice', action: 'Get EMA price' },
					{ name: 'Get Feed ID', value: 'getFeedId', action: 'Get feed ID' },
					{ name: 'Get All Feed IDs', value: 'getAllFeedIds', action: 'Get all feed IDs' },
					{ name: 'Search Feeds', value: 'searchFeeds', action: 'Search feeds' },
					{ name: 'Validate Feed ID', value: 'validateFeedId', action: 'Validate feed ID' },
					{ name: 'Get Staleness', value: 'getStaleness', action: 'Get staleness' },
					{ name: 'Get Multiple Prices', value: 'getMultiplePrices', action: 'Get multiple prices' },
				],
				default: 'getPrice',
			},

			// Real-Time Price Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['realTimePrice'] } },
				options: [
					{ name: 'Get Latest Update', value: 'getLatestUpdate', action: 'Get latest update' },
					{ name: 'Get Price with Publish Time', value: 'getPriceWithPublishTime', action: 'Get price with publish time' },
					{ name: 'Get Multiple Prices', value: 'getMultiplePrices', action: 'Get multiple prices' },
					{ name: 'Get Confidence Interval', value: 'getConfidenceInterval', action: 'Get confidence interval' },
					{ name: 'Calculate Deviation', value: 'calculateDeviation', action: 'Calculate deviation' },
				],
				default: 'getLatestUpdate',
			},

			// On-Chain Update Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['onChainUpdate'] } },
				options: [
					{ name: 'Get Update Fee', value: 'getUpdateFee', action: 'Get update fee' },
					{ name: 'Get Update Data', value: 'getUpdateData', action: 'Get update data' },
					{ name: 'Update Price Feed', value: 'updatePriceFeed', action: 'Update price feed' },
					{ name: 'Estimate Gas', value: 'estimateGas', action: 'Estimate gas' },
					{ name: 'Get Contract Address', value: 'getContractAddress', action: 'Get contract address' },
					{ name: 'Get Valid Time Period', value: 'getValidTimePeriod', action: 'Get valid time period' },
				],
				default: 'getUpdateFee',
			},

			// Hermes Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['hermes'] } },
				options: [
					{ name: 'Get Latest Price Updates', value: 'getLatestPriceUpdates', action: 'Get latest price updates' },
					{ name: 'Get Price Feed IDs', value: 'getPriceFeedIds', action: 'Get feed IDs' },
					{ name: 'Get Latest VAA', value: 'getLatestVaa', action: 'Get latest VAA' },
					{ name: 'Get Streaming URL', value: 'getStreamingUrl', action: 'Get streaming URL' },
					{ name: 'Health Check', value: 'healthCheck', action: 'Health check' },
				],
				default: 'getLatestPriceUpdates',
			},

			// Benchmarks Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['benchmarks'] } },
				options: [
					{ name: 'Get Historical Price', value: 'getHistoricalPrice', action: 'Get historical price' },
					{ name: 'Get Price at Time', value: 'getPriceAtTime', action: 'Get price at time' },
					{ name: 'Get TWAP', value: 'getTwap', action: 'Get TWAP' },
					{ name: 'Search Symbols', value: 'searchSymbols', action: 'Search symbols' },
					{ name: 'Get Symbol Info', value: 'getSymbolInfo', action: 'Get symbol info' },
				],
				default: 'getHistoricalPrice',
			},

			// Asset Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['asset'] } },
				options: [
					{ name: 'Get All Assets', value: 'getAllAssets', action: 'Get all assets' },
					{ name: 'Get by Symbol', value: 'getBySymbol', action: 'Get by symbol' },
					{ name: 'Get by Type', value: 'getByType', action: 'Get by type' },
					{ name: 'Search Assets', value: 'searchAssets', action: 'Search assets' },
				],
				default: 'getAllAssets',
			},

			// Confidence Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['confidence'] } },
				options: [
					{ name: 'Get Confidence', value: 'getConfidence', action: 'Get confidence' },
					{ name: 'Get Confidence Level', value: 'getConfidenceLevel', action: 'Get confidence level' },
					{ name: 'Check Acceptable', value: 'checkAcceptable', action: 'Check acceptable' },
					{ name: 'Get Safe Price', value: 'getSafePrice', action: 'Get safe price' },
				],
				default: 'getConfidence',
			},

			// EMA Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['ema'] } },
				options: [
					{ name: 'Get EMA Price', value: 'getEmaPrice', action: 'Get EMA price' },
					{ name: 'Compare to EMA', value: 'comparePriceVsEma', action: 'Compare to EMA' },
					{ name: 'Get EMA Deviation', value: 'getEmaDeviation', action: 'Get EMA deviation' },
				],
				default: 'getEmaPrice',
			},

			// Smart Contract Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['smartContract'] } },
				options: [
					{ name: 'Get Contract Address', value: 'getContractAddress', action: 'Get contract' },
					{ name: 'Check Feed Exists', value: 'checkFeedExists', action: 'Check feed exists' },
					{ name: 'Get On-Chain Price', value: 'getOnChainPrice', action: 'Get on-chain price' },
				],
				default: 'getContractAddress',
			},

			// Entropy Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['entropy'] } },
				options: [
					{ name: 'Get Entropy Fee', value: 'getEntropyFee', action: 'Get entropy fee' },
					{ name: 'Get Entropy Contract', value: 'getEntropyContract', action: 'Get entropy contract' },
				],
				default: 'getEntropyFee',
			},

			// Utility Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['utility'] } },
				options: [
					{ name: 'Convert Expo', value: 'convertExpo', action: 'Convert expo' },
					{ name: 'Format Price', value: 'formatPrice', action: 'Format price' },
					{ name: 'Validate Feed ID', value: 'validateFeedId', action: 'Validate feed ID' },
					{ name: 'Get Feed ID from Symbol', value: 'getFeedIdFromSymbol', action: 'Get feed ID' },
					{ name: 'Get Symbol from Feed ID', value: 'getSymbolFromFeedId', action: 'Get symbol' },
					{ name: 'Get Timestamp', value: 'getCurrentTimestamp', action: 'Get timestamp' },
				],
				default: 'convertExpo',
			},

			// Feed ID Parameter
			{
				displayName: 'Feed ID or Symbol',
				name: 'feedId',
				type: 'string',
				default: '',
				placeholder: 'ETH/USD or 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
				description: 'Price feed ID (32-byte hex) or trading symbol (e.g., BTC/USD)',
				displayOptions: {
					show: {
						resource: ['priceFeed', 'realTimePrice', 'confidence', 'ema'],
						operation: ['getPrice', 'getPriceWithConfidence', 'getPriceNoOlderThan', 'getEmaPrice', 'validateFeedId', 'getStaleness', 'getLatestUpdate', 'getPriceWithPublishTime', 'getConfidenceInterval', 'getConfidence', 'getConfidenceLevel', 'checkAcceptable', 'getSafePrice', 'comparePriceVsEma', 'getEmaDeviation'],
					},
				},
			},

			// Multiple Feed IDs
			{
				displayName: 'Feed IDs',
				name: 'feedIds',
				type: 'string',
				default: '',
				placeholder: 'ETH/USD, BTC/USD, SOL/USD',
				description: 'Comma-separated list of feed IDs or symbols',
				displayOptions: {
					show: {
						resource: ['priceFeed', 'realTimePrice', 'hermes', 'onChainUpdate'],
						operation: ['getMultiplePrices', 'getLatestPriceUpdates', 'getLatestVaa', 'getStreamingUrl', 'getUpdateFee', 'getUpdateData', 'updatePriceFeed', 'estimateGas'],
					},
				},
			},

			// Symbol Parameter
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				default: '',
				placeholder: 'Crypto.ETH/USD',
				description: 'Trading symbol for the asset',
				displayOptions: {
					show: {
						resource: ['priceFeed', 'benchmarks', 'asset', 'utility'],
						operation: ['getFeedId', 'getHistoricalPrice', 'getPriceAtTime', 'getTwap', 'getSymbolInfo', 'getBySymbol', 'getFeedIdFromSymbol'],
					},
				},
			},

			// Search Query
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				placeholder: 'ETH',
				description: 'Search query string',
				displayOptions: {
					show: {
						operation: ['searchFeeds', 'searchSymbols', 'searchAssets'],
					},
				},
			},

			// Chain Selection
			{
				displayName: 'Chain',
				name: 'chain',
				type: 'options',
				default: 'ethereum',
				options: [
					{ name: 'Ethereum', value: 'ethereum' },
					{ name: 'Arbitrum', value: 'arbitrum' },
					{ name: 'Optimism', value: 'optimism' },
					{ name: 'Base', value: 'base' },
					{ name: 'Polygon', value: 'polygon' },
					{ name: 'BNB Chain', value: 'bnb' },
					{ name: 'Avalanche', value: 'avalanche' },
					{ name: 'Fantom', value: 'fantom' },
				],
				description: 'Blockchain network for on-chain operations',
				displayOptions: {
					show: {
						resource: ['onChainUpdate', 'smartContract', 'entropy'],
					},
				},
			},

			// Network (Mainnet/Testnet)
			{
				displayName: 'Network',
				name: 'network',
				type: 'options',
				default: 'mainnet',
				options: [
					{ name: 'Mainnet', value: 'mainnet' },
					{ name: 'Testnet', value: 'testnet' },
				],
				description: 'Network environment',
				displayOptions: {
					show: {
						resource: ['onChainUpdate', 'smartContract', 'entropy'],
					},
				},
			},

			// Max Age Parameter
			{
				displayName: 'Max Age (Seconds)',
				name: 'maxAge',
				type: 'number',
				default: 60,
				description: 'Maximum acceptable age of price data in seconds',
				displayOptions: {
					show: {
						operation: ['getPriceNoOlderThan', 'checkAcceptable'],
					},
				},
			},

			// Time Range Parameters
			{
				displayName: 'From Timestamp',
				name: 'fromTimestamp',
				type: 'number',
				default: 0,
				description: 'Start timestamp (Unix seconds)',
				displayOptions: {
					show: {
						resource: ['benchmarks'],
						operation: ['getHistoricalPrice', 'getTwap'],
					},
				},
			},
			{
				displayName: 'To Timestamp',
				name: 'toTimestamp',
				type: 'number',
				default: 0,
				description: 'End timestamp (Unix seconds, 0 = now)',
				displayOptions: {
					show: {
						resource: ['benchmarks'],
						operation: ['getHistoricalPrice', 'getTwap'],
					},
				},
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'number',
				default: 0,
				description: 'Unix timestamp in seconds',
				displayOptions: {
					show: {
						operation: ['getPriceAtTime'],
					},
				},
			},

			// Resolution
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				default: '1D',
				options: [
					{ name: '1 Minute', value: '1' },
					{ name: '5 Minutes', value: '5' },
					{ name: '15 Minutes', value: '15' },
					{ name: '30 Minutes', value: '30' },
					{ name: '1 Hour', value: '60' },
					{ name: '4 Hours', value: '240' },
					{ name: '1 Day', value: '1D' },
					{ name: '1 Week', value: '1W' },
				],
				description: 'Data resolution',
				displayOptions: {
					show: {
						resource: ['benchmarks'],
						operation: ['getHistoricalPrice', 'getTwap'],
					},
				},
			},

			// Asset Type
			{
				displayName: 'Asset Type',
				name: 'assetType',
				type: 'options',
				default: 'crypto',
				options: [
					{ name: 'Cryptocurrency', value: 'crypto' },
					{ name: 'Forex', value: 'fx' },
					{ name: 'Commodity', value: 'commodity' },
					{ name: 'Equity', value: 'equity' },
					{ name: 'Rates', value: 'rates' },
				],
				displayOptions: {
					show: {
						resource: ['asset'],
						operation: ['getByType'],
					},
				},
			},

			// Confidence Threshold
			{
				displayName: 'Max Confidence (%)',
				name: 'maxConfidencePercent',
				type: 'number',
				default: 1,
				description: 'Maximum acceptable confidence interval as percentage of price',
				displayOptions: {
					show: {
						resource: ['confidence'],
						operation: ['checkAcceptable'],
					},
				},
			},

			// Confidence Multiplier
			{
				displayName: 'Confidence Multiplier',
				name: 'confidenceMultiplier',
				type: 'number',
				default: 2,
				description: 'Multiplier for confidence interval (higher = more conservative)',
				displayOptions: {
					show: {
						resource: ['confidence'],
						operation: ['getSafePrice'],
					},
				},
			},

			// Utility Parameters
			{
				displayName: 'Raw Price',
				name: 'rawPrice',
				type: 'string',
				default: '',
				description: 'Raw price value (integer)',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertExpo', 'formatPrice'],
					},
				},
			},
			{
				displayName: 'Exponent',
				name: 'expo',
				type: 'number',
				default: -8,
				description: 'Price exponent (typically negative)',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertExpo', 'formatPrice'],
					},
				},
			},
			{
				displayName: 'Decimals',
				name: 'decimals',
				type: 'number',
				default: 2,
				description: 'Number of decimal places for formatted output',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['formatPrice'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		emitLicensingNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials
		let apiCredentials: any = {};
		let networkCredentials: any = {};
		
		try {
			apiCredentials = await this.getCredentials('pythApiCredentials');
		} catch {
			// API credentials not required for all operations
		}
		
		try {
			networkCredentials = await this.getCredentials('pythNetworkCredentials');
		} catch {
			// Network credentials not required for all operations
		}

		// Create clients
		const hermesClient = createHermesClient({
			hermesEndpoint: apiCredentials.hermesApiEndpoint,
			hermesEndpointCustom: apiCredentials.hermesApiEndpointCustom,
			apiKey: apiCredentials.apiKey,
		});
		
		const benchmarksClient = createBenchmarksClient({
			benchmarksEndpoint: apiCredentials.benchmarksApiEndpoint,
			apiKey: apiCredentials.apiKey,
		});

		for (let i = 0; i < items.length; i++) {
			try {
				let result: any;

				// Helper to resolve feed ID from symbol or ID
				const resolveFeedId = (input: string): string => {
					if (!input) throw new Error('Feed ID or symbol is required');
					const symbolFeedId = symbolToFeedId(input.toUpperCase());
					if (symbolFeedId) return symbolFeedId;
					return normalizeFeedId(input);
				};

				const resolveFeedIds = (input: string): string[] => {
					return input.split(',').map(s => resolveFeedId(s.trim()));
				};

				// =====================================
				// PRICE FEED RESOURCE
				// =====================================
				if (resource === 'priceFeed') {
					if (operation === 'getPrice') {
						const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
						const priceData = await hermesClient.getPriceFeed(feedId);
						if (!priceData) throw new Error(`No price data found for feed: ${feedId}`);
						
						const formatted = formatPythPrice({
							price: priceData.price.price,
							conf: priceData.price.conf,
							expo: priceData.price.expo,
							publishTime: priceData.price.publish_time,
						});
						
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							price: formatted.price,
							priceFormatted: formatted.priceString,
							confidence: formatted.confidence,
							confidencePercent: formatted.confidencePercent,
							publishTime: priceData.price.publish_time,
							publishDate: new Date(priceData.price.publish_time * 1000).toISOString(),
							isStale: formatted.isStale,
							raw: priceData,
						};
					}
					
					else if (operation === 'getPriceWithConfidence') {
						const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
						const priceData = await hermesClient.getPriceFeed(feedId);
						if (!priceData) throw new Error(`No price data found for feed: ${feedId}`);
						
						const price = applyExpo(priceData.price.price, priceData.price.expo);
						const conf = applyExpo(priceData.price.conf, priceData.price.expo);
						
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							price,
							confidence: conf,
							confidencePercent: confidenceToPercent(BigInt(priceData.price.price), BigInt(priceData.price.conf), priceData.price.expo),
							confidenceLevel: getConfidenceLevel(confidenceToPercent(BigInt(priceData.price.price), BigInt(priceData.price.conf), priceData.price.expo)),
							lowerBound: price - conf,
							upperBound: price + conf,
							expo: priceData.price.expo,
							publishTime: priceData.price.publish_time,
						};
					}
					
					else if (operation === 'getEmaPrice') {
						const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
						const priceData = await hermesClient.getPriceFeed(feedId);
						if (!priceData) throw new Error(`No price data found for feed: ${feedId}`);
						
						const emaPrice = applyExpo(priceData.ema_price.price, priceData.ema_price.expo);
						const spotPrice = applyExpo(priceData.price.price, priceData.price.expo);
						
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							emaPrice,
							spotPrice,
							deviation: ((spotPrice - emaPrice) / emaPrice) * 100,
							emaExpo: priceData.ema_price.expo,
							emaPublishTime: priceData.ema_price.publish_time,
						};
					}
					
					else if (operation === 'getFeedId') {
						const symbol = this.getNodeParameter('symbol', i) as string;
						const feedId = symbolToFeedId(symbol.toUpperCase());
						const feedInfo = ALL_PRICE_FEEDS[symbol.toUpperCase()];
						
						result = {
							symbol: symbol.toUpperCase(),
							feedId: feedId || 'Not found',
							found: !!feedId,
							info: feedInfo || null,
						};
					}
					
					else if (operation === 'getAllFeedIds') {
						const feedIds = await hermesClient.getPriceFeedIds();
						result = {
							count: feedIds.length,
							feedIds,
						};
					}
					
					else if (operation === 'searchFeeds') {
						const query = this.getNodeParameter('query', i) as string;
						const lowerQuery = query.toLowerCase();
						const matches = Object.entries(ALL_PRICE_FEEDS)
							.filter(([symbol, info]) => 
								symbol.toLowerCase().includes(lowerQuery) ||
								info.base.toLowerCase().includes(lowerQuery) ||
								info.description.toLowerCase().includes(lowerQuery)
							)
							.map(([symbol, info]) => ({ symbol, ...info }));
						
						result = {
							query,
							count: matches.length,
							feeds: matches,
						};
					}
					
					else if (operation === 'validateFeedId') {
						const feedId = this.getNodeParameter('feedId', i) as string;
						const isValid = isValidFeedId(feedId);
						const symbol = isValid ? feedIdToSymbol(feedId) : undefined;
						
						result = {
							feedId,
							isValid,
							symbol,
							isKnown: !!symbol,
						};
					}
					
					else if (operation === 'getStaleness') {
						const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
						const priceData = await hermesClient.getPriceFeed(feedId);
						if (!priceData) throw new Error(`No price data found for feed: ${feedId}`);
						
						const age = getPriceAge(priceData.price.publish_time);
						
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							ageSeconds: age,
							publishTime: priceData.price.publish_time,
							publishDate: new Date(priceData.price.publish_time * 1000).toISOString(),
							isStale: isPriceStale(priceData.price.publish_time),
							staleThreshold: 60,
						};
					}
					
					else if (operation === 'getMultiplePrices') {
						const feedIdsInput = this.getNodeParameter('feedIds', i) as string;
						const feedIds = resolveFeedIds(feedIdsInput);
						const priceUpdates = await hermesClient.getLatestPriceUpdates(feedIds, { parsed: true });
						
						const prices = priceUpdates.parsed.map(update => {
							const price = applyExpo(update.price.price, update.price.expo);
							return {
								feedId: update.id,
								symbol: feedIdToSymbol(update.id),
								price,
								confidence: applyExpo(update.price.conf, update.price.expo),
								publishTime: update.price.publish_time,
							};
						});
						
						result = {
							count: prices.length,
							prices,
						};
					}
				}

				// =====================================
				// REAL-TIME PRICE RESOURCE
				// =====================================
				else if (resource === 'realTimePrice') {
					if (operation === 'getLatestUpdate') {
						const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
						const priceData = await hermesClient.getPriceFeed(feedId);
						if (!priceData) throw new Error(`No price data found for feed: ${feedId}`);
						
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							price: {
								value: applyExpo(priceData.price.price, priceData.price.expo),
								raw: priceData.price.price,
								expo: priceData.price.expo,
							},
							confidence: {
								value: applyExpo(priceData.price.conf, priceData.price.expo),
								raw: priceData.price.conf,
							},
							emaPrice: {
								value: applyExpo(priceData.ema_price.price, priceData.ema_price.expo),
								raw: priceData.ema_price.price,
							},
							publishTime: priceData.price.publish_time,
							publishDate: new Date(priceData.price.publish_time * 1000).toISOString(),
							metadata: priceData.metadata,
						};
					}
					
					else if (operation === 'getMultiplePrices') {
						const feedIdsInput = this.getNodeParameter('feedIds', i) as string;
						const feedIds = resolveFeedIds(feedIdsInput);
						const priceUpdates = await hermesClient.getLatestPriceUpdates(feedIds, { parsed: true });
						
						result = {
							timestamp: Math.floor(Date.now() / 1000),
							count: priceUpdates.parsed.length,
							prices: priceUpdates.parsed.map(update => ({
								feedId: update.id,
								symbol: feedIdToSymbol(update.id),
								price: applyExpo(update.price.price, update.price.expo),
								confidence: applyExpo(update.price.conf, update.price.expo),
								publishTime: update.price.publish_time,
							})),
						};
					}
					
					else if (operation === 'getConfidenceInterval') {
						const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
						const priceData = await hermesClient.getPriceFeed(feedId);
						if (!priceData) throw new Error(`No price data found for feed: ${feedId}`);
						
						const bounds = getConfidenceBounds(
							BigInt(priceData.price.price),
							BigInt(priceData.price.conf),
							priceData.price.expo,
						);
						
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							price: bounds.price,
							lowerBound: bounds.lower,
							upperBound: bounds.upper,
							range: bounds.upper - bounds.lower,
						};
					}
				}

				// =====================================
				// HERMES RESOURCE
				// =====================================
				else if (resource === 'hermes') {
					if (operation === 'getLatestPriceUpdates') {
						const feedIdsInput = this.getNodeParameter('feedIds', i) as string;
						const feedIds = resolveFeedIds(feedIdsInput);
						const updates = await hermesClient.getLatestPriceUpdates(feedIds, { parsed: true });
						
						result = {
							count: updates.parsed.length,
							updates: updates.parsed,
							binary: updates.binary,
						};
					}
					
					else if (operation === 'getPriceFeedIds') {
						const feedIds = await hermesClient.getPriceFeedIds();
						result = {
							count: feedIds.length,
							feedIds,
						};
					}
					
					else if (operation === 'getLatestVaa') {
						const feedIdsInput = this.getNodeParameter('feedIds', i) as string;
						const feedIds = resolveFeedIds(feedIdsInput);
						const vaas = await hermesClient.getLatestVaas(feedIds);
						
						result = {
							count: vaas.length,
							vaas,
						};
					}
					
					else if (operation === 'getStreamingUrl') {
						const feedIdsInput = this.getNodeParameter('feedIds', i) as string;
						const feedIds = resolveFeedIds(feedIdsInput);
						const url = hermesClient.getStreamingUrl(feedIds);
						
						result = {
							url,
							websocketUrl: hermesClient.getWebSocketUrl(),
							feedIds,
						};
					}
					
					else if (operation === 'healthCheck') {
						const isHealthy = await hermesClient.healthCheck();
						result = {
							healthy: isHealthy,
							endpoint: hermesClient.getEndpoint(),
							timestamp: new Date().toISOString(),
						};
					}
				}

				// =====================================
				// BENCHMARKS RESOURCE
				// =====================================
				else if (resource === 'benchmarks') {
					if (operation === 'getHistoricalPrice') {
						const symbol = this.getNodeParameter('symbol', i) as string;
						const from = this.getNodeParameter('fromTimestamp', i) as number;
						const to = this.getNodeParameter('toTimestamp', i) as number || Math.floor(Date.now() / 1000);
						const resolution = this.getNodeParameter('resolution', i) as string;
						
						const bars = await benchmarksClient.getHistory(symbol, from, to, resolution);
						
						result = {
							symbol,
							resolution,
							from,
							to,
							count: bars.length,
							bars,
						};
					}
					
					else if (operation === 'getPriceAtTime') {
						const symbol = this.getNodeParameter('symbol', i) as string;
						const timestamp = this.getNodeParameter('timestamp', i) as number;
						
						const bar = await benchmarksClient.getPriceAtTime(symbol, timestamp);
						
						result = {
							symbol,
							timestamp,
							found: !!bar,
							bar,
						};
					}
					
					else if (operation === 'getTwap') {
						const symbol = this.getNodeParameter('symbol', i) as string;
						const from = this.getNodeParameter('fromTimestamp', i) as number;
						const to = this.getNodeParameter('toTimestamp', i) as number || Math.floor(Date.now() / 1000);
						const resolution = this.getNodeParameter('resolution', i) as string;
						
						const twap = await benchmarksClient.getTwap(symbol, from, to, resolution);
						
						result = {
							symbol,
							from,
							to,
							resolution,
							twap,
						};
					}
					
					else if (operation === 'searchSymbols') {
						const query = this.getNodeParameter('query', i) as string;
						const results = await benchmarksClient.searchSymbols(query);
						
						result = {
							query,
							count: results.length,
							symbols: results,
						};
					}
					
					else if (operation === 'getSymbolInfo') {
						const symbol = this.getNodeParameter('symbol', i) as string;
						const info = await benchmarksClient.getSymbolInfo(symbol);
						
						result = info;
					}
				}

				// =====================================
				// ASSET RESOURCE
				// =====================================
				else if (resource === 'asset') {
					if (operation === 'getAllAssets') {
						const assets = Object.entries(ALL_PRICE_FEEDS).map(([symbol, info]) => ({
							symbol,
							...info,
						}));
						
						result = {
							count: assets.length,
							assets,
						};
					}
					
					else if (operation === 'getBySymbol') {
						const symbol = this.getNodeParameter('symbol', i) as string;
						const info = ALL_PRICE_FEEDS[symbol.toUpperCase()];
						
						result = {
							symbol: symbol.toUpperCase(),
							found: !!info,
							info: info || null,
						};
					}
					
					else if (operation === 'getByType') {
						const assetType = this.getNodeParameter('assetType', i) as 'crypto' | 'fx' | 'commodity' | 'equity' | 'rates';
						const feeds = getFeedsByAssetType(assetType);
						
						result = {
							assetType,
							count: feeds.length,
							feeds,
						};
					}
					
					else if (operation === 'searchAssets') {
						const query = this.getNodeParameter('query', i) as string;
						const lowerQuery = query.toLowerCase();
						const matches = Object.entries(ALL_PRICE_FEEDS)
							.filter(([symbol, info]) =>
								symbol.toLowerCase().includes(lowerQuery) ||
								info.base.toLowerCase().includes(lowerQuery) ||
								info.description.toLowerCase().includes(lowerQuery)
							)
							.map(([symbol, info]) => ({ symbol, ...info }));
						
						result = {
							query,
							count: matches.length,
							assets: matches,
						};
					}
				}

				// =====================================
				// CONFIDENCE RESOURCE
				// =====================================
				else if (resource === 'confidence') {
					const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
					const priceData = await hermesClient.getPriceFeed(feedId);
					if (!priceData) throw new Error(`No price data found for feed: ${feedId}`);
					
					const confPercent = confidenceToPercent(
						BigInt(priceData.price.price),
						BigInt(priceData.price.conf),
						priceData.price.expo,
					);
					
					if (operation === 'getConfidence') {
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							price: applyExpo(priceData.price.price, priceData.price.expo),
							confidence: applyExpo(priceData.price.conf, priceData.price.expo),
							confidencePercent: confPercent,
						};
					}
					
					else if (operation === 'getConfidenceLevel') {
						const level = getConfidenceLevel(confPercent);
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							confidencePercent: confPercent,
							level,
						};
					}
					
					else if (operation === 'checkAcceptable') {
						const maxPercent = this.getNodeParameter('maxConfidencePercent', i) as number;
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							confidencePercent: confPercent,
							threshold: maxPercent,
							isAcceptable: confPercent <= maxPercent,
						};
					}
					
					else if (operation === 'getSafePrice') {
						const multiplier = this.getNodeParameter('confidenceMultiplier', i) as number;
						const safePrice = getSafeCollateralPrice(
							BigInt(priceData.price.price),
							BigInt(priceData.price.conf),
							priceData.price.expo,
							multiplier,
						);
						
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							spotPrice: applyExpo(priceData.price.price, priceData.price.expo),
							safePrice,
							confidenceMultiplier: multiplier,
						};
					}
				}

				// =====================================
				// EMA RESOURCE
				// =====================================
				else if (resource === 'ema') {
					const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
					const priceData = await hermesClient.getPriceFeed(feedId);
					if (!priceData) throw new Error(`No price data found for feed: ${feedId}`);
					
					const spotPrice = applyExpo(priceData.price.price, priceData.price.expo);
					const emaPrice = applyExpo(priceData.ema_price.price, priceData.ema_price.expo);
					
					if (operation === 'getEmaPrice') {
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							emaPrice,
							expo: priceData.ema_price.expo,
							publishTime: priceData.ema_price.publish_time,
						};
					}
					
					else if (operation === 'comparePriceVsEma') {
						const deviation = ((spotPrice - emaPrice) / emaPrice) * 100;
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							spotPrice,
							emaPrice,
							deviationPercent: deviation,
							direction: deviation > 0 ? 'above' : deviation < 0 ? 'below' : 'at',
						};
					}
					
					else if (operation === 'getEmaDeviation') {
						const deviation = Math.abs(spotPrice - emaPrice);
						const deviationPercent = (deviation / emaPrice) * 100;
						result = {
							feedId,
							symbol: feedIdToSymbol(feedId),
							spotPrice,
							emaPrice,
							absoluteDeviation: deviation,
							deviationPercent,
						};
					}
				}

				// =====================================
				// SMART CONTRACT RESOURCE
				// =====================================
				else if (resource === 'smartContract') {
					const chain = this.getNodeParameter('chain', i) as string;
					const network = this.getNodeParameter('network', i) as 'mainnet' | 'testnet';
					
					if (operation === 'getContractAddress') {
						const address = getPythContract(chain, network);
						result = {
							chain,
							network,
							pythContract: address || 'Not available',
							entropyContract: getEntropyContract(chain, network) || 'Not available',
						};
					}
					
					else if (operation === 'checkFeedExists' || operation === 'getOnChainPrice') {
						if (!networkCredentials.rpcEndpoint) {
							throw new Error('RPC endpoint required for on-chain operations');
						}
						
						const evmClient = createEvmClient({
							rpcEndpoint: networkCredentials.rpcEndpoint,
							privateKey: networkCredentials.privateKey,
							chain,
							network,
						});
						
						const feedId = resolveFeedId(this.getNodeParameter('feedId', i) as string);
						
						if (operation === 'checkFeedExists') {
							const exists = await evmClient.priceFeedExists(feedId);
							result = { feedId, exists, chain, network };
						} else {
							const priceData = await evmClient.getPrice(feedId);
							result = {
								feedId,
								symbol: feedIdToSymbol(feedId),
								price: applyExpo(priceData.price, priceData.expo),
								confidence: applyExpo(priceData.conf, priceData.expo),
								expo: priceData.expo,
								publishTime: priceData.publishTime,
								chain,
								network,
							};
						}
					}
				}

				// =====================================
				// ENTROPY RESOURCE
				// =====================================
				else if (resource === 'entropy') {
					const chain = this.getNodeParameter('chain', i) as string;
					const network = this.getNodeParameter('network', i) as 'mainnet' | 'testnet';
					
					if (operation === 'getEntropyContract') {
						const address = getEntropyContract(chain, network);
						result = {
							chain,
							network,
							entropyContract: address || 'Not available on this chain',
						};
					}
					
					else if (operation === 'getEntropyFee') {
						if (!networkCredentials.rpcEndpoint) {
							throw new Error('RPC endpoint required for entropy operations');
						}
						
						const evmClient = createEvmClient({
							rpcEndpoint: networkCredentials.rpcEndpoint,
							chain,
							network,
						});
						
						const fee = await evmClient.getEntropyFee();
						result = {
							chain,
							network,
							fee: fee.toString(),
							feeEth: Number(fee) / 1e18,
						};
					}
				}

				// =====================================
				// UTILITY RESOURCE
				// =====================================
				else if (resource === 'utility') {
					if (operation === 'convertExpo') {
						const rawPrice = this.getNodeParameter('rawPrice', i) as string;
						const expo = this.getNodeParameter('expo', i) as number;
						const decimal = applyExpo(BigInt(rawPrice), expo);
						
						result = {
							rawPrice,
							expo,
							decimalPrice: decimal,
						};
					}
					
					else if (operation === 'formatPrice') {
						const rawPrice = this.getNodeParameter('rawPrice', i) as string;
						const expo = this.getNodeParameter('expo', i) as number;
						const decimals = this.getNodeParameter('decimals', i) as number;
						const decimal = applyExpo(BigInt(rawPrice), expo);
						
						result = {
							rawPrice,
							expo,
							formatted: decimal.toFixed(decimals),
							value: decimal,
						};
					}
					
					else if (operation === 'validateFeedId') {
						const feedId = this.getNodeParameter('feedId', i) as string;
						result = {
							feedId,
							isValid: isValidFeedId(feedId),
							isKnown: !!feedIdToSymbol(feedId),
							symbol: feedIdToSymbol(feedId),
						};
					}
					
					else if (operation === 'getFeedIdFromSymbol') {
						const symbol = this.getNodeParameter('symbol', i) as string;
						const feedId = symbolToFeedId(symbol.toUpperCase());
						result = {
							symbol: symbol.toUpperCase(),
							feedId: feedId || 'Not found',
							found: !!feedId,
						};
					}
					
					else if (operation === 'getSymbolFromFeedId') {
						const feedId = this.getNodeParameter('feedId', i) as string;
						const symbol = feedIdToSymbol(feedId);
						result = {
							feedId,
							symbol: symbol || 'Unknown',
							found: !!symbol,
						};
					}
					
					else if (operation === 'getCurrentTimestamp') {
						const now = Math.floor(Date.now() / 1000);
						result = {
							timestamp: now,
							timestampMs: Date.now(),
							iso: new Date().toISOString(),
						};
					}
				}

				returnData.push({ json: result });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
