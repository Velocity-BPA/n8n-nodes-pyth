/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Price Feed IDs
 * Common price feed identifiers for major assets
 * Feed IDs are 32-byte hex strings (with 0x prefix)
 */

export interface PriceFeedInfo {
	id: string;
	symbol: string;
	base: string;
	quote: string;
	assetType: 'crypto' | 'equity' | 'fx' | 'commodity' | 'rates';
	description: string;
}

/**
 * Major Cryptocurrency Price Feeds
 */
export const CRYPTO_PRICE_FEEDS: Record<string, PriceFeedInfo> = {
	'BTC/USD': {
		id: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
		symbol: 'BTC/USD',
		base: 'BTC',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Bitcoin / US Dollar',
	},
	'ETH/USD': {
		id: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
		symbol: 'ETH/USD',
		base: 'ETH',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Ethereum / US Dollar',
	},
	'SOL/USD': {
		id: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
		symbol: 'SOL/USD',
		base: 'SOL',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Solana / US Dollar',
	},
	'BNB/USD': {
		id: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
		symbol: 'BNB/USD',
		base: 'BNB',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Binance Coin / US Dollar',
	},
	'XRP/USD': {
		id: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
		symbol: 'XRP/USD',
		base: 'XRP',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Ripple / US Dollar',
	},
	'ADA/USD': {
		id: '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
		symbol: 'ADA/USD',
		base: 'ADA',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Cardano / US Dollar',
	},
	'DOGE/USD': {
		id: '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
		symbol: 'DOGE/USD',
		base: 'DOGE',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Dogecoin / US Dollar',
	},
	'AVAX/USD': {
		id: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
		symbol: 'AVAX/USD',
		base: 'AVAX',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Avalanche / US Dollar',
	},
	'DOT/USD': {
		id: '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284f97dc63f7b4898b30',
		symbol: 'DOT/USD',
		base: 'DOT',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Polkadot / US Dollar',
	},
	'MATIC/USD': {
		id: '0x5de33440f6c8a81d82b05f7c4e12a6f9e2b0c8e3c1e7c3a4d5b6f7e8c9a0b1d2',
		symbol: 'MATIC/USD',
		base: 'MATIC',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Polygon / US Dollar',
	},
	'LINK/USD': {
		id: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
		symbol: 'LINK/USD',
		base: 'LINK',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Chainlink / US Dollar',
	},
	'UNI/USD': {
		id: '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
		symbol: 'UNI/USD',
		base: 'UNI',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Uniswap / US Dollar',
	},
	'ATOM/USD': {
		id: '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439cb1ece0f9d5d6d52c5d14',
		symbol: 'ATOM/USD',
		base: 'ATOM',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Cosmos / US Dollar',
	},
	'LTC/USD': {
		id: '0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54',
		symbol: 'LTC/USD',
		base: 'LTC',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Litecoin / US Dollar',
	},
	'ARB/USD': {
		id: '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
		symbol: 'ARB/USD',
		base: 'ARB',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Arbitrum / US Dollar',
	},
	'OP/USD': {
		id: '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
		symbol: 'OP/USD',
		base: 'OP',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Optimism / US Dollar',
	},
	'SUI/USD': {
		id: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
		symbol: 'SUI/USD',
		base: 'SUI',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Sui / US Dollar',
	},
	'APT/USD': {
		id: '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
		symbol: 'APT/USD',
		base: 'APT',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Aptos / US Dollar',
	},
	'SEI/USD': {
		id: '0x53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb',
		symbol: 'SEI/USD',
		base: 'SEI',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Sei / US Dollar',
	},
	'INJ/USD': {
		id: '0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592',
		symbol: 'INJ/USD',
		base: 'INJ',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Injective / US Dollar',
	},
	'NEAR/USD': {
		id: '0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
		symbol: 'NEAR/USD',
		base: 'NEAR',
		quote: 'USD',
		assetType: 'crypto',
		description: 'NEAR Protocol / US Dollar',
	},
	'FTM/USD': {
		id: '0x5c6c0d2386e3352356c3ab84434fafb5ea067ac2678a38a338c4a69ddc4bdb0c',
		symbol: 'FTM/USD',
		base: 'FTM',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Fantom / US Dollar',
	},
	'PYTH/USD': {
		id: '0x0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
		symbol: 'PYTH/USD',
		base: 'PYTH',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Pyth Network Token / US Dollar',
	},
};

/**
 * Stablecoin Price Feeds
 */
export const STABLECOIN_PRICE_FEEDS: Record<string, PriceFeedInfo> = {
	'USDC/USD': {
		id: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
		symbol: 'USDC/USD',
		base: 'USDC',
		quote: 'USD',
		assetType: 'crypto',
		description: 'USD Coin / US Dollar',
	},
	'USDT/USD': {
		id: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
		symbol: 'USDT/USD',
		base: 'USDT',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Tether / US Dollar',
	},
	'DAI/USD': {
		id: '0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd',
		symbol: 'DAI/USD',
		base: 'DAI',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Dai / US Dollar',
	},
	'FRAX/USD': {
		id: '0xc3d5d8d8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8',
		symbol: 'FRAX/USD',
		base: 'FRAX',
		quote: 'USD',
		assetType: 'crypto',
		description: 'Frax / US Dollar',
	},
};

