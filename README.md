# Piduct – Web3 Skill Barter Marketplace

**Trade Skills, Not Money.**  
Piduct is the first decentralized marketplace where your talent is the currency. Offer your skills, get paid in $PID tokens, match instantly — everything on-chain + permanently saved.

**Live Testnet (Sepolia)** → https://piduct-skill-barter-ra1e.vercel.app/  
**GitHub** → https://github.com/somsnoble/piduct-skill-barter  
**Author** → [@somsnoble](https://x.com/somsnoble)

### 🚀 What’s Already Working (as of Nov 20, 2025)

- Wallet connect via RainbowKit (MetaMask & all major wallets)
- Real $PID ERC-20 token on Sepolia
- Instant faucet → 1000 test $PID with one click
- Create skill offers with custom price in $PID
- Accept offers → real on-chain transaction (10 $PID fee)
- Every offer & match saved forever in Supabase (real PostgreSQL database)
- Beautiful dark glassmorphism UI (fully responsive)
- All core pages ready: Home, Dashboard, Categories, Match, Wallet, Settings, Chat, Stake, Testnet

### 🛠 Tech Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| Frontend       | React 18 + Vite + Tailwind CSS (CDN)            |
| Wallet         | RainbowKit + Wagmi + viem                       |
| Blockchain     | Ethereum Sepolia testnet                        |
| Token          | $PID ERC-20 (`0xbbdb...ffdf`)                    |
| Marketplace    | SkillBarter Solidity contract (`0xb994...62fe`) |
| Database       | Supabase (PostgreSQL + real-time + free tier)   |
| Deployment     | Vercel (instant, free, global CDN)              |

### 🔗 Important Links

- **Live App**: https://piduct-skill-barter-ra1e.vercel.app/
- **$PID Token (Sepolia)**: `0xbbdb3de211fe96df0f1974c2c1c848716da7ffdf`
- **SkillBarter Contract (Sepolia)**: `0xb994181db8fe1049ce45db3b93c63b01cebf62fe`
- **Supabase Project**: `byqnksapkhiurzocguls` (all data persists forever)

### 📱 Run Locally

```bash
git clone https://github.com/somsnoble/piduct-skill-barter.git
cd piduct-skill-barter
npm install
npm run dev

Open http://localhost:5173 → Connect wallet → Get $PID → Start bartering!

## Roadmap
- User profiles with reputation & portfolio
- Real-time chat between matched users  
- Advanced search & categories
- $PID staking vault with rewards
- Mainnet launch + token airdrop
- Mobile app (React Native)

## Contributing
Pull requests, issues, and ideas are very welcome!
Let's build the future of skill-to-skill economy together.

## Author
Built with passion by [@somsnoble](https://github.com/somsnoble)

**November 20, 2025** — the day Piduct went live.

**Piduct** – where your skills finally have real on-chain value.

[Try it now →](https://piduct-skill-barter-ra1e.vercel.app/)