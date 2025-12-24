/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Price Feed ID Utilities
 * Functions for working with 32-byte price feed identifiers
 */

import { ALL_PRICE_FEEDS, getPriceFeedBySymbol, getSymbolByFeedId } from '../constants/priceFeeds';

/**
 * Feed ID format: 0x + 64 hex characters (32 bytes)
 */
export const FEED_ID_LENGTH = 66; // Including '0x' prefix
export const FEED_ID_BYTES = 32;

/**
 * Validate price feed ID format
 */
export function isValidFeedId(feedId: string): boolean {
	if (!feedId) return false;
	
	// Must start with 0x
	if (!feedId.startsWith('0x')) return false;
	
	// Must be exactly 66 characters (0x + 64 hex chars)
	if (feedId.length !== FEED_ID_LENGTH) return false;
	
	// Must be valid hex
	const hexPart = feedId.slice(2);
	return /^[a-fA-F0-9]{64}$/.test(hexPart);
}

/**
 * Normalize feed ID to lowercase with 0x prefix
 */
export function normalizeFeedId(feedId: string): string {
	if (!feedId) throw new Error('Feed ID is required');
	
	// Remove any whitespace
	let normalized = feedId.trim();
	
	// Add 0x prefix if missing
	if (!normalized.startsWith('0x')) {
		normalized = '0x' + normalized;
	}
	
	// Convert to lowercase
	normalized = normalized.toLowerCase();
	
	// Validate
	if (!isValidFeedId(normalized)) {
		throw new Error(`Invalid feed ID format: ${feedId}`);
	}
	
	return normalized;
}

/**
 * Compare two feed IDs for equality
 */
export function feedIdsEqual(feedId1: string, feedId2: string): boolean {
	try {
		return normalizeFeedId(feedId1) === normalizeFeedId(feedId2);
	} catch {
		return false;
	}
}

/**
 * Convert feed ID to bytes
 */
export function feedIdToBytes(feedId: string): Uint8Array {
	const normalized = normalizeFeedId(feedId);
	const hex = normalized.slice(2);
	const bytes = new Uint8Array(FEED_ID_BYTES);
	for (let i = 0; i < FEED_ID_BYTES; i++) {
		bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
	}
	return bytes;
}

/**
 * Convert bytes to feed ID
 */
export function bytesToFeedId(bytes: Uint8Array): string {
	if (bytes.length !== FEED_ID_BYTES) {
		throw new Error(`Invalid byte length: expected ${FEED_ID_BYTES}, got ${bytes.length}`);
	}
	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return '0x' + hex;
}

/**
 * Get symbol from feed ID (if known)
 */
export function feedIdToSymbol(feedId: string): string | undefined {
	try {
		const normalized = normalizeFeedId(feedId);
		return getSymbolByFeedId(normalized);
	} catch {
		return undefined;
	}
}

/**
 * Get feed ID from symbol (if known)
 */
export function symbolToFeedId(symbol: string): string | undefined {
	const feedInfo = getPriceFeedBySymbol(symbol);
	return feedInfo?.id;
}

/**
 * Check if feed ID is a known/registered feed
 */
export function isKnownFeedId(feedId: string): boolean {
	try {
		const normalized = normalizeFeedId(feedId);
		return Object.values(ALL_PRICE_FEEDS).some(
			(feed) => feed.id.toLowerCase() === normalized,
		);
	} catch {
		return false;
	}
}

/**
 * Parse feed ID input (handles various formats)
 */
export function parseFeedIdInput(input: string): string {
	const trimmed = input.trim();
	
	// Check if it's a known symbol
	const feedFromSymbol = symbolToFeedId(trimmed);
	if (feedFromSymbol) {
		return feedFromSymbol;
	}
	
	// Try to parse as feed ID
	return normalizeFeedId(trimmed);
}

/**
 * Format feed ID for display
 */
export function formatFeedIdForDisplay(feedId: string): string {
	try {
		const normalized = normalizeFeedId(feedId);
		const symbol = feedIdToSymbol(normalized);
		if (symbol) {
			return `${symbol} (${normalized.slice(0, 10)}...${normalized.slice(-8)})`;
		}
		return `${normalized.slice(0, 10)}...${normalized.slice(-8)}`;
	} catch {
		return feedId;
	}
}

/**
 * Batch validate feed IDs
 */
export function validateFeedIds(feedIds: string[]): {
	valid: string[];
	invalid: string[];
} {
	const valid: string[] = [];
	const invalid: string[] = [];
	
	for (const feedId of feedIds) {
		try {
			valid.push(normalizeFeedId(feedId));
		} catch {
			invalid.push(feedId);
		}
	}
	
	return { valid, invalid };
}

/**
 * Search feeds by partial ID or symbol
 */
export function searchFeeds(query: string): Array<{ id: string; symbol: string }> {
	const lowerQuery = query.toLowerCase();
	const results: Array<{ id: string; symbol: string }> = [];
	
	for (const [symbol, feed] of Object.entries(ALL_PRICE_FEEDS)) {
		if (
			symbol.toLowerCase().includes(lowerQuery) ||
			feed.id.toLowerCase().includes(lowerQuery) ||
			feed.base.toLowerCase().includes(lowerQuery) ||
			feed.description.toLowerCase().includes(lowerQuery)
		) {
			results.push({ id: feed.id, symbol });
		}
	}
	
	return results;
}

/**
 * Get all known feed IDs
 */
export function getAllKnownFeedIds(): string[] {
	return Object.values(ALL_PRICE_FEEDS).map((feed) => feed.id);
}

/**
 * Generate feed ID checksum (first 4 bytes as hex)
 */
export function getFeedIdChecksum(feedId: string): string {
	const normalized = normalizeFeedId(feedId);
	return normalized.slice(2, 10);
}
