/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Exponent (Expo) Utilities
 * Functions for handling Pyth's price scaling exponents
 * 
 * Pyth stores prices as integers with an exponent, similar to scientific notation.
 * For example, a price of $1,234.56 might be stored as:
 * - price: 123456000000 (integer)
 * - expo: -8 (exponent)
 * - Actual price: 123456000000 * 10^(-8) = 1234.56
 */

/**
 * Common exponent values used by Pyth
 */
export const COMMON_EXPONENTS = {
	CRYPTO_MAJOR: -8, // BTC, ETH - high precision
	CRYPTO_MINOR: -8, // Most altcoins
	FOREX: -5, // FX pairs
	COMMODITY: -2, // Gold, Silver
	EQUITY: -4, // Stock prices
} as const;

/**
 * Apply exponent to convert raw price to decimal
 */
export function applyExpo(rawPrice: bigint | number | string, expo: number): number {
	const price = typeof rawPrice === 'bigint' ? Number(rawPrice) : Number(rawPrice);
	return price * Math.pow(10, expo);
}

/**
 * Remove exponent to convert decimal to raw price
 */
export function removeExpo(decimalPrice: number, expo: number): bigint {
	return BigInt(Math.round(decimalPrice / Math.pow(10, expo)));
}

/**
 * Convert between different exponents
 */
export function convertExpo(
	value: bigint | number,
	fromExpo: number,
	toExpo: number,
): bigint {
	const numValue = typeof value === 'bigint' ? Number(value) : value;
	const decimal = numValue * Math.pow(10, fromExpo);
	return BigInt(Math.round(decimal / Math.pow(10, toExpo)));
}

/**
 * Get decimal places from exponent
 */
export function expoToDecimals(expo: number): number {
	return expo < 0 ? Math.abs(expo) : 0;
}

/**
 * Get exponent from decimal places
 */
export function decimalsToExpo(decimals: number): number {
	return -decimals;
}

/**
 * Format price with appropriate decimal places based on exponent
 */
export function formatWithExpo(
	rawPrice: bigint | number | string,
	expo: number,
	maxDecimals?: number,
): string {
	const decimal = applyExpo(rawPrice, expo);
	const actualDecimals = maxDecimals ?? expoToDecimals(expo);
	return decimal.toFixed(actualDecimals);
}

/**
 * Parse price string to raw value with exponent
 */
export function parseWithExpo(priceString: string, expo: number): bigint {
	const decimal = parseFloat(priceString);
	return removeExpo(decimal, expo);
}

/**
 * Calculate scaling factor from exponent
 */
export function getScalingFactor(expo: number): number {
	return Math.pow(10, expo);
}

/**
 * Validate exponent is within reasonable bounds
 */
export function isValidExpo(expo: number): boolean {
	return Number.isInteger(expo) && expo >= -18 && expo <= 18;
}

/**
 * Normalize price and confidence to same exponent
 */
export function normalizeToExpo(
	price: bigint | number,
	priceExpo: number,
	conf: bigint | number,
	confExpo: number,
	targetExpo: number,
): { price: bigint; conf: bigint; expo: number } {
	return {
		price: convertExpo(price, priceExpo, targetExpo),
		conf: convertExpo(conf, confExpo, targetExpo),
		expo: targetExpo,
	};
}

/**
 * Get recommended exponent for a price value
 */
export function getRecommendedExpo(price: number): number {
	if (price >= 10000) return -2;
	if (price >= 100) return -4;
	if (price >= 1) return -6;
	return -8;
}

/**
 * Safe division with exponent handling
 */
export function divideWithExpo(
	numerator: bigint | number,
	numExpo: number,
	denominator: bigint | number,
	denExpo: number,
): number {
	const num = applyExpo(numerator, numExpo);
	const den = applyExpo(denominator, denExpo);
	if (den === 0) throw new Error('Division by zero');
	return num / den;
}

/**
 * Multiply with exponent handling
 */
export function multiplyWithExpo(
	value1: bigint | number,
	expo1: number,
	value2: bigint | number,
	expo2: number,
	resultExpo: number,
): bigint {
	const decimal1 = applyExpo(value1, expo1);
	const decimal2 = applyExpo(value2, expo2);
	const product = decimal1 * decimal2;
	return removeExpo(product, resultExpo);
}
