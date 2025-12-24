/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth Confidence Interval Utilities
 * Functions for working with price confidence and uncertainty
 * 
 * Pyth prices include a confidence interval that represents the
 * uncertainty in the price. This is crucial for DeFi applications
 * to make informed decisions about price reliability.
 */

import { applyExpo } from './expoUtils';

/**
 * Confidence level thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
	EXCELLENT: 0.001, // 0.1% or less
	GOOD: 0.005, // 0.5% or less
	ACCEPTABLE: 0.01, // 1% or less
	CAUTION: 0.05, // 5% or less
	HIGH_RISK: 0.1, // 10% or less
} as const;

export type ConfidenceLevel = 'excellent' | 'good' | 'acceptable' | 'caution' | 'high_risk' | 'unacceptable';

/**
 * Calculate confidence as percentage of price
 */
export function confidenceToPercent(
	price: bigint | number,
	confidence: bigint | number,
	expo: number,
): number {
	const priceDecimal = applyExpo(price, expo);
	const confDecimal = applyExpo(confidence, expo);
	
	if (priceDecimal === 0) return 0;
	return (confDecimal / priceDecimal) * 100;
}

/**
 * Get confidence level category
 */
export function getConfidenceLevel(confidencePercent: number): ConfidenceLevel {
	const ratio = confidencePercent / 100;
	
	if (ratio <= CONFIDENCE_THRESHOLDS.EXCELLENT) return 'excellent';
	if (ratio <= CONFIDENCE_THRESHOLDS.GOOD) return 'good';
	if (ratio <= CONFIDENCE_THRESHOLDS.ACCEPTABLE) return 'acceptable';
	if (ratio <= CONFIDENCE_THRESHOLDS.CAUTION) return 'caution';
	if (ratio <= CONFIDENCE_THRESHOLDS.HIGH_RISK) return 'high_risk';
	return 'unacceptable';
}

/**
 * Check if confidence is acceptable for trading
 */
export function isConfidenceAcceptable(
	price: bigint | number,
	confidence: bigint | number,
	expo: number,
	maxPercent = 1,
): boolean {
	const percent = confidenceToPercent(price, confidence, expo);
	return percent <= maxPercent;
}

/**
 * Calculate confidence bounds
 */
export function getConfidenceBounds(
	price: bigint | number,
	confidence: bigint | number,
	expo: number,
	multiplier = 1,
): { lower: number; upper: number; price: number } {
	const priceDecimal = applyExpo(price, expo);
	const confDecimal = applyExpo(confidence, expo) * multiplier;
	
	return {
		lower: priceDecimal - confDecimal,
		upper: priceDecimal + confDecimal,
		price: priceDecimal,
	};
}

/**
 * Check if value is within confidence bounds
 */
export function isWithinConfidence(
	value: number,
	price: bigint | number,
	confidence: bigint | number,
	expo: number,
	multiplier = 1,
): boolean {
	const bounds = getConfidenceBounds(price, confidence, expo, multiplier);
	return value >= bounds.lower && value <= bounds.upper;
}

/**
 * Calculate safe price for liquidations (conservative)
 * Uses lower bound for collateral value
 */
export function getSafeCollateralPrice(
	price: bigint | number,
	confidence: bigint | number,
	expo: number,
	confidenceMultiplier = 2,
): number {
	const bounds = getConfidenceBounds(price, confidence, expo, confidenceMultiplier);
	return bounds.lower;
}

/**
 * Calculate safe price for debt (conservative)
 * Uses upper bound for debt value
 */
export function getSafeDebtPrice(
	price: bigint | number,
	confidence: bigint | number,
	expo: number,
	confidenceMultiplier = 2,
): number {
	const bounds = getConfidenceBounds(price, confidence, expo, confidenceMultiplier);
	return bounds.upper;
}

/**
 * Format confidence for display
 */
export function formatConfidence(
	price: bigint | number,
	confidence: bigint | number,
	expo: number,
): string {
	const priceDecimal = applyExpo(price, expo);
	const confDecimal = applyExpo(confidence, expo);
	const percent = confidenceToPercent(price, confidence, expo);
	
	return `${priceDecimal.toFixed(2)} ± ${confDecimal.toFixed(4)} (${percent.toFixed(4)}%)`;
}

/**
 * Get confidence rating description
 */
export function getConfidenceDescription(level: ConfidenceLevel): string {
	switch (level) {
		case 'excellent':
			return 'Excellent - Very tight confidence interval';
		case 'good':
			return 'Good - Acceptable for most use cases';
		case 'acceptable':
			return 'Acceptable - Suitable with caution';
		case 'caution':
			return 'Caution - Wide confidence interval';
		case 'high_risk':
			return 'High Risk - Very wide confidence';
		case 'unacceptable':
			return 'Unacceptable - Do not use for trading';
		default:
			return 'Unknown';
	}
}

/**
 * Compare confidence across multiple prices
 */
export function compareConfidence(
	prices: Array<{
		symbol: string;
		price: bigint | number;
		confidence: bigint | number;
		expo: number;
	}>,
): Array<{
	symbol: string;
	confidencePercent: number;
	level: ConfidenceLevel;
}> {
	return prices
		.map((p) => ({
			symbol: p.symbol,
			confidencePercent: confidenceToPercent(p.price, p.confidence, p.expo),
			level: getConfidenceLevel(confidenceToPercent(p.price, p.confidence, p.expo)),
		}))
		.sort((a, b) => a.confidencePercent - b.confidencePercent);
}

/**
 * Calculate weighted average price with confidence weighting
 * Higher confidence prices get more weight
 */
export function weightedAveragePrice(
	prices: Array<{
		price: bigint | number;
		confidence: bigint | number;
		expo: number;
	}>,
): number {
	if (prices.length === 0) return 0;
	
	let totalWeight = 0;
	let weightedSum = 0;
	
	for (const p of prices) {
		const priceDecimal = applyExpo(p.price, p.expo);
		const confPercent = confidenceToPercent(p.price, p.confidence, p.expo);
		
		// Weight inversely proportional to confidence (lower conf % = higher weight)
		const weight = confPercent > 0 ? 1 / confPercent : 1000;
		
		weightedSum += priceDecimal * weight;
		totalWeight += weight;
	}
	
	return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Check if confidence has degraded significantly
 */
export function hasConfidenceDegraded(
	currentConf: number,
	previousConf: number,
	thresholdPercent = 50,
): boolean {
	if (previousConf === 0) return currentConf > 0;
	const increase = ((currentConf - previousConf) / previousConf) * 100;
	return increase > thresholdPercent;
}
