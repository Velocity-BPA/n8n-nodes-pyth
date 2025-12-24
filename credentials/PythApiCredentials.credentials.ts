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
 * Pyth API Credentials
 * For accessing Hermes (price service) and Benchmarks (historical) APIs
 */
export class PythApiCredentials implements ICredentialType {
	name = 'pythApiCredentials';
	displayName = 'Pyth API Credentials';
	documentationUrl = 'https://docs.pyth.network/price-feeds/api-reference';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			default: 'production',
			options: [
				{ name: 'Production', value: 'production' },
				{ name: 'Beta/Testnet', value: 'beta' },
				{ name: 'Custom', value: 'custom' },
			],
			description: 'Select the API environment',
		},
		{
			displayName: 'Hermes API Endpoint',
			name: 'hermesApiEndpoint',
			type: 'string',
			default: 'https://hermes.pyth.network',
			displayOptions: {
				show: {
					environment: ['production'],
				},
			},
			description: 'Hermes price service API endpoint',
		},
		{
			displayName: 'Hermes API Endpoint (Beta)',
			name: 'hermesApiEndpoint',
			type: 'string',
			default: 'https://hermes-beta.pyth.network',
			displayOptions: {
				show: {
					environment: ['beta'],
				},
			},
			description: 'Hermes price service API endpoint (beta)',
		},
		{
			displayName: 'Custom Hermes API Endpoint',
			name: 'hermesApiEndpointCustom',
			type: 'string',
			default: '',
			placeholder: 'https://your-hermes-endpoint.com',
			displayOptions: {
				show: {
					environment: ['custom'],
				},
			},
			description: 'Custom Hermes price service API endpoint',
		},
		{
			displayName: 'Benchmarks API Endpoint',
			name: 'benchmarksApiEndpoint',
			type: 'string',
			default: 'https://benchmarks.pyth.network',
			description: 'Benchmarks API endpoint for historical price data',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for higher rate limits (if applicable)',
		},
		{
			displayName: 'Rate Limit Tier',
			name: 'rateLimitTier',
			type: 'options',
			default: 'free',
			options: [
				{ name: 'Free Tier', value: 'free' },
				{ name: 'Basic Tier', value: 'basic' },
				{ name: 'Professional Tier', value: 'professional' },
				{ name: 'Enterprise Tier', value: 'enterprise' },
			],
			description: 'Your API rate limit tier (affects request limits)',
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
			baseURL: '={{$credentials.hermesApiEndpoint || $credentials.hermesApiEndpointCustom || "https://hermes.pyth.network"}}',
			url: '/api/latest_price_feeds?ids[]=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
			method: 'GET',
		},
	};
}
