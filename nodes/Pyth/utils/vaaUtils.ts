/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pyth VAA (Verified Action Approval) Utilities
 * Functions for working with Wormhole VAAs used for cross-chain price updates
 * 
 * VAA is a signed message from Wormhole guardians that attests to price data.
 * It's used to update prices on-chain in a trustless manner.
 */

export interface VaaHeader {
	version: number;
	guardianSetIndex: number;
	signaturesCount: number;
}

export interface VaaBody {
	timestamp: number;
	nonce: number;
	emitterChain: number;
	emitterAddress: string;
	sequence: bigint;
	consistencyLevel: number;
	payload: string;
}

export interface ParsedVaa {
	header: VaaHeader;
	body: VaaBody;
	signatures: string[];
	hash: string;
}

/**
 * Decode base64 VAA to bytes
 */
export function decodeVaaBase64(vaaBase64: string): Uint8Array {
	const binaryString = atob(vaaBase64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

/**
 * Encode bytes to base64 VAA
 */
export function encodeVaaBase64(vaaBytes: Uint8Array): string {
	let binaryString = '';
	for (let i = 0; i < vaaBytes.length; i++) {
		binaryString += String.fromCharCode(vaaBytes[i]);
	}
	return btoa(binaryString);
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
	const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
	const bytes = new Uint8Array(cleanHex.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
	}
	return bytes;
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array, prefix = true): string {
	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return prefix ? `0x${hex}` : hex;
}

/**
 * Parse VAA header (first few bytes)
 */
export function parseVaaHeader(vaaBytes: Uint8Array): VaaHeader {
	if (vaaBytes.length < 6) {
		throw new Error('VAA too short to contain header');
	}
	
	return {
		version: vaaBytes[0],
		guardianSetIndex: (vaaBytes[1] << 24) | (vaaBytes[2] << 16) | (vaaBytes[3] << 8) | vaaBytes[4],
		signaturesCount: vaaBytes[5],
	};
}

/**
 * Validate VAA format
 */
export function isValidVaaFormat(vaa: string): boolean {
	try {
		// Check if it's valid base64
		const bytes = decodeVaaBase64(vaa);
		
		// Minimum VAA length
		if (bytes.length < 100) return false;
		
		// Check version (should be 1)
		if (bytes[0] !== 1) return false;
		
		return true;
	} catch {
		return false;
	}
}

/**
 * Extract update data from VAA for on-chain submission
 */
export function extractUpdateData(vaaBase64: string): string {
	const bytes = decodeVaaBase64(vaaBase64);
	return bytesToHex(bytes);
}

/**
 * Get VAA age in seconds
 */
export function getVaaAge(vaaTimestamp: number): number {
	return Math.floor(Date.now() / 1000) - vaaTimestamp;
}

/**
 * Check if VAA is expired
 */
export function isVaaExpired(vaaTimestamp: number, maxAgeSeconds = 60): boolean {
	return getVaaAge(vaaTimestamp) > maxAgeSeconds;
}

/**
 * Format VAA for display
 */
export function formatVaaForDisplay(vaaBase64: string): {
	length: number;
	preview: string;
	isValid: boolean;
} {
	try {
		const bytes = decodeVaaBase64(vaaBase64);
		return {
			length: bytes.length,
			preview: vaaBase64.substring(0, 50) + '...',
			isValid: isValidVaaFormat(vaaBase64),
		};
	} catch {
		return {
			length: 0,
			preview: 'Invalid VAA',
			isValid: false,
		};
	}
}

/**
 * Combine multiple VAAs for batch update
 */
export function combineVaas(vaas: string[]): string[] {
	return vaas.map((vaa) => {
		const bytes = decodeVaaBase64(vaa);
		return bytesToHex(bytes);
	});
}

/**
 * Pyth-specific: Extract price feed ID from VAA payload
 * Note: This is a simplified version; actual parsing depends on payload structure
 */
export function extractFeedIdFromVaa(vaaBytes: Uint8Array): string | null {
	try {
		// Skip header and signatures to get to payload
		const header = parseVaaHeader(vaaBytes);
		const signatureSize = 66; // Each signature is 66 bytes
		const signaturesEnd = 6 + header.signaturesCount * signatureSize;
		
		// Body starts after signatures
		const bodyStart = signaturesEnd;
		
		// Feed ID is typically in the payload (simplified extraction)
		// Actual position depends on Pyth's payload format
		if (vaaBytes.length > bodyStart + 77) {
			const feedIdBytes = vaaBytes.slice(bodyStart + 45, bodyStart + 77);
			return bytesToHex(feedIdBytes);
		}
		
		return null;
	} catch {
		return null;
	}
}

/**
 * Wormhole Guardian set info
 */
export interface GuardianSetInfo {
	index: number;
	keys: string[];
	expirationTime: number;
}

/**
 * Get required guardian signatures (2/3 + 1)
 */
export function getRequiredSignatures(guardianCount: number): number {
	return Math.floor((guardianCount * 2) / 3) + 1;
}

/**
 * Validate signature count
 */
export function hasEnoughSignatures(
	signatureCount: number,
	guardianCount: number,
): boolean {
	return signatureCount >= getRequiredSignatures(guardianCount);
}
