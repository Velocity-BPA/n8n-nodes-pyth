/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Pyth Network Credentials
 * Supports multiple blockchain networks and chains for accessing Pyth oracle data
 */
export class PythNetworkCredentials implements ICredentialType {
	name = 'pythNetworkCredentials';
	displayName = 'Pyth Network Credentials';
	documentationUrl = 'https://docs.pyth.network/';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			default: 'mainnet',
			options: [
				{ name: 'Mainnet', value: 'mainnet' },
				{ name: 'Testnet', value: 'testnet' },
				{ name: 'Custom', value: 'custom' },
			],
			description: 'The Pyth network environment to connect to',
		},
		{
			displayName: 'Chain',
			name: 'chain',
			type: 'options',
			default: 'ethereum',
			options: [
				{ name: 'Pythnet (Solana-based)', value: 'pythnet' },
				{ name: 'Ethereum Mainnet', value: 'ethereum' },
				{ name: 'Arbitrum', value: 'arbitrum' },
				{ name: 'Optimism', value: 'optimism' },
				{ name: 'Base', value: 'base' },
				{ name: 'Polygon', value: 'polygon' },
				{ name: 'BNB Chain', value: 'bnb' },
				{ name: 'Avalanche', value: 'avalanche' },
				{ name: 'Fantom', value: 'fantom' },
				{ name: 'Sui', value: 'sui' },
				{ name: 'Aptos', value: 'aptos' },
				{ name: 'Sei', value: 'sei' },
				{ name: 'Injective', value: 'injective' },
				{ name: 'NEAR', value: 'near' },
				{ name: 'Solana', value: 'solana' },
				{ name: 'Cosmos (via Wormhole)', value: 'cosmos' },
			],
			description: 'The blockchain network to use for on-chain operations',
		},
		{
			displayName: 'RPC Endpoint URL',
			name: 'rpcEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://mainnet.infura.io/v3/YOUR_KEY',
			description: 'RPC endpoint URL for the selected chain (required for on-chain operations)',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for signing on-chain transactions (optional, only needed for write operations)',
		},
		{
			displayName: 'Hermes Endpoint URL',
			name: 'hermesEndpoint',
			type: 'string',
			default: 'https://hermes.pyth.network',
			displayOptions: {
				show: {
					network: ['mainnet'],
				},
			},
			description: 'Pyth Hermes price service endpoint',
		},
		{
			displayName: 'Hermes Endpoint URL',
			name: 'hermesEndpoint',
			type: 'string',
			default: 'https://hermes-beta.pyth.network',
			displayOptions: {
				show: {
					network: ['testnet'],
				},
			},
			description: 'Pyth Hermes price service endpoint (testnet)',
		},
		{
			displayName: 'Hermes Endpoint URL',
			name: 'hermesEndpointCustom',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			placeholder: 'https://your-hermes-endpoint.com',
			description: 'Custom Pyth Hermes price service endpoint',
		},
		{
			displayName: 'Benchmarks API Endpoint',
			name: 'benchmarksEndpoint',
			type: 'string',
			default: 'https://benchmarks.pyth.network',
			description: 'Pyth Benchmarks API endpoint for historical price data',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional API key for rate limit tier upgrades',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.hermesEndpoint || $credentials.hermesEndpointCustom || "https://hermes.pyth.network"}}',
			url: '/api/latest_price_feeds?ids[]=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
			method: 'GET',
		},
	};
}
