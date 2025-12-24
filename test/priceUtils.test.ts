/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	formatPythPrice,
	priceToDecimal,
	isPriceStale,
	getPriceAge,
	calculatePriceDeviation,
	isPriceWithinConfidence,
	calculatePercentChange,
	validatePriceData,
	PriceStatus,
	getPriceStatusText,
} from '../nodes/Pyth/utils/priceUtils';

describe('Price Utilities', () => {
	describe('priceToDecimal', () => {
		it('should convert price with negative exponent', () => {
			const result = priceToDecimal('250050000000', -8);
			expect(result).toBeCloseTo(2500.5, 2);
		});

		it('should handle bigint input', () => {
			const result = priceToDecimal(BigInt('250050000000'), -8);
			expect(result).toBeCloseTo(2500.5, 2);
		});

		it('should handle zero exponent', () => {
			const result = priceToDecimal('100', 0);
			expect(result).toBe(100);
		});

		it('should handle positive exponent', () => {
			const result = priceToDecimal('5', 2);
			expect(result).toBe(500);
		});
	});

	describe('formatPythPrice', () => {
		it('should format price correctly', () => {
			const pythPrice = {
				price: '250050000000',
				conf: '50000000',
				expo: -8,
				publishTime: Math.floor(Date.now() / 1000) - 10,
			};

			const result = formatPythPrice(pythPrice);
			
			expect(result.price).toBeCloseTo(2500.5, 2);
			expect(result.confidence).toBeCloseTo(0.5, 2);
			expect(result.isStale).toBe(false);
		});

		it('should detect stale prices', () => {
			const pythPrice = {
				price: '250050000000',
				conf: '50000000',
				expo: -8,
				publishTime: Math.floor(Date.now() / 1000) - 120, // 2 minutes old
			};

			const result = formatPythPrice(pythPrice);
			expect(result.isStale).toBe(true);
		});
	});

	describe('isPriceStale', () => {
		it('should return false for fresh prices', () => {
			const publishTime = Math.floor(Date.now() / 1000) - 30;
			expect(isPriceStale(publishTime)).toBe(false);
		});

		it('should return true for stale prices', () => {
			const publishTime = Math.floor(Date.now() / 1000) - 120;
			expect(isPriceStale(publishTime)).toBe(true);
		});

		it('should respect custom threshold', () => {
			const publishTime = Math.floor(Date.now() / 1000) - 45;
			expect(isPriceStale(publishTime, 30)).toBe(true);
			expect(isPriceStale(publishTime, 60)).toBe(false);
		});
	});

	describe('getPriceAge', () => {
		it('should calculate price age correctly', () => {
			const publishTime = Math.floor(Date.now() / 1000) - 100;
			const age = getPriceAge(publishTime);
			expect(age).toBeGreaterThanOrEqual(99);
			expect(age).toBeLessThanOrEqual(101);
		});
	});

	describe('calculatePriceDeviation', () => {
		it('should calculate deviation correctly', () => {
			const deviation = calculatePriceDeviation(105, 100);
			expect(deviation).toBe(5);
		});

		it('should handle negative deviation', () => {
			const deviation = calculatePriceDeviation(95, 100);
			expect(deviation).toBe(5); // Absolute value
		});

		it('should handle zero denominator', () => {
			const deviation = calculatePriceDeviation(100, 0);
			expect(deviation).toBe(0);
		});
	});

	describe('isPriceWithinConfidence', () => {
		it('should return true when price is within bounds', () => {
			const result = isPriceWithinConfidence(2500, 2500, 10, 1);
			expect(result).toBe(true);
		});

		it('should return true at boundary', () => {
			const result = isPriceWithinConfidence(2510, 2500, 10, 1);
			expect(result).toBe(true);
		});

		it('should return false outside bounds', () => {
			const result = isPriceWithinConfidence(2520, 2500, 10, 1);
			expect(result).toBe(false);
		});

		it('should respect multiplier', () => {
			const result = isPriceWithinConfidence(2520, 2500, 10, 2);
			expect(result).toBe(true);
		});
	});

	describe('calculatePercentChange', () => {
		it('should calculate positive change', () => {
			const change = calculatePercentChange(110, 100);
			expect(change).toBe(10);
		});

		it('should calculate negative change', () => {
			const change = calculatePercentChange(90, 100);
			expect(change).toBe(-10);
		});

		it('should handle zero previous price', () => {
			const change = calculatePercentChange(100, 0);
			expect(change).toBe(0);
		});
	});

	describe('validatePriceData', () => {
		it('should validate correct price data', () => {
			const result = validatePriceData({
				price: '100',
				conf: '1',
				expo: -8,
				publishTime: Math.floor(Date.now() / 1000),
			});
			
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should detect missing price', () => {
			const result = validatePriceData({
				price: undefined as any,
				conf: '1',
				expo: -8,
				publishTime: Math.floor(Date.now() / 1000),
			});
			
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Price is missing');
		});

		it('should detect invalid publish time', () => {
			const result = validatePriceData({
				price: '100',
				conf: '1',
				expo: -8,
				publishTime: 0,
			});
			
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Invalid publish time');
		});
	});

	describe('getPriceStatusText', () => {
		it('should return correct status text', () => {
			expect(getPriceStatusText(PriceStatus.Trading)).toBe('Trading');
			expect(getPriceStatusText(PriceStatus.Halted)).toBe('Halted');
			expect(getPriceStatusText(PriceStatus.Auction)).toBe('Auction');
			expect(getPriceStatusText(PriceStatus.Unknown)).toBe('Unknown');
		});
	});
});
