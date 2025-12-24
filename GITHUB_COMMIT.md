# GitHub Repository Setup and Commit Instructions

## Initial Repository Setup

```bash
# Extract and navigate
unzip n8n-nodes-pyth.zip
cd n8n-nodes-pyth

# Initialize and push
git init
git add .
git commit -m "Initial commit: n8n Pyth Network oracle community node

Features:
- Price Feed: Get prices, EMA prices, confidence intervals, staleness checks
- Real-Time: Streaming updates via SSE/WebSocket, batch queries
- On-Chain: Update prices on EVM chains, fee estimation, gas calculation
- Hermes: Full price service integration with VAA support
- Benchmarks: Historical OHLC data, TWAP calculations
- Asset: Browse and search 50+ supported price feeds
- Confidence: Risk assessment, safe prices for DeFi
- EMA: Moving average comparisons and deviation tracking
- Smart Contract: Direct on-chain queries across 8+ EVM chains
- Entropy: Verifiable randomness integration
- Utility: Price conversion, feed ID validation, formatting

Supported Chains:
- Ethereum, Arbitrum, Optimism, Base, Polygon
- BNB Chain, Avalanche, Fantom
- Solana, Sui, Aptos, Sei, Injective, NEAR

License: BSL 1.1
Author: Velocity BPA (https://velobpa.com)"

git remote add origin https://github.com/Velocity-BPA/n8n-nodes-pyth.git
git branch -M main
git push -u origin main
```

## Repository Settings

After pushing, configure these settings on GitHub:

### Repository Description
```
n8n community node for Pyth Network oracle - real-time price feeds, on-chain updates, historical data, and DeFi integrations across 20+ blockchains
```

### Topics
```
n8n, n8n-community-node, pyth, pyth-network, oracle, price-feed, defi, blockchain, ethereum, solana, cross-chain, cryptocurrency, web3
```

### Website
```
https://velobpa.com
```

---

## Version Tagging

```bash
# Tag initial release
git tag -a v1.0.0 -m "v1.0.0 - Initial Release

n8n community node for Pyth Network oracle protocol.

Features:
- 11 resource types with 60+ operations
- Real-time price streaming
- Multi-chain support (20+ networks)
- Historical data access
- Confidence analysis for DeFi
- Comprehensive test coverage

License: BSL 1.1"

git push origin v1.0.0
```

---

## Future Commits Template

```bash
git add .
git commit -m "feat: [brief description]

[Detailed description of changes]

Changes:
- [Change 1]
- [Change 2]
- [Change 3]

Closes #[issue number]"
```

### Commit Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

---

## Author Information

**Velocity BPA**
- Website: https://velobpa.com
- GitHub: https://github.com/Velocity-BPA
- Email: licensing@velobpa.com
