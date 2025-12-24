/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * EVM Client
 * Client for interacting with Pyth contracts on EVM-compatible chains
 */

import { ethers, Contract, Wallet, JsonRpcProvider, TransactionResponse } from 'ethers';
import { getPythContract, getEntropyContract, EVM_CHAINS } from '../constants/contracts';

/**
 * Pyth Oracle Contract ABI (subset of commonly used functions)
 */
export const PYTH_ABI = [
	// Read functions
	'function getPrice(bytes32 id) view returns (tuple(int64 price, uint64 conf, int32 expo, uint publishTime))',
	'function getPriceNoOlderThan(bytes32 id, uint age) view returns (tuple(int64 price, uint64 conf, int32 expo, uint publishTime))',
	'function getPriceUnsafe(bytes32 id) view returns (tuple(int64 price, uint64 conf, int32 expo, uint publishTime))',
	'function getEmaPrice(bytes32 id) view returns (tuple(int64 price, uint64 conf, int32 expo, uint publishTime))',
	'function getEmaPriceNoOlderThan(bytes32 id, uint age) view returns (tuple(int64 price, uint64 conf, int32 expo, uint publishTime))',
	'function getEmaPriceUnsafe(bytes32 id) view returns (tuple(int64 price, uint64 conf, int32 expo, uint publishTime))',
	'function getUpdateFee(bytes[] calldata updateData) view returns (uint feeAmount)',
	'function getValidTimePeriod() view returns (uint validTimePeriod)',
	'function priceFeedExists(bytes32 id) view returns (bool exists)',
	
	// Write functions
	'function updatePriceFeeds(bytes[] calldata updateData) payable',
	'function updatePriceFeedsIfNecessary(bytes[] calldata updateData, bytes32[] calldata priceIds, uint64[] calldata publishTimes) payable',
	'function parsePriceFeedUpdates(bytes[] calldata updateData, bytes32[] calldata priceIds, uint64 minPublishTime, uint64 maxPublishTime) payable returns (tuple(bytes32 id, tuple(int64 price, uint64 conf, int32 expo, uint publishTime) price, tuple(int64 price, uint64 conf, int32 expo, uint publishTime) emaPrice)[] priceFeeds)',
];

/**
 * Entropy Contract ABI (for randomness)
 */
export const ENTROPY_ABI = [
	'function request(address provider, bytes32 userRandomNumber, bool useBlockHash) payable returns (uint64 sequenceNumber)',
	'function reveal(address provider, uint64 sequenceNumber, bytes32 userRandomNumber, bytes32 providerRevelation) returns (bytes32 randomNumber)',
	'function getFee(address provider) view returns (uint128 feeAmount)',
	'function getDefaultProvider() view returns (address provider)',
];

export interface EvmClientConfig {
	rpcEndpoint: string;
	privateKey?: string;
	chain: string;
	network?: 'mainnet' | 'testnet';
}

export interface PriceData {
	price: bigint;
	conf: bigint;
	expo: number;
	publishTime: number;
}

/**
 * EVM Client for Pyth Contracts
 */
export class EvmClient {
	private provider: JsonRpcProvider;
	private signer: Wallet | null = null;
	private pythContract: Contract;
	private entropyContract: Contract | null = null;
	private chain: string;
	private network: 'mainnet' | 'testnet';

	constructor(config: EvmClientConfig) {
		this.chain = config.chain;
		this.network = config.network || 'mainnet';
		
		this.provider = new JsonRpcProvider(config.rpcEndpoint);
		
		if (config.privateKey) {
			this.signer = new Wallet(config.privateKey, this.provider);
		}
		
		const pythAddress = getPythContract(config.chain, this.network);
		if (!pythAddress) {
			throw new Error(`No Pyth contract found for chain: ${config.chain}`);
		}
		
		this.pythContract = new Contract(
			pythAddress,
			PYTH_ABI,
			this.signer || this.provider,
		);
		
		const entropyAddress = getEntropyContract(config.chain, this.network);
		if (entropyAddress) {
			this.entropyContract = new Contract(
				entropyAddress,
				ENTROPY_ABI,
				this.signer || this.provider,
			);
		}
	}

	/**
	 * Get latest price for a feed
	 */
	async getPrice(feedId: string): Promise<PriceData> {
		const result = await this.pythContract.getPriceUnsafe(feedId);
		return {
			price: result.price,
			conf: result.conf,
			expo: result.expo,
			publishTime: Number(result.publishTime),
		};
	}

	/**
	 * Get price no older than specified age
	 */
	async getPriceNoOlderThan(feedId: string, maxAgeSeconds: number): Promise<PriceData> {
		const result = await this.pythContract.getPriceNoOlderThan(feedId, maxAgeSeconds);
		return {
			price: result.price,
			conf: result.conf,
			expo: result.expo,
			publishTime: Number(result.publishTime),
		};
	}

