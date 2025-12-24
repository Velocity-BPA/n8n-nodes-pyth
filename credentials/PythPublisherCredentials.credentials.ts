/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Pyth Publisher Credentials
 * For data publishers who contribute price data to the Pyth network
 */
export class PythPublisherCredentials implements ICredentialType {
	name = 'pythPublisherCredentials';
	displayName = 'Pyth Publisher Credentials';
	documentationUrl = 'https://docs.pyth.network/publishers';
	properties: INodeProperties[] = [
		{
			displayName: 'Publisher Key',
			name: 'publisherKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your publisher private key for signing price submissions',
		},
		{
			displayName: 'Publisher Endpoint',
			name: 'publisherEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://publisher.pyth.network',
			required: true,
			description: 'Publisher endpoint for submitting price data',
		},
		{
			displayName: 'Attestation Key',
			name: 'attestationKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Attestation key for signing price attestations',
		},
		{
			displayName: 'Pythnet RPC Endpoint',
			name: 'pythnetRpcEndpoint',
			type: 'string',
			default: 'https://pythnet.rpcpool.com',
			description: 'Pythnet Solana RPC endpoint for price aggregation',
		},
		{
			displayName: 'Publisher ID',
			name: 'publisherId',
			type: 'string',
			default: '',
			description: 'Your publisher identifier on the Pyth network',
		},
	];
}
