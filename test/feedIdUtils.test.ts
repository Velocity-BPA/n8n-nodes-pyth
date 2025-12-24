/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	isValidFeedId,
	normalizeFeedId,
	feedIdsEqual,
	feedIdToBytes,
	bytesToFeedId,
	feedIdToSymbol,
	symbolToFeedId,
	isKnownFeedId,
	parseFeedIdInput,
	validateFeedIds,
	searchFeeds,
	getFeedIdChecksum,
	FEED_ID_LENGTH,
	FEED_ID_BYTES,
} from '../nodes/Pyth/utils/feedIdUtils';

describe('Feed ID Utilities', () => {
	const validFeedId = '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';
	const invalidFeedId = '0xinvalid';

	describe('isValidFeedId', () => {
		it('should validate correct feed ID', () => {
			expect(isValidFeedId(validFeedId)).toBe(true);
		});

		it('should reject feed ID without 0x prefix', () => {
			expect(isValidFeedId(validFeedId.slice(2))).toBe(false);
		});

		it('should reject feed ID with wrong length', () => {
			expect(isValidFeedId('0x123')).toBe(false);
		});

		it('should reject invalid hex characters', () => {
			expect(isValidFeedId('0xgg61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace')).toBe(false);
		});
	});

	describe('normalizeFeedId', () => {
		it('should normalize uppercase to lowercase', () => {
			const result = normalizeFeedId(validFeedId.toUpperCase());
			expect(result).toBe(validFeedId);
		});

		it('should add 0x prefix if missing', () => {
			const result = normalizeFeedId(validFeedId.slice(2));
			expect(result).toBe(validFeedId);
		});

		it('should throw on invalid feed ID', () => {
			expect(() => normalizeFeedId(invalidFeedId)).toThrow();
		});
	});

	describe('feedIdsEqual', () => {
		it('should return true for equal feed IDs', () => {
			expect(feedIdsEqual(validFeedId, validFeedId)).toBe(true);
		});

		it('should return true for case-insensitive match', () => {
			expect(feedIdsEqual(validFeedId, validFeedId.toUpperCase())).toBe(true);
		});

		it('should return false for different feed IDs', () => {
			const otherId = '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';
			expect(feedIdsEqual(validFeedId, otherId)).toBe(false);
		});
	});

	describe('feedIdToBytes / bytesToFeedId', () => {
		it('should convert feed ID to bytes and back', () => {
			const bytes = feedIdToBytes(validFeedId);
			expect(bytes.length).toBe(FEED_ID_BYTES);
			
			const backToId = bytesToFeedId(bytes);
			expect(backToId).toBe(validFeedId);
		});
	});

	describe('feedIdToSymbol / symbolToFeedId', () => {
		it('should find symbol for known feed ID', () => {
			const symbol = feedIdToSymbol(validFeedId);
			expect(symbol).toBe('ETH/USD');
		});

		it('should find feed ID for known symbol', () => {
			const feedId = symbolToFeedId('ETH/USD');
			expect(feedId).toBe(validFeedId);
		});
	});

	describe('isKnownFeedId', () => {
		it('should return true for known feed ID', () => {
			expect(isKnownFeedId(validFeedId)).toBe(true);
		});

		it('should return false for unknown feed ID', () => {
			const unknownId = '0x0000000000000000000000000000000000000000000000000000000000000000';
			expect(isKnownFeedId(unknownId)).toBe(false);
		});
	});

	describe('searchFeeds', () => {
		it('should find feeds by symbol', () => {
			const results = searchFeeds('ETH');
			expect(results.length).toBeGreaterThan(0);
		});
	});

	describe('Constants', () => {
		it('should have correct feed ID length', () => {
			expect(FEED_ID_LENGTH).toBe(66);
		});

		it('should have correct feed ID bytes', () => {
			expect(FEED_ID_BYTES).toBe(32);
		});
	});
});
