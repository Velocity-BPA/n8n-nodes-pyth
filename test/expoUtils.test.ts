/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	applyExpo,
	removeExpo,
	convertExpo,
	expoToDecimals,
	decimalsToExpo,
	formatWithExpo,
	parseWithExpo,
	getScalingFactor,
	isValidExpo,
	normalizeToExpo,
	getRecommendedExpo,
	divideWithExpo,
	multiplyWithExpo,
	COMMON_EXPONENTS,
} from '../nodes/Pyth/utils/expoUtils';

describe('Exponent Utilities', () => {
	describe('applyExpo', () => {
		it('should apply negative exponent correctly', () => {
			expect(applyExpo(250050000000, -8)).toBeCloseTo(2500.5, 2);
		});

		it('should apply zero exponent', () => {
			expect(applyExpo(100, 0)).toBe(100);
		});

		it('should apply positive exponent', () => {
			expect(applyExpo(5, 2)).toBe(500);
		});

		it('should handle bigint input', () => {
			expect(applyExpo(BigInt('250050000000'), -8)).toBeCloseTo(2500.5, 2);
		});

		it('should handle string input', () => {
			expect(applyExpo('250050000000', -8)).toBeCloseTo(2500.5, 2);
		});
	});

	describe('removeExpo', () => {
		it('should remove exponent to get raw value', () => {
			const result = removeExpo(2500.5, -8);
			expect(result).toBe(BigInt('250050000000'));
		});

		it('should handle zero exponent', () => {
			expect(removeExpo(100, 0)).toBe(BigInt(100));
		});

		it('should round to nearest integer', () => {
			const result = removeExpo(2500.555, -8);
			expect(result).toBe(BigInt('250055500000'));
		});
	});

	describe('convertExpo', () => {
		it('should convert between exponents', () => {
			const result = convertExpo(BigInt(2500), 0, -2);
			expect(result).toBe(BigInt(250000));
		});

		it('should handle same exponent', () => {
			const result = convertExpo(BigInt(100), -8, -8);
			expect(result).toBe(BigInt(100));
		});

		it('should handle number input', () => {
			const result = convertExpo(2500, 0, -2);
			expect(result).toBe(BigInt(250000));
		});
	});

	describe('expoToDecimals', () => {
		it('should return absolute value of negative exponent', () => {
			expect(expoToDecimals(-8)).toBe(8);
			expect(expoToDecimals(-2)).toBe(2);
		});

		it('should return 0 for non-negative exponent', () => {
			expect(expoToDecimals(0)).toBe(0);
			expect(expoToDecimals(2)).toBe(0);
		});
	});

	describe('decimalsToExpo', () => {
		it('should return negative of decimals', () => {
			expect(decimalsToExpo(8)).toBe(-8);
			expect(decimalsToExpo(2)).toBe(-2);
		});

		it('should return 0 for 0 decimals', () => {
			expect(decimalsToExpo(0)).toBe(0);
		});
	});

	describe('formatWithExpo', () => {
		it('should format price with default decimals', () => {
			const result = formatWithExpo(BigInt('250050000000'), -8);
			expect(result).toBe('2500.50000000');
		});

		it('should respect maxDecimals parameter', () => {
			const result = formatWithExpo(BigInt('250050000000'), -8, 2);
			expect(result).toBe('2500.50');
		});

		it('should handle string input', () => {
			const result = formatWithExpo('250050000000', -8, 2);
			expect(result).toBe('2500.50');
		});
	});

	describe('parseWithExpo', () => {
		it('should parse price string to raw value', () => {
			const result = parseWithExpo('2500.50', -8);
			expect(result).toBe(BigInt('250050000000'));
		});

		it('should handle integer strings', () => {
			const result = parseWithExpo('100', 0);
			expect(result).toBe(BigInt(100));
		});
	});

	describe('getScalingFactor', () => {
		it('should return correct scaling factor', () => {
			expect(getScalingFactor(-8)).toBe(0.00000001);
			expect(getScalingFactor(0)).toBe(1);
			expect(getScalingFactor(2)).toBe(100);
		});
	});

	describe('isValidExpo', () => {
		it('should accept valid exponents', () => {
			expect(isValidExpo(-8)).toBe(true);
			expect(isValidExpo(0)).toBe(true);
			expect(isValidExpo(-18)).toBe(true);
			expect(isValidExpo(18)).toBe(true);
		});

		it('should reject out of range exponents', () => {
			expect(isValidExpo(-19)).toBe(false);
			expect(isValidExpo(19)).toBe(false);
		});

		it('should reject non-integer exponents', () => {
			expect(isValidExpo(-8.5)).toBe(false);
		});
	});

	describe('normalizeToExpo', () => {
		it('should normalize price and conf to same exponent', () => {
			const result = normalizeToExpo(
				BigInt(2500), 0,
				BigInt(25), 0,
				-2
			);
			
			expect(result.price).toBe(BigInt(250000));
			expect(result.conf).toBe(BigInt(2500));
			expect(result.expo).toBe(-2);
		});
	});

	describe('getRecommendedExpo', () => {
		it('should return -2 for high value assets', () => {
			expect(getRecommendedExpo(50000)).toBe(-2);
		});

		it('should return -4 for medium value assets', () => {
			expect(getRecommendedExpo(500)).toBe(-4);
		});

		it('should return -6 for standard crypto', () => {
			expect(getRecommendedExpo(5)).toBe(-6);
		});

		it('should return -8 for low value assets', () => {
			expect(getRecommendedExpo(0.001)).toBe(-8);
		});
	});

	describe('divideWithExpo', () => {
		it('should divide values with exponents', () => {
			const result = divideWithExpo(
				BigInt(1000), 0,
				BigInt(100), 0
			);
			expect(result).toBe(10);
		});

		it('should handle different exponents', () => {
			const result = divideWithExpo(
				BigInt(1000000), -2,
				BigInt(100), 0
			);
			expect(result).toBe(100);
		});

		it('should throw on division by zero', () => {
			expect(() => divideWithExpo(BigInt(100), 0, BigInt(0), 0)).toThrow('Division by zero');
		});
	});

	describe('multiplyWithExpo', () => {
		it('should multiply values with exponents', () => {
			const result = multiplyWithExpo(
				BigInt(100), 0,
				BigInt(50), 0,
				-2
			);
			expect(result).toBe(BigInt(500000));
		});
	});

	describe('COMMON_EXPONENTS', () => {
		it('should have correct common exponents', () => {
			expect(COMMON_EXPONENTS.CRYPTO_MAJOR).toBe(-8);
			expect(COMMON_EXPONENTS.FOREX).toBe(-5);
			expect(COMMON_EXPONENTS.COMMODITY).toBe(-2);
		});
	});
});
