import { createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import fs from "fs";
import "dotenv/config";

// Now it WILL read your .env correctly
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
if (!privateKey) {
  console.error("❌ PRIVATE_KEY is missing or invalid in .env");
  process.exit(1);
}

const account = privateKeyToAccount(privateKey);

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
});

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

async function main() {
  console.log("Deploying with:", account.address);

  // Your platform wallet address
  const PLATFORM_WALLET = "0x34bbb0a87e9d319ca2a2b6c8e94bb7454f401788";

  // Check if we're deploying new contracts or just SkillBarter
  const DEPLOY_NEW_PID = false; // Set to true if you need new PIDToken

  let pidAddress: string;

  if (DEPLOY_NEW_PID) {
    // Deploy PIDToken (only if needed)
    console.log("🚀 Deploying new PIDToken...");
    const pidHash = await walletClient.deployContract({
      abi: JSON.parse(fs.readFileSync("./artifacts/contracts/PIDToken.sol/PIDToken.json", "utf8")).abi,
      bytecode: JSON.parse(fs.readFileSync("./artifacts/contracts/PIDToken.sol/PIDToken.json", "utf8")).bytecode as `0x${string}`,
      args: [],
    });
    console.log("PIDToken tx:", pidHash);
    const pidReceipt = await publicClient.waitForTransactionReceipt({ hash: pidHash });
    pidAddress = pidReceipt.contractAddress!;
    console.log("✅ PIDToken deployed →", pidAddress);
  } else {
    // Use existing PIDToken
    pidAddress = "0xbbdb3de211fe96df0f1974c2c1c848716da7ffdf";
    console.log("🔁 Using existing PIDToken →", pidAddress);
  }

  // Deploy NEW SkillBarter with platform wallet
  console.log("🚀 Deploying NEW SkillBarter with match requests...");
  const barterHash = await walletClient.deployContract({
    abi: JSON.parse(fs.readFileSync("./artifacts/contracts/SkillBarter.sol/SkillBarter.json", "utf8")).abi,
    bytecode: JSON.parse(fs.readFileSync("./artifacts/contracts/SkillBarter.sol/SkillBarter.json", "utf8")).bytecode as `0x${string}`,
    args: [pidAddress, PLATFORM_WALLET], // ← ADDED PLATFORM_WALLET parameter
  });
  console.log("SkillBarter tx:", barterHash);
  const barterReceipt = await publicClient.waitForTransactionReceipt({ hash: barterHash });
  const barterAddress = barterReceipt.contractAddress!;
  console.log("✅ NEW SkillBarter deployed →", barterAddress);

  // Save addresses
  const addresses = { 
    PIDToken: pidAddress, 
    SkillBarter: barterAddress,
    PlatformWallet: PLATFORM_WALLET
  };
  fs.writeFileSync("deployed-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("📁 Addresses saved to deployed-addresses.json");
  
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=================================");
  console.log("PIDToken (existing):", pidAddress);
  console.log("SkillBarter (NEW):", barterAddress);
  console.log("Platform Wallet:", PLATFORM_WALLET);
  console.log("=================================");
  console.log("Next: Update your frontend with the NEW SkillBarter address!");
}

main().catch((e) => {
  console.error("Deployment failed:", e);
  process.exit(1);
});