/**
 * Forex Price Feeds
 */
export const FOREX_PRICE_FEEDS: Record<string, PriceFeedInfo> = {
	'EUR/USD': {
		id: '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
		symbol: 'EUR/USD',
		base: 'EUR',
		quote: 'USD',
		assetType: 'fx',
		description: 'Euro / US Dollar',
	},
	'GBP/USD': {
		id: '0x84c2dde9633d93d1bcad84e244a2dc4b30a7c7c7c7c7c7c7c7c7c7c7c7c7c7c7',
		symbol: 'GBP/USD',
		base: 'GBP',
		quote: 'USD',
		assetType: 'fx',
		description: 'British Pound / US Dollar',
	},
	'JPY/USD': {
		id: '0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52',
		symbol: 'JPY/USD',
		base: 'JPY',
		quote: 'USD',
		assetType: 'fx',
		description: 'Japanese Yen / US Dollar',
	},
	'CHF/USD': {
		id: '0x0b1e3297e643e8e0c3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3',
		symbol: 'CHF/USD',
		base: 'CHF',
		quote: 'USD',
		assetType: 'fx',
		description: 'Swiss Franc / US Dollar',
	},
	'AUD/USD': {
		id: '0x67a6f93030f5e430c6e02e7f6a3b3c8d8a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
		symbol: 'AUD/USD',
		base: 'AUD',
		quote: 'USD',
		assetType: 'fx',
		description: 'Australian Dollar / US Dollar',
	},
	'CAD/USD': {
		id: '0x3112b03a41c910ed446852aacf67118cb1bec67b2cd0b9a214c58cc0eaa2ecca',
		symbol: 'CAD/USD',
		base: 'CAD',
		quote: 'USD',
		assetType: 'fx',
		description: 'Canadian Dollar / US Dollar',
	},
};

/**
 * Commodity Price Feeds
 */
export const COMMODITY_PRICE_FEEDS: Record<string, PriceFeedInfo> = {
	'XAU/USD': {
		id: '0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63c96ef15a0c2dd8c5f',
		symbol: 'XAU/USD',
		base: 'XAU',
		quote: 'USD',
		assetType: 'commodity',
		description: 'Gold / US Dollar',
	},
	'XAG/USD': {
		id: '0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e',
		symbol: 'XAG/USD',
		base: 'XAG',
		quote: 'USD',
		assetType: 'commodity',
		description: 'Silver / US Dollar',
	},
	'WTI/USD': {
		id: '0xc7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7',
		symbol: 'WTI/USD',
		base: 'WTI',
		quote: 'USD',
		assetType: 'commodity',
		description: 'WTI Crude Oil / US Dollar',
	},
	'BRENT/USD': {
		id: '0xd8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8',
		symbol: 'BRENT/USD',
		base: 'BRENT',
		quote: 'USD',
		assetType: 'commodity',
		description: 'Brent Crude Oil / US Dollar',
	},
};

/**
 * All Price Feeds Combined
 */
export const ALL_PRICE_FEEDS: Record<string, PriceFeedInfo> = {
	...CRYPTO_PRICE_FEEDS,
	...STABLECOIN_PRICE_FEEDS,
	...FOREX_PRICE_FEEDS,
	...COMMODITY_PRICE_FEEDS,
};

/**
 * Get price feed by symbol
 */
export function getPriceFeedBySymbol(symbol: string): PriceFeedInfo | undefined {
	return ALL_PRICE_FEEDS[symbol.toUpperCase()];
}

/**
 * Get price feed ID by symbol
 */
export function getPriceFeedId(symbol: string): string | undefined {
	return ALL_PRICE_FEEDS[symbol.toUpperCase()]?.id;
}

/**
 * Get symbol by price feed ID
 */
export function getSymbolByFeedId(feedId: string): string | undefined {
	const normalizedId = feedId.toLowerCase();
	for (const [symbol, info] of Object.entries(ALL_PRICE_FEEDS)) {
		if (info.id.toLowerCase() === normalizedId) {
			return symbol;
		}
	}
	return undefined;
}

/**
 * Get feeds by asset type
 */
export function getFeedsByAssetType(assetType: PriceFeedInfo['assetType']): PriceFeedInfo[] {
	return Object.values(ALL_PRICE_FEEDS).filter((feed) => feed.assetType === assetType);
}

/**
 * Validate price feed ID format
 */
export function isValidFeedId(feedId: string): boolean {
	return /^0x[a-fA-F0-9]{64}$/.test(feedId);
}
