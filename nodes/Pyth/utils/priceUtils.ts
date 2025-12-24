/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Price Utilities
 * Functions for working with Pyth price data and formatting
 */

export interface PythPrice {
	price: string | number | bigint;
	conf: string | number | bigint;
	expo: number;
	publishTime: number;
}

export interface FormattedPrice {
	price: number;
	confidence: number;
	priceString: string;
	confidenceString: string;
	confidencePercent: number;
	publishTime: Date;
	isStale: boolean;
}

/**
 * Default staleness threshold in seconds
 */
export const DEFAULT_STALENESS_THRESHOLD = 60;

/**
 * Convert Pyth price to human-readable format
 * Pyth prices are stored as price * 10^expo where expo is negative
 */
export function formatPythPrice(pythPrice: PythPrice, decimals = 2): FormattedPrice {
	const price = Number(pythPrice.price) * Math.pow(10, pythPrice.expo);
	const confidence = Number(pythPrice.conf) * Math.pow(10, pythPrice.expo);
	const confidencePercent = (confidence / price) * 100;
	const publishTime = new Date(pythPrice.publishTime * 1000);
	const now = Date.now();
	const ageSeconds = (now - publishTime.getTime()) / 1000;
	
	return {
		price,
		confidence,
		priceString: price.toFixed(decimals),
		confidenceString: confidence.toFixed(decimals),
		confidencePercent,
		publishTime,
		isStale: ageSeconds > DEFAULT_STALENESS_THRESHOLD,
	};
}

/**
 * Convert raw price value with exponent to decimal
 */
export function priceToDecimal(price: string | number | bigint, expo: number): number {
	return Number(price) * Math.pow(10, expo);
}

/**
 * Convert decimal price to Pyth format
 */
export function decimalToPythPrice(decimalPrice: number, expo: number): bigint {
	return BigInt(Math.round(decimalPrice / Math.pow(10, expo)));
}

/**
 * Calculate price deviation between two prices
 */
export function calculatePriceDeviation(price1: number, price2: number): number {
	if (price2 === 0) return 0;
	return Math.abs((price1 - price2) / price2) * 100;
}

/**
 * Check if price is within confidence interval
 */
export function isPriceWithinConfidence(
	targetPrice: number,
	pythPrice: number,
	confidence: number,
	multiplier = 1,
): boolean {
	const lowerBound = pythPrice - confidence * multiplier;
	const upperBound = pythPrice + confidence * multiplier;
	return targetPrice >= lowerBound && targetPrice <= upperBound;
}

/**
 * Get price age in seconds
 */
export function getPriceAge(publishTime: number): number {
	return Math.floor(Date.now() / 1000) - publishTime;
}

/**
 * Check if price is stale
 */
export function isPriceStale(publishTime: number, maxAgeSeconds = DEFAULT_STALENESS_THRESHOLD): boolean {
	return getPriceAge(publishTime) > maxAgeSeconds;
}

/**
 * Format confidence as percentage of price
 */
export function confidenceAsPercent(price: number, confidence: number): string {
	if (price === 0) return '0%';
	return `±${((confidence / price) * 100).toFixed(4)}%`;
}

/**
 * Calculate notional value
 */
export function calculateNotionalValue(amount: number, price: number): number {
	return amount * price;
}

/**
 * Format USD value
 */
export function formatUsdValue(value: number): string {
	if (value >= 1e9) {
		return `$${(value / 1e9).toFixed(2)}B`;
	}
	if (value >= 1e6) {
		return `$${(value / 1e6).toFixed(2)}M`;
	}
	if (value >= 1e3) {
		return `$${(value / 1e3).toFixed(2)}K`;
	}
	return `$${value.toFixed(2)}`;
}

/**
 * Compare prices and return direction
 */
export function getPriceDirection(
	currentPrice: number,
	previousPrice: number,
): 'up' | 'down' | 'unchanged' {
	if (currentPrice > previousPrice) return 'up';
	if (currentPrice < previousPrice) return 'down';
	return 'unchanged';
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(currentPrice: number, previousPrice: number): number {
	if (previousPrice === 0) return 0;
	return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * Validate price data
 */
export function validatePriceData(pythPrice: PythPrice): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];
	
	if (pythPrice.price === undefined || pythPrice.price === null) {
		errors.push('Price is missing');
	}
	
	if (pythPrice.conf === undefined || pythPrice.conf === null) {
		errors.push('Confidence is missing');
	}
	
	if (typeof pythPrice.expo !== 'number') {
		errors.push('Exponent must be a number');
	}
	
	if (pythPrice.publishTime <= 0) {
		errors.push('Invalid publish time');
	}
	
	const price = Number(pythPrice.price);
	if (isNaN(price) || price < 0) {
		errors.push('Price must be a non-negative number');
	}
	
	const conf = Number(pythPrice.conf);
	if (isNaN(conf) || conf < 0) {
		errors.push('Confidence must be a non-negative number');
	}
	
	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Price status enum matching Pyth's definition
 */
export enum PriceStatus {
	Unknown = 0,
	Trading = 1,
	Halted = 2,
	Auction = 3,
}

/**
 * Get human-readable price status
 */
export function getPriceStatusText(status: PriceStatus): string {
	switch (status) {
		case PriceStatus.Trading:
			return 'Trading';
		case PriceStatus.Halted:
			return 'Halted';
		case PriceStatus.Auction:
			return 'Auction';
		default:
			return 'Unknown';
	}
}
