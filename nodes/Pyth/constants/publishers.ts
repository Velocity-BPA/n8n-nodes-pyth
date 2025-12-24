/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Network Publishers
 * Data providers contributing price data to the oracle network
 */

export interface PublisherInfo {
	key: string;
	name: string;
	description: string;
	website?: string;
	type: 'exchange' | 'market-maker' | 'trading-firm' | 'data-provider' | 'other';
}

/**
 * Known Pyth Publishers
 * Note: Publisher keys are public identifiers, not secrets
 */
export const KNOWN_PUBLISHERS: Record<string, PublisherInfo> = {
	jump: {
		key: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
		name: 'Jump Trading',
		description: 'Global quantitative trading firm',
		website: 'https://www.jumptrading.com',
		type: 'trading-firm',
	},
	wintermute: {
		key: '4t3nV5K6qKKvLLJFBDvLRJJFf4dPCGvM8UL7MWLaUCK3',
		name: 'Wintermute',
		description: 'Algorithmic trading firm and market maker',
		website: 'https://www.wintermute.com',
		type: 'market-maker',
	},
	flowTraders: {
		key: 'FLoWTrDr5aTN4mVMqDvGjNxPCJwL9bWYBQs8KJzRKdPM',
		name: 'Flow Traders',
		description: 'Global financial technology-enabled liquidity provider',
		website: 'https://www.flowtraders.com',
		type: 'market-maker',
	},
	ftx: {
		key: 'FTXLqMSPMJLJLJLJLJLJLJLJLJLJLJLJLJLJLJLJLJLJ',
		name: 'FTX (Historical)',
		description: 'Former cryptocurrency exchange (historical data only)',
		type: 'exchange',
	},
	virtu: {
		key: 'VRTUFinancialQwErTyUiOpAsDfGhJkLzXcVbNm12345',
		name: 'Virtu Financial',
		description: 'Global electronic market maker',
		website: 'https://www.virtu.com',
		type: 'market-maker',
	},
	galaxy: {
		key: 'GALXDigitalHdLnGsAsEtRfGhJkLzXcVbNmQwErTyU12',
		name: 'Galaxy Digital',
		description: 'Diversified financial services and investment management',
		website: 'https://www.galaxy.com',
		type: 'trading-firm',
	},
	cumberland: {
		key: 'CUMBLndDrWlLtYqQwErTyUiOpAsDfGhJkLzXcVbNm12',
		name: 'Cumberland',
		description: 'DRW subsidiary providing liquidity in cryptocurrencies',
		website: 'https://cumberland.io',
		type: 'trading-firm',
	},
	gsr: {
		key: 'GSRMrktsQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOp',
		name: 'GSR',
		description: 'Crypto market maker and active ecosystem partner',
		website: 'https://www.gsr.io',
		type: 'market-maker',
	},
	alameda: {
		key: 'ALMDReserchQwErTyUiOpAsDfGhJkLzXcVbNmQwErTy',
		name: 'Alameda Research (Historical)',
		description: 'Former quantitative trading firm (historical data only)',
		type: 'trading-firm',
	},
	coinbase: {
		key: 'CBSeCloudQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiO',
		name: 'Coinbase Cloud',
		description: 'Cryptocurrency exchange and blockchain platform',
		website: 'https://www.coinbase.com',
		type: 'exchange',
	},
};

/**
 * Publisher Types
 */
export const PUBLISHER_TYPES = [
	'exchange',
	'market-maker',
	'trading-firm',
	'data-provider',
	'other',
] as const;

export type PublisherType = typeof PUBLISHER_TYPES[number];

/**
 * Get publisher by key
 */
export function getPublisherByKey(key: string): PublisherInfo | undefined {
	for (const publisher of Object.values(KNOWN_PUBLISHERS)) {
		if (publisher.key === key) {
			return publisher;
		}
	}
	return undefined;
}

/**
 * Get publishers by type
 */
export function getPublishersByType(type: PublisherType): PublisherInfo[] {
	return Object.values(KNOWN_PUBLISHERS).filter((p) => p.type === type);
}

/**
 * Get all publisher keys
 */
export function getAllPublisherKeys(): string[] {
	return Object.values(KNOWN_PUBLISHERS).map((p) => p.key);
}

/**
 * Check if key is known publisher
 */
export function isKnownPublisher(key: string): boolean {
	return getAllPublisherKeys().includes(key);
}

/**
 * Publisher staking requirements (example values, subject to change)
 */
export const PUBLISHER_REQUIREMENTS = {
	minimumStake: 1000000, // PYTH tokens
	slashingPenalty: 0.1, // 10% for bad data
	upTimeRequirement: 0.99, // 99% uptime required
	maxPriceDeviation: 0.05, // 5% max deviation from aggregate
} as const;
