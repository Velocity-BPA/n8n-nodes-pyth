/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	EVM_CHAINS,
	NON_EVM_CHAINS,
	ALL_CHAINS,
	getPythContract,
	getEntropyContract,
	isEvmChain,
} from '../nodes/Pyth/constants/contracts';

import {
	ALL_PRICE_FEEDS,
	CRYPTO_PRICE_FEEDS,
	FOREX_PRICE_FEEDS,
	getPriceFeedBySymbol,
	getPriceFeedId,
	getSymbolByFeedId,
	getFeedsByAssetType,
	isValidFeedId,
} from '../nodes/Pyth/constants/priceFeeds';

import {
	HERMES_ENDPOINTS,
	BENCHMARKS_ENDPOINTS,
	getHermesEndpoint,
	getBenchmarksEndpoint,
} from '../nodes/Pyth/constants/endpoints';

import {
	WORMHOLE_CHAIN_IDS,
	EVM_CHAIN_IDS,
	getWormholeChainId,
	getNetworkFromWormholeId,
	isEvmNetwork,
	getEvmChainId,
} from '../nodes/Pyth/constants/chains';

describe('Contract Constants', () => {
	describe('EVM_CHAINS', () => {
		it('should have Ethereum config', () => {
			expect(EVM_CHAINS.ethereum).toBeDefined();
			expect(EVM_CHAINS.ethereum.chainId).toBe(1);
		});

		it('should have Pyth contract addresses', () => {
			expect(EVM_CHAINS.ethereum.contracts.mainnet?.pyth).toBeDefined();
		});
	});

	describe('getPythContract', () => {
		it('should return contract address for valid chain', () => {
			const address = getPythContract('ethereum', 'mainnet');
			expect(address).toBeDefined();
			expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it('should return undefined for invalid chain', () => {
			const address = getPythContract('invalid', 'mainnet');
			expect(address).toBeUndefined();
		});
	});

	describe('isEvmChain', () => {
		it('should return true for EVM chains', () => {
			expect(isEvmChain('ethereum')).toBe(true);
			expect(isEvmChain('arbitrum')).toBe(true);
		});

		it('should return false for non-EVM chains', () => {
			expect(isEvmChain('solana')).toBe(false);
		});
	});
});

describe('Price Feed Constants', () => {
	describe('ALL_PRICE_FEEDS', () => {
		it('should have BTC/USD feed', () => {
			expect(ALL_PRICE_FEEDS['BTC/USD']).toBeDefined();
			expect(ALL_PRICE_FEEDS['BTC/USD'].base).toBe('BTC');
			expect(ALL_PRICE_FEEDS['BTC/USD'].quote).toBe('USD');
		});

		it('should have ETH/USD feed', () => {
			expect(ALL_PRICE_FEEDS['ETH/USD']).toBeDefined();
			expect(ALL_PRICE_FEEDS['ETH/USD'].assetType).toBe('crypto');
		});
	});

	describe('getPriceFeedBySymbol', () => {
		it('should find feed by symbol', () => {
			const feed = getPriceFeedBySymbol('ETH/USD');
			expect(feed).toBeDefined();
			expect(feed?.base).toBe('ETH');
		});

		it('should be case insensitive', () => {
			const feed = getPriceFeedBySymbol('eth/usd');
			expect(feed).toBeDefined();
		});

		it('should return undefined for unknown symbol', () => {
			const feed = getPriceFeedBySymbol('UNKNOWN/USD');
			expect(feed).toBeUndefined();
		});
	});

	describe('getPriceFeedId', () => {
		it('should return feed ID for valid symbol', () => {
			const feedId = getPriceFeedId('ETH/USD');
			expect(feedId).toBeDefined();
			expect(feedId).toMatch(/^0x[a-f0-9]{64}$/);
		});
	});

	describe('getSymbolByFeedId', () => {
		it('should find symbol by feed ID', () => {
			const ethFeedId = '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';
			const symbol = getSymbolByFeedId(ethFeedId);
			expect(symbol).toBe('ETH/USD');
		});
	});

	describe('getFeedsByAssetType', () => {
		it('should filter by crypto type', () => {
			const feeds = getFeedsByAssetType('crypto');
			expect(feeds.length).toBeGreaterThan(0);
			expect(feeds.every(f => f.assetType === 'crypto')).toBe(true);
		});

		it('should filter by fx type', () => {
			const feeds = getFeedsByAssetType('fx');
			expect(feeds.length).toBeGreaterThan(0);
		});
	});

	describe('isValidFeedId', () => {
		it('should validate correct feed ID', () => {
			expect(isValidFeedId('0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace')).toBe(true);
		});

		it('should reject invalid feed ID', () => {
			expect(isValidFeedId('invalid')).toBe(false);
		});
	});
});

describe('Endpoint Constants', () => {
	describe('HERMES_ENDPOINTS', () => {
		it('should have mainnet endpoint', () => {
			expect(HERMES_ENDPOINTS.mainnet).toBeDefined();
			expect(HERMES_ENDPOINTS.mainnet.url).toContain('pyth.network');
		});

		it('should have testnet endpoint', () => {
			expect(HERMES_ENDPOINTS.testnet).toBeDefined();
		});
	});

	describe('getHermesEndpoint', () => {
		it('should return mainnet endpoint by default', () => {
			const endpoint = getHermesEndpoint();
			expect(endpoint).toBe(HERMES_ENDPOINTS.mainnet.url);
		});

		it('should return testnet endpoint when requested', () => {
			const endpoint = getHermesEndpoint('testnet');
			expect(endpoint).toBe(HERMES_ENDPOINTS.testnet.url);
		});
	});

	describe('getBenchmarksEndpoint', () => {
		it('should return valid endpoint', () => {
			const endpoint = getBenchmarksEndpoint();
			expect(endpoint).toContain('benchmarks');
		});
	});
});

describe('Chain Constants', () => {
	describe('WORMHOLE_CHAIN_IDS', () => {
		it('should have Ethereum', () => {
			expect(WORMHOLE_CHAIN_IDS.ethereum).toBeDefined();
			expect(WORMHOLE_CHAIN_IDS.ethereum.wormholeChainId).toBe(2);
		});

		it('should have Solana', () => {
			expect(WORMHOLE_CHAIN_IDS.solana).toBeDefined();
			expect(WORMHOLE_CHAIN_IDS.solana.wormholeChainId).toBe(1);
		});
	});

	describe('getWormholeChainId', () => {
		it('should return correct chain ID', () => {
			expect(getWormholeChainId('ethereum')).toBe(2);
			expect(getWormholeChainId('solana')).toBe(1);
		});

		it('should return undefined for unknown chain', () => {
			expect(getWormholeChainId('unknown')).toBeUndefined();
		});
	});

	describe('getNetworkFromWormholeId', () => {
		it('should return network name', () => {
			expect(getNetworkFromWormholeId(2)).toBe('ethereum');
			expect(getNetworkFromWormholeId(1)).toBe('solana');
		});
	});

	describe('isEvmNetwork', () => {
		it('should identify EVM networks', () => {
			expect(isEvmNetwork('ethereum')).toBe(true);
			expect(isEvmNetwork('polygon')).toBe(true);
		});

		it('should identify non-EVM networks', () => {
			expect(isEvmNetwork('solana')).toBe(false);
			expect(isEvmNetwork('sui')).toBe(false);
		});
	});

	describe('getEvmChainId', () => {
		it('should return correct chain ID', () => {
			expect(getEvmChainId('ethereum')).toBe(1);
			expect(getEvmChainId('polygon')).toBe(137);
		});
	});
});
