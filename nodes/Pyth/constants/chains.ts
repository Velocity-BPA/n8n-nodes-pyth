/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Network Chain Configuration
 * Wormhole chain IDs and cross-chain mapping
 */

export interface WormholeChainInfo {
	wormholeChainId: number;
	name: string;
	network: string;
	isEvm: boolean;
}

/**
 * Wormhole Chain IDs for Pyth cross-chain operations
 */
export const WORMHOLE_CHAIN_IDS: Record<string, WormholeChainInfo> = {
	solana: {
		wormholeChainId: 1,
		name: 'Solana',
		network: 'solana',
		isEvm: false,
	},
	ethereum: {
		wormholeChainId: 2,
		name: 'Ethereum',
		network: 'ethereum',
		isEvm: true,
	},
	terra: {
		wormholeChainId: 3,
		name: 'Terra',
		network: 'terra',
		isEvm: false,
	},
	bsc: {
		wormholeChainId: 4,
		name: 'BNB Chain',
		network: 'bnb',
		isEvm: true,
	},
	polygon: {
		wormholeChainId: 5,
		name: 'Polygon',
		network: 'polygon',
		isEvm: true,
	},
	avalanche: {
		wormholeChainId: 6,
		name: 'Avalanche',
		network: 'avalanche',
		isEvm: true,
	},
	oasis: {
		wormholeChainId: 7,
		name: 'Oasis',
		network: 'oasis',
		isEvm: true,
	},
	algorand: {
		wormholeChainId: 8,
		name: 'Algorand',
		network: 'algorand',
		isEvm: false,
	},
	fantom: {
		wormholeChainId: 10,
		name: 'Fantom',
		network: 'fantom',
		isEvm: true,
	},
	karura: {
		wormholeChainId: 11,
		name: 'Karura',
		network: 'karura',
		isEvm: true,
	},
	acala: {
		wormholeChainId: 12,
		name: 'Acala',
		network: 'acala',
		isEvm: true,
	},
	klaytn: {
		wormholeChainId: 13,
		name: 'Klaytn',
		network: 'klaytn',
		isEvm: true,
	},
	celo: {
		wormholeChainId: 14,
		name: 'Celo',
		network: 'celo',
		isEvm: true,
	},
	near: {
		wormholeChainId: 15,
		name: 'NEAR',
		network: 'near',
		isEvm: false,
	},
	moonbeam: {
		wormholeChainId: 16,
		name: 'Moonbeam',
		network: 'moonbeam',
		isEvm: true,
	},
	arbitrum: {
		wormholeChainId: 23,
		name: 'Arbitrum',
		network: 'arbitrum',
		isEvm: true,
	},
	optimism: {
		wormholeChainId: 24,
		name: 'Optimism',
		network: 'optimism',
		isEvm: true,
	},
	gnosis: {
		wormholeChainId: 25,
		name: 'Gnosis',
		network: 'gnosis',
		isEvm: true,
	},
	pythnet: {
		wormholeChainId: 26,
		name: 'Pythnet',
		network: 'pythnet',
		isEvm: false,
	},
	base: {
		wormholeChainId: 30,
		name: 'Base',
		network: 'base',
		isEvm: true,
	},
	sei: {
		wormholeChainId: 32,
		name: 'Sei',
		network: 'sei',
		isEvm: false,
	},
	scroll: {
		wormholeChainId: 34,
		name: 'Scroll',
		network: 'scroll',
		isEvm: true,
	},
	mantle: {
		wormholeChainId: 35,
		name: 'Mantle',
		network: 'mantle',
		isEvm: true,
	},
	sui: {
		wormholeChainId: 21,
		name: 'Sui',
		network: 'sui',
		isEvm: false,
	},
	aptos: {
		wormholeChainId: 22,
		name: 'Aptos',
		network: 'aptos',
		isEvm: false,
	},
	injective: {
		wormholeChainId: 19,
		name: 'Injective',
		network: 'injective',
		isEvm: false,
	},
};

/**
 * EVM Chain IDs (Standard Ethereum Chain IDs)
 */
export const EVM_CHAIN_IDS: Record<string, number> = {
	ethereum: 1,
	goerli: 5,
	sepolia: 11155111,
	polygon: 137,
	polygonMumbai: 80001,
	arbitrum: 42161,
	arbitrumGoerli: 421613,
	arbitrumSepolia: 421614,
	optimism: 10,
	optimismGoerli: 420,
	optimismSepolia: 11155420,
	base: 8453,
	baseGoerli: 84531,
	baseSepolia: 84532,
	bnb: 56,
	bnbTestnet: 97,
	avalanche: 43114,
	avalancheFuji: 43113,
	fantom: 250,
	fantomTestnet: 4002,
	gnosis: 100,
	moonbeam: 1284,
	celo: 42220,
	scroll: 534352,
	scrollSepolia: 534351,
	mantle: 5000,
	mantleTestnet: 5001,
	linea: 59144,
	lineaTestnet: 59140,
	zksync: 324,
	zksyncTestnet: 280,
	polygonZkEvm: 1101,
	polygonZkEvmTestnet: 1442,
};

/**
 * Network to Wormhole Chain ID mapping
 */
export function getWormholeChainId(network: string): number | undefined {
	const chainInfo = WORMHOLE_CHAIN_IDS[network.toLowerCase()];
	return chainInfo?.wormholeChainId;
}

/**
 * Wormhole Chain ID to Network mapping
 */
export function getNetworkFromWormholeId(wormholeChainId: number): string | undefined {
	for (const [network, info] of Object.entries(WORMHOLE_CHAIN_IDS)) {
		if (info.wormholeChainId === wormholeChainId) {
			return network;
		}
	}
	return undefined;
}

/**
 * Check if network uses EVM
 */
export function isEvmNetwork(network: string): boolean {
	const chainInfo = WORMHOLE_CHAIN_IDS[network.toLowerCase()];
	return chainInfo?.isEvm ?? false;
}

/**
 * Get EVM Chain ID
 */
export function getEvmChainId(network: string, testnet = false): number | undefined {
	const key = testnet ? `${network}Testnet` : network;
	return EVM_CHAIN_IDS[key.toLowerCase()] || EVM_CHAIN_IDS[network.toLowerCase()];
}

/**
 * Supported chains for Pyth price feeds
 */
export const SUPPORTED_CHAINS = Object.keys(WORMHOLE_CHAIN_IDS);

/**
 * EVM-compatible chains
 */
export const EVM_CHAINS = Object.entries(WORMHOLE_CHAIN_IDS)
	.filter(([, info]) => info.isEvm)
	.map(([network]) => network);

/**
 * Non-EVM chains
 */
export const NON_EVM_CHAINS = Object.entries(WORMHOLE_CHAIN_IDS)
	.filter(([, info]) => !info.isEvm)
	.map(([network]) => network);
