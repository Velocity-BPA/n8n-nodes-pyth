# n8n-nodes-pyth

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for **Pyth Network** oracle protocol. This marketplace-ready toolkit enables seamless integration with Pyth's decentralized price oracle, including real-time price feeds, on-chain updates, historical data, and DeFi integrations across 20+ blockchain networks.

![Pyth Network](https://img.shields.io/badge/Pyth-Network-purple)
![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **11 Resource Categories** with 60+ operations
- **Real-Time Price Feeds** - Access live crypto, forex, commodity, and equity prices
- **On-Chain Updates** - Push price updates to EVM-compatible smart contracts
- **Historical Data** - Query OHLC data and TWAP via Benchmarks API
- **Confidence Analysis** - Work with price uncertainty for DeFi risk management
- **Multi-Chain Support** - 20+ blockchain networks supported
- **Streaming Updates** - Real-time subscriptions via SSE/WebSocket
- **Full TypeScript Support** - Type-safe implementations

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-pyth`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-pyth
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-pyth.git
cd n8n-nodes-pyth

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n (for development)
npm link
cd ~/.n8n/custom
npm link n8n-nodes-pyth
```

## Credentials Setup

### Pyth API Credentials

| Field | Description |
|-------|-------------|
| Environment | Select mainnet or testnet |
| Hermes API Endpoint | Price service URL (default: https://hermes.pyth.network) |
| Benchmarks API Endpoint | Historical data URL (default: https://benchmarks.pyth.network) |
| API Key | Optional API key for higher rate limits |

### Pyth Network Credentials (For On-Chain Operations)

| Field | Description |
|-------|-------------|
| Network | Select mainnet or testnet |
| Chain | Select blockchain (Ethereum, Arbitrum, Base, etc.) |
| RPC Endpoint | Your RPC provider URL |
| Private Key | Your wallet private key (for write operations) |

### Pyth Publisher Credentials (Optional)

| Field | Description |
|-------|-------------|
| Publisher Key | Publisher authentication key |
| Publisher Endpoint | Publisher service endpoint |
| Pythnet RPC | Pythnet Solana RPC endpoint |

## Resources & Operations

### Price Feed
- Get Price
- Get Price with Confidence
- Get Price No Older Than
- Get EMA Price
- Get Feed ID
- Get All Feed IDs
- Search Feeds
- Validate Feed ID
- Get Staleness
- Get Multiple Prices

### Real-Time Price
- Get Latest Update
- Get Price with Publish Time
- Get Multiple Prices
- Get Confidence Interval
- Calculate Deviation

### On-Chain Update
- Get Update Fee
- Get Update Data
- Update Price Feed
- Estimate Gas
- Get Contract Address
- Get Valid Time Period

### Hermes (Price Service)
- Get Latest Price Updates
- Get Price Feed IDs
- Get Latest VAA
- Get Streaming URL
- Health Check

### Benchmarks (Historical)
- Get Historical Price
- Get Price at Time
- Get TWAP
- Search Symbols
- Get Symbol Info

### Asset
- Get All Assets
- Get by Symbol
- Get by Type
- Search Assets

### Confidence
- Get Confidence
- Get Confidence Level
- Check Acceptable
- Get Safe Price

### EMA (Moving Average)
- Get EMA Price
- Compare to EMA
- Get EMA Deviation

### Smart Contract
- Get Contract Address
- Check Feed Exists
- Get On-Chain Price

### Entropy (Randomness)
- Get Entropy Fee
- Get Entropy Contract

### Utility
- Convert Expo
- Format Price
- Validate Feed ID
- Get Feed ID from Symbol
- Get Symbol from Feed ID
- Get Timestamp

## Trigger Node

Monitor price events in real-time:

| Trigger | Description |
|---------|-------------|
| Price Updated | Fires on any price update |
| Price Above Threshold | Fires when price exceeds value |
| Price Below Threshold | Fires when price falls below value |
| Price Change Percent | Fires on percentage price moves |
| Confidence Changed | Fires when confidence interval changes significantly |
| Price Stale | Fires when price data becomes stale |

## Usage Examples

### Get Current ETH Price

```javascript
// In n8n workflow:
// 1. Add Pyth Network node
// 2. Select "Price Feed" resource
// 3. Select "Get Price" operation
// 4. Enter "ETH/USD" as Feed ID
```

### Get Multiple Prices

```javascript
// 1. Add Pyth Network node
// 2. Select "Price Feed" resource
// 3. Select "Get Multiple Prices" operation
// 4. Enter "ETH/USD, BTC/USD, SOL/USD" as Feed IDs
```

### Get Historical Data

```javascript
// 1. Add Pyth Network node
// 2. Select "Benchmarks" resource
// 3. Select "Get Historical Price" operation
// 4. Configure symbol, time range, and resolution
```

### Monitor Price Alerts

```javascript
// 1. Add Pyth Trigger node
// 2. Select "Price Above Threshold" trigger
// 3. Enter feed ID (e.g., "BTC/USD")
// 4. Set threshold price
```

### Update Price On-Chain

```javascript
// 1. Add Pyth Network node
// 2. Select "On-Chain Update" resource
// 3. Select "Get Update Data" operation
// 4. Provide feed IDs and chain configuration
```

## Pyth Network Concepts

### Price Feed IDs
Each asset has a unique 32-byte hex identifier (e.g., `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace` for ETH/USD). The node accepts both symbols (ETH/USD) and raw feed IDs.

### Price Format
Pyth prices use integer representation with an exponent:
- `price`: Integer value
- `expo`: Exponent (typically negative, e.g., -8)
- Actual price = `price * 10^expo`

### Confidence Intervals
Every price includes a confidence interval representing uncertainty:
- **Excellent**: < 0.1% of price
- **Good**: < 0.5% of price
- **Acceptable**: < 1% of price
- **Caution**: > 1% of price

### Pull Oracle Model
Unlike push oracles, Pyth uses a pull model where users fetch price updates from Hermes and submit them on-chain when needed.

### VAA (Verified Action Approval)
Wormhole-signed messages that attest to price data for cross-chain updates, enabling trustless price verification.

## Supported Price Feeds

### Cryptocurrencies
BTC/USD, ETH/USD, SOL/USD, BNB/USD, XRP/USD, ADA/USD, DOGE/USD, AVAX/USD, DOT/USD, LINK/USD, UNI/USD, ATOM/USD, ARB/USD, OP/USD, SUI/USD, APT/USD, and more...

### Stablecoins
USDC/USD, USDT/USD, DAI/USD

### Forex
EUR/USD, GBP/USD, JPY/USD, CHF/USD

### Commodities
XAU/USD (Gold), XAG/USD (Silver)

## Supported Networks

| Network | Chain ID | Type |
|---------|----------|------|
| Ethereum | 1 | EVM |
| Arbitrum | 42161 | EVM |
| Optimism | 10 | EVM |
| Base | 8453 | EVM |
| Polygon | 137 | EVM |
| BNB Chain | 56 | EVM |
| Avalanche | 43114 | EVM |
| Fantom | 250 | EVM |
| Solana | - | Non-EVM |
| Sui | - | Non-EVM |
| Aptos | - | Non-EVM |
| Sei | - | Non-EVM |

## Error Handling

The node includes comprehensive error handling:
- Invalid feed ID validation
- Stale price detection
- Network connectivity issues
- Rate limit handling
- On-chain transaction failures

## Security Best Practices

1. **Never expose private keys** - Use n8n credentials securely
2. **Check confidence intervals** - Don't use prices with high uncertainty
3. **Test on testnet first** - Use testnet before mainnet operations
4. **Monitor price staleness** - Verify prices are fresh before use
5. **Validate feed IDs** - Ensure correct feed IDs for your assets

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Lint code
npm run lint

# Run tests
npm test

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- [Open an issue](https://github.com/Velocity-BPA/n8n-nodes-pyth/issues) for bug reports
- [Start a discussion](https://github.com/Velocity-BPA/n8n-nodes-pyth/discussions) for feature requests

## Acknowledgments

- [n8n](https://n8n.io) - Workflow automation platform
- [Pyth Network](https://pyth.network) - Decentralized price oracle
- [Wormhole](https://wormhole.com) - Cross-chain messaging protocol
