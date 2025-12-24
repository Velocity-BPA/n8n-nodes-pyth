/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Network Contract Addresses
 * All deployed Pyth oracle contracts across supported chains
 */

export interface ChainContract {
	pyth: string;
	entropy?: string;
	expressRelay?: string;
	wormhole?: string;
}

export interface ChainConfig {
	chainId: number | string;
	name: string;
	network: string;
	contracts: {
		mainnet?: ChainContract;
		testnet?: ChainContract;
	};
	rpcEndpoints: {
		mainnet?: string[];
		testnet?: string[];
	};
}

/**
 * EVM Chain Configurations
 */
export const EVM_CHAINS: Record<string, ChainConfig> = {
	ethereum: {
		chainId: 1,
		name: 'Ethereum',
		network: 'ethereum',
		contracts: {
			mainnet: {
				pyth: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
				entropy: '0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c',
			},
			testnet: {
				pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
				entropy: '0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://eth.llamarpc.com', 'https://rpc.ankr.com/eth'],
			testnet: ['https://rpc.sepolia.org'],
		},
	},
	arbitrum: {
		chainId: 42161,
		name: 'Arbitrum One',
		network: 'arbitrum',
		contracts: {
			mainnet: {
				pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
				entropy: '0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c',
			},
			testnet: {
				pyth: '0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://arb1.arbitrum.io/rpc'],
			testnet: ['https://sepolia-rollup.arbitrum.io/rpc'],
		},
	},
	optimism: {
		chainId: 10,
		name: 'Optimism',
		network: 'optimism',
		contracts: {
			mainnet: {
				pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
				entropy: '0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c',
			},
			testnet: {
				pyth: '0x0708325268dF9F66270F1401206434524814508b',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://mainnet.optimism.io'],
			testnet: ['https://sepolia.optimism.io'],
		},
	},
	base: {
		chainId: 8453,
		name: 'Base',
		network: 'base',
		contracts: {
			mainnet: {
				pyth: '0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a',
				entropy: '0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c',
			},
			testnet: {
				pyth: '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://mainnet.base.org'],
			testnet: ['https://sepolia.base.org'],
		},
	},
	polygon: {
		chainId: 137,
		name: 'Polygon',
		network: 'polygon',
		contracts: {
			mainnet: {
				pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
				entropy: '0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c',
			},
			testnet: {
				pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://polygon-rpc.com'],
			testnet: ['https://rpc-amoy.polygon.technology'],
		},
	},
	bnb: {
		chainId: 56,
		name: 'BNB Chain',
		network: 'bnb',
		contracts: {
			mainnet: {
				pyth: '0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594',
				entropy: '0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c',
			},
			testnet: {
				pyth: '0xd7308b14BF4008e7C7571AD2feCdC50216dba357',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://bsc-dataseed.binance.org'],
			testnet: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
		},
	},
	avalanche: {
		chainId: 43114,
		name: 'Avalanche',
		network: 'avalanche',
		contracts: {
			mainnet: {
				pyth: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
				entropy: '0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c',
			},
			testnet: {
				pyth: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://api.avax.network/ext/bc/C/rpc'],
			testnet: ['https://api.avax-test.network/ext/bc/C/rpc'],
		},
	},
	fantom: {
		chainId: 250,
		name: 'Fantom',
		network: 'fantom',
		contracts: {
			mainnet: {
				pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
			},
			testnet: {
				pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://rpc.ftm.tools'],
			testnet: ['https://rpc.testnet.fantom.network'],
		},
	},
};

/**
 * Non-EVM Chain Configurations
 */
export const NON_EVM_CHAINS: Record<string, ChainConfig> = {
	solana: {
		chainId: 'solana',
		name: 'Solana',
		network: 'solana',
		contracts: {
			mainnet: {
				pyth: 'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH',
			},
			testnet: {
				pyth: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://api.mainnet-beta.solana.com'],
			testnet: ['https://api.devnet.solana.com'],
		},
	},
	pythnet: {
		chainId: 'pythnet',
		name: 'Pythnet',
		network: 'pythnet',
		contracts: {
			mainnet: {
				pyth: 'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://pythnet.rpcpool.com'],
		},
	},
	sui: {
		chainId: 'sui',
		name: 'Sui',
		network: 'sui',
		contracts: {
			mainnet: {
				pyth: '0x801dbc2f0053d34734814b2d6df491ce7807a725fe9a01ad74a07e9c51396c37',
			},
			testnet: {
				pyth: '0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://fullnode.mainnet.sui.io'],
			testnet: ['https://fullnode.testnet.sui.io'],
		},
	},
	aptos: {
		chainId: 'aptos',
		name: 'Aptos',
		network: 'aptos',
		contracts: {
			mainnet: {
				pyth: '0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387',
			},
			testnet: {
				pyth: '0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://fullnode.mainnet.aptoslabs.com/v1'],
			testnet: ['https://fullnode.testnet.aptoslabs.com/v1'],
		},
	},
	sei: {
		chainId: 'sei',
		name: 'Sei',
		network: 'sei',
		contracts: {
			mainnet: {
				pyth: 'sei1w2rxq6eckak47s25crxlhmq96fzjwdtjgdwavn56ggc0qvxvw7rqczxyfy',
			},
			testnet: {
				pyth: 'sei1w2rxq6eckak47s25crxlhmq96fzjwdtjgdwavn56ggc0qvxvw7rqczxyfy',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://sei-rpc.polkachu.com'],
			testnet: ['https://rpc.atlantic-2.seinetwork.io'],
		},
	},
	injective: {
		chainId: 'injective',
		name: 'Injective',
		network: 'injective',
		contracts: {
			mainnet: {
				pyth: 'inj12pwnhtv7yat2s30xuf4gdk9qm85v4j3e60dgvu',
			},
			testnet: {
				pyth: 'inj12pwnhtv7yat2s30xuf4gdk9qm85v4j3e60dgvu',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://injective-rpc.polkachu.com'],
			testnet: ['https://testnet.sentry.tm.injective.network:443'],
		},
	},
	near: {
		chainId: 'near',
		name: 'NEAR',
		network: 'near',
		contracts: {
			mainnet: {
				pyth: 'pyth-oracle.near',
			},
			testnet: {
				pyth: 'pyth-oracle.testnet',
			},
		},
		rpcEndpoints: {
			mainnet: ['https://rpc.mainnet.near.org'],
			testnet: ['https://rpc.testnet.near.org'],
		},
	},
};

/**
 * Get all chain configurations
 */
export const ALL_CHAINS: Record<string, ChainConfig> = {
	...EVM_CHAINS,
	...NON_EVM_CHAINS,
};

/**
 * Chain ID to name mapping
 */
export const CHAIN_ID_TO_NAME: Record<number | string, string> = Object.entries(ALL_CHAINS).reduce(
	(acc, [name, config]) => {
		acc[config.chainId] = name;
		return acc;
	},
	{} as Record<number | string, string>,
);

/**
 * Get Pyth contract address for a chain
 */
export function getPythContract(chain: string, network: 'mainnet' | 'testnet' = 'mainnet'): string | undefined {
	const chainConfig = ALL_CHAINS[chain.toLowerCase()];
	return chainConfig?.contracts[network]?.pyth;
}

/**
 * Get Entropy contract address for a chain
 */
export function getEntropyContract(chain: string, network: 'mainnet' | 'testnet' = 'mainnet'): string | undefined {
	const chainConfig = ALL_CHAINS[chain.toLowerCase()];
	return chainConfig?.contracts[network]?.entropy;
}

/**
 * Check if chain is EVM-compatible
 */
export function isEvmChain(chain: string): boolean {
	return chain.toLowerCase() in EVM_CHAINS;
}
