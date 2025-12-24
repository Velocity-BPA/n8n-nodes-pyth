# n8n-nodes-pyth Installation, Build, and Testing Guide

## Project Summary

**n8n-nodes-pyth** is a comprehensive n8n community node package for the Pyth Network oracle protocol. It provides:

- **Real-time price feeds** for cryptocurrencies, forex, commodities, and equities
- **On-chain price updates** for EVM-compatible blockchains
- **Historical price data** via the Benchmarks API
- **Confidence interval analysis** for DeFi risk management
- **EMA (Exponential Moving Average)** price calculations
- **Multi-chain support** across 20+ blockchain networks
- **Streaming updates** via SSE and WebSocket
- **Entropy (randomness)** for on-chain applications

## Short Project Description

> A complete n8n community node for Pyth Network oracle - access real-time price feeds, push on-chain updates, query historical data, and integrate DeFi workflows across 20+ blockchains.

---

## Step 1: Extract and Install Dependencies

```bash
# Extract the zip file
unzip n8n-nodes-pyth.zip
cd n8n-nodes-pyth

# Install dependencies
npm install
```

## Step 2: Build the Project

```bash
# Build TypeScript and copy icons
npm run build
```

This will:
1. Compile TypeScript files to JavaScript in the `dist/` directory
2. Copy SVG icons to the dist folder

## Step 3: Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

## Step 4: Link to Local n8n Instance

### Option A: Using npm link (Recommended for Development)

```bash
# In the n8n-nodes-pyth directory
npm link

# In your n8n installation directory (usually ~/.n8n)
cd ~/.n8n
npm link n8n-nodes-pyth
```

### Option B: Direct Installation

```bash
# Copy the built package to n8n's custom nodes directory
mkdir -p ~/.n8n/custom
cp -r ./dist ~/.n8n/custom/n8n-nodes-pyth
cp package.json ~/.n8n/custom/n8n-nodes-pyth/
```

### Option C: Install from npm (After Publishing)

```bash
cd ~/.n8n
npm install n8n-nodes-pyth
```

## Step 5: Restart n8n

```bash
# If running n8n via npm
n8n stop
n8n start

# If running n8n via Docker, restart the container
docker restart n8n

# If running n8n as a service
systemctl restart n8n
```

## Step 6: Verify Installation

1. Open n8n in your browser (usually http://localhost:5678)
2. Create a new workflow
3. Click "+" to add a node
4. Search for "Pyth" - you should see:
   - **Pyth Network** (Action node)
   - **Pyth Trigger** (Trigger node)

## Step 7: Configure Credentials

1. In n8n, go to **Settings** > **Credentials**
2. Click **Add Credential**
3. Search for "Pyth"
4. Configure the credentials:

### Pyth API Credentials (for price queries)
- **Hermes API Endpoint**: `https://hermes.pyth.network` (mainnet)
- **Benchmarks API Endpoint**: `https://benchmarks.pyth.network`
- **API Key**: (optional, for higher rate limits)

### Pyth Network Credentials (for on-chain operations)
- **Network**: Mainnet or Testnet
- **Chain**: Select your blockchain
- **RPC Endpoint**: Your RPC provider URL
- **Private Key**: (only for write operations)

## Step 8: Test Basic Operations

### Test 1: Get ETH/USD Price

1. Add a **Pyth Network** node
2. Configure:
   - Resource: `Price Feed`
   - Operation: `Get Price`
   - Feed ID: `ETH/USD`
3. Execute - you should get the current ETH/USD price

### Test 2: Get Multiple Prices

1. Add a **Pyth Network** node
2. Configure:
   - Resource: `Price Feed`
   - Operation: `Get Multiple Prices`
   - Feed IDs: `ETH/USD, BTC/USD, SOL/USD`
3. Execute - you should get prices for all three assets

### Test 3: Historical Data

1. Add a **Pyth Network** node
2. Configure:
   - Resource: `Benchmarks`
   - Operation: `Get Historical Price`
   - Symbol: `Crypto.ETH/USD`
   - From: (Unix timestamp, e.g., 1704067200)
   - To: (Unix timestamp or 0 for now)
   - Resolution: `1D`
3. Execute - you should get OHLC data

---

## Troubleshooting

### Node Not Appearing
- Ensure you ran `npm run build`
- Check that files exist in `dist/` directory
- Restart n8n completely

### Credential Test Fails
- Verify endpoint URLs are correct
- Check network connectivity
- Ensure API key is valid (if using one)

### Price Feed Not Found
- Use exact symbol format: `ETH/USD`, `BTC/USD`
- Or use full feed ID: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`

### On-Chain Operations Fail
- Verify RPC endpoint is correct and accessible
- Ensure sufficient gas for transactions
- Check private key format (with or without 0x prefix)

---

## Development Commands

```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run format
```

---

## License

This project is licensed under the Business Source License 1.1 (BSL 1.1).

Commercial use by for-profit organizations requires a commercial license from Velocity BPA.

For licensing: https://velobpa.com/licensing | licensing@velobpa.com
