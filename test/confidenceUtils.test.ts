/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	confidenceToPercent,
	getConfidenceLevel,
	isConfidenceAcceptable,
	getConfidenceBounds,
	isWithinConfidence,
	getSafeCollateralPrice,
	getSafeDebtPrice,
	formatConfidence,
	getConfidenceDescription,
	compareConfidence,
	weightedAveragePrice,
	hasConfidenceDegraded,
	CONFIDENCE_THRESHOLDS,
} from '../nodes/Pyth/utils/confidenceUtils';

describe('Confidence Utilities', () => {
	// Test values: price = 2500, conf = 2.5 (0.1%)
	const testPrice = BigInt('250000000000');
	const testConf = BigInt('250000000');
	const testExpo = -8;

	describe('confidenceToPercent', () => {
		it('should calculate confidence percentage correctly', () => {
			const percent = confidenceToPercent(testPrice, testConf, testExpo);
			expect(percent).toBeCloseTo(0.1, 2);
		});

		it('should handle zero price', () => {
			const percent = confidenceToPercent(BigInt(0), testConf, testExpo);
			expect(percent).toBe(0);
		});
	});

	describe('getConfidenceLevel', () => {
		it('should return excellent for very low confidence', () => {
			expect(getConfidenceLevel(0.05)).toBe('excellent');
		});

		it('should return good for low confidence', () => {
			expect(getConfidenceLevel(0.3)).toBe('good');
		});

		it('should return acceptable for moderate confidence', () => {
			expect(getConfidenceLevel(0.8)).toBe('acceptable');
		});

		it('should return caution for high confidence', () => {
			expect(getConfidenceLevel(3)).toBe('caution');
		});

		it('should return high_risk for very high confidence', () => {
			expect(getConfidenceLevel(8)).toBe('high_risk');
		});

		it('should return unacceptable for extreme confidence', () => {
			expect(getConfidenceLevel(15)).toBe('unacceptable');
		});
	});

	describe('isConfidenceAcceptable', () => {
		it('should return true when within threshold', () => {
			const result = isConfidenceAcceptable(testPrice, testConf, testExpo, 1);
			expect(result).toBe(true);
		});

		it('should return false when exceeds threshold', () => {
			const result = isConfidenceAcceptable(testPrice, testConf, testExpo, 0.05);
			expect(result).toBe(false);
		});
	});

	describe('getConfidenceBounds', () => {
		it('should calculate correct bounds', () => {
			const bounds = getConfidenceBounds(testPrice, testConf, testExpo);
			
			expect(bounds.price).toBeCloseTo(2500, 0);
			expect(bounds.lower).toBeLessThan(bounds.price);
			expect(bounds.upper).toBeGreaterThan(bounds.price);
		});

		it('should respect multiplier', () => {
			const bounds1x = getConfidenceBounds(testPrice, testConf, testExpo, 1);
			const bounds2x = getConfidenceBounds(testPrice, testConf, testExpo, 2);
			
			const range1x = bounds1x.upper - bounds1x.lower;
			const range2x = bounds2x.upper - bounds2x.lower;
			
			expect(range2x).toBeCloseTo(range1x * 2, 0);
		});
	});

	describe('isWithinConfidence', () => {
		it('should return true for value at price', () => {
			expect(isWithinConfidence(2500, testPrice, testConf, testExpo)).toBe(true);
		});

		it('should return true for value at boundary', () => {
			const bounds = getConfidenceBounds(testPrice, testConf, testExpo);
			expect(isWithinConfidence(bounds.upper, testPrice, testConf, testExpo)).toBe(true);
		});

		it('should return false for value outside bounds', () => {
			expect(isWithinConfidence(3000, testPrice, testConf, testExpo)).toBe(false);
		});
	});

	describe('getSafeCollateralPrice', () => {
		it('should return lower bound price', () => {
			const safePrice = getSafeCollateralPrice(testPrice, testConf, testExpo, 2);
			const bounds = getConfidenceBounds(testPrice, testConf, testExpo, 2);
			
			expect(safePrice).toBe(bounds.lower);
		});

		it('should be less than spot price', () => {
			const safePrice = getSafeCollateralPrice(testPrice, testConf, testExpo);
			expect(safePrice).toBeLessThan(2500);
		});
	});

	describe('getSafeDebtPrice', () => {
		it('should return upper bound price', () => {
			const safePrice = getSafeDebtPrice(testPrice, testConf, testExpo, 2);
			const bounds = getConfidenceBounds(testPrice, testConf, testExpo, 2);
			
			expect(safePrice).toBe(bounds.upper);
		});

		it('should be greater than spot price', () => {
			const safePrice = getSafeDebtPrice(testPrice, testConf, testExpo);
			expect(safePrice).toBeGreaterThan(2500);
		});
	});

	describe('formatConfidence', () => {
		it('should format confidence correctly', () => {
			const formatted = formatConfidence(testPrice, testConf, testExpo);
			expect(formatted).toContain('2500');
			expect(formatted).toContain('±');
			expect(formatted).toContain('%');
		});
	});

	describe('getConfidenceDescription', () => {
		it('should return descriptions for all levels', () => {
			expect(getConfidenceDescription('excellent')).toContain('Excellent');
			expect(getConfidenceDescription('good')).toContain('Good');
			expect(getConfidenceDescription('acceptable')).toContain('Acceptable');
			expect(getConfidenceDescription('caution')).toContain('Caution');
			expect(getConfidenceDescription('high_risk')).toContain('High Risk');
			expect(getConfidenceDescription('unacceptable')).toContain('Unacceptable');
		});
	});

	describe('compareConfidence', () => {
		it('should sort by confidence percentage', () => {
			const prices = [
				{ symbol: 'A', price: BigInt(100), confidence: BigInt(5), expo: 0 },
				{ symbol: 'B', price: BigInt(100), confidence: BigInt(1), expo: 0 },
				{ symbol: 'C', price: BigInt(100), confidence: BigInt(10), expo: 0 },
			];
			
			const result = compareConfidence(prices);
			
			expect(result[0].symbol).toBe('B');
			expect(result[2].symbol).toBe('C');
		});
	});

	describe('weightedAveragePrice', () => {
		it('should calculate weighted average', () => {
			const prices = [
				{ price: BigInt(100), confidence: BigInt(1), expo: 0 },
				{ price: BigInt(110), confidence: BigInt(10), expo: 0 },
			];
			
			const avg = weightedAveragePrice(prices);
			
			// Should be closer to 100 (lower confidence = higher weight)
			expect(avg).toBeLessThan(105);
		});

		it('should handle empty array', () => {
			expect(weightedAveragePrice([])).toBe(0);
		});
	});

	describe('hasConfidenceDegraded', () => {
		it('should detect degradation', () => {
			expect(hasConfidenceDegraded(3, 1, 50)).toBe(true);
		});

		it('should not flag minor changes', () => {
			expect(hasConfidenceDegraded(1.2, 1, 50)).toBe(false);
		});

		it('should handle zero previous confidence', () => {
			expect(hasConfidenceDegraded(1, 0)).toBe(true);
		});
	});

	describe('CONFIDENCE_THRESHOLDS', () => {
		it('should have correct threshold values', () => {
			expect(CONFIDENCE_THRESHOLDS.EXCELLENT).toBe(0.001);
			expect(CONFIDENCE_THRESHOLDS.GOOD).toBe(0.005);
			expect(CONFIDENCE_THRESHOLDS.ACCEPTABLE).toBe(0.01);
		});
	});
});