	/**
	 * Get EMA price for a feed
	 */
	async getEmaPrice(feedId: string): Promise<PriceData> {
		const result = await this.pythContract.getEmaPriceUnsafe(feedId);
		return {
			price: result.price,
			conf: result.conf,
			expo: result.expo,
			publishTime: Number(result.publishTime),
		};
	}

	/**
	 * Check if price feed exists
	 */
	async priceFeedExists(feedId: string): Promise<boolean> {
		return await this.pythContract.priceFeedExists(feedId);
	}

	/**
	 * Get update fee for price data
	 */
	async getUpdateFee(updateData: string[]): Promise<bigint> {
		return await this.pythContract.getUpdateFee(updateData);
	}

	/**
	 * Get valid time period for prices
	 */
	async getValidTimePeriod(): Promise<number> {
		const result = await this.pythContract.getValidTimePeriod();
		return Number(result);
	}

	/**
	 * Update price feeds on-chain
	 */
	async updatePriceFeeds(updateData: string[]): Promise<TransactionResponse> {
		if (!this.signer) {
			throw new Error('Private key required for write operations');
		}
		
		const fee = await this.getUpdateFee(updateData);
		
		return await this.pythContract.updatePriceFeeds(updateData, {
			value: fee,
		});
	}

	/**
	 * Update price feeds if necessary (only if stale)
	 */
	async updatePriceFeedsIfNecessary(
		updateData: string[],
		priceIds: string[],
		publishTimes: number[],
	): Promise<TransactionResponse> {
		if (!this.signer) {
			throw new Error('Private key required for write operations');
		}
		
		const fee = await this.getUpdateFee(updateData);
		
		return await this.pythContract.updatePriceFeedsIfNecessary(
			updateData,
			priceIds,
			publishTimes.map((t) => BigInt(t)),
			{ value: fee },
		);
	}

	/**
	 * Estimate gas for update transaction
	 */
	async estimateUpdateGas(updateData: string[]): Promise<bigint> {
		const fee = await this.getUpdateFee(updateData);
		
		return await this.pythContract.updatePriceFeeds.estimateGas(updateData, {
			value: fee,
		});
	}

	/**
	 * Get Pyth contract address
	 */
	getPythAddress(): string {
		return this.pythContract.target as string;
	}

	/**
	 * Get Entropy contract address
	 */
	getEntropyAddress(): string | null {
		return this.entropyContract ? (this.entropyContract.target as string) : null;
	}

	/**
	 * Request random number (Entropy)
	 */
	async requestRandomNumber(
		userRandomNumber: string,
		useBlockHash = false,
	): Promise<{ tx: TransactionResponse; sequenceNumber: bigint }> {
		if (!this.entropyContract) {
			throw new Error('Entropy contract not available on this chain');
		}
		if (!this.signer) {
			throw new Error('Private key required for write operations');
		}
		
		const provider = await this.entropyContract.getDefaultProvider();
		const fee = await this.entropyContract.getFee(provider);
		
		const tx = await this.entropyContract.request(
			provider,
			userRandomNumber,
			useBlockHash,
			{ value: fee },
		);
		
		const receipt = await tx.wait();
		// Parse sequence number from event logs
		const sequenceNumber = BigInt(0); // Would need to parse from logs
		
		return { tx, sequenceNumber };
	}

	/**
	 * Get entropy fee
	 */
	async getEntropyFee(): Promise<bigint> {
		if (!this.entropyContract) {
			throw new Error('Entropy contract not available on this chain');
		}
		
		const provider = await this.entropyContract.getDefaultProvider();
		return await this.entropyContract.getFee(provider);
	}

	/**
	 * Get chain info
	 */
	getChainInfo(): { chain: string; network: string; chainId: number } {
		const chainConfig = EVM_CHAINS[this.chain];
		return {
			chain: this.chain,
			network: this.network,
			chainId: chainConfig?.chainId as number || 0,
		};
	}

	/**
	 * Get provider
	 */
	getProvider(): JsonRpcProvider {
		return this.provider;
	}

	/**
	 * Get signer address
	 */
	getSignerAddress(): string | null {
		return this.signer?.address || null;
	}

	/**
	 * Health check
	 */
	async healthCheck(): Promise<boolean> {
		try {
			await this.provider.getBlockNumber();
			return true;
		} catch {
			return false;
		}
	}
}

/**
 * Create EVM client from n8n credentials
 */
export function createEvmClient(credentials: {
	rpcEndpoint: string;
	privateKey?: string;
	chain: string;
	network?: string;
}): EvmClient {
	return new EvmClient({
		rpcEndpoint: credentials.rpcEndpoint,
		privateKey: credentials.privateKey,
		chain: credentials.chain,
		network: (credentials.network as 'mainnet' | 'testnet') || 'mainnet',
	});
}
