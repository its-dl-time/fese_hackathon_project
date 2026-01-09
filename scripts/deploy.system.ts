import hre from "hardhat";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import "dotenv/config";

async function main() {
    console.log("🚀 BẮT ĐẦU DEPLOY (PHƯƠNG PHÁP DIRECT VIEM)...");

    // 1. CHUẨN BỊ KẾT NỐI (Tự làm, không nhờ Hardhat)
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

    if (!rpcUrl || !privateKey) {
        console.error("❌ LỖI: Thiếu thông tin trong .env");
        process.exit(1);
    }

    // Setup tài khoản
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(rpcUrl),
    });

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl),
    });

    console.log(`👨‍💻 Deployer: ${account.address}`);
    const balance = await publicClient.getBalance({ address: account.address });
    // Chia 1e18 để ra số ETH dễ đọc
    console.log(`💰 Balance:   ${Number(balance) / 1e18} ETH`);

    if (balance === 0n) {
        console.error("❌ VÍ HẾT TIỀN RỒI! Hãy đi Faucet trước khi chạy tiếp.");
        process.exit(1);
    }

    // 2. LẤY CODE ĐÃ BIÊN DỊCH (Artifacts)
    // Chỉ dùng Hardhat để lấy nội dung file JSON, không dùng để kết nối mạng
    // nên sẽ không bị lỗi getWalletClients
    console.log("\n📚 Đang đọc file biên dịch...");
    const logArtifact = await hre.artifacts.readArtifact("DecisionLog");
    const vaultArtifact = await hre.artifacts.readArtifact("DisciplineVault");

    // 3. DEPLOY DECISION LOG
    console.log("\n📦 [1/3] Deploying DecisionLog...");
    const logHash = await walletClient.deployContract({
        abi: logArtifact.abi,
        bytecode: logArtifact.bytecode as `0x${string}`,
        args: []
    });
    console.log(`   👉 Tx Hash: ${logHash}`);
    console.log("   ⏳ Đang chờ confirm...");
    const logReceipt = await publicClient.waitForTransactionReceipt({ hash: logHash });
    const logAddress = logReceipt.contractAddress!;
    console.log(`✅ OK: ${logAddress}`);

    // 4. DEPLOY VAULT
    console.log("\n📦 [2/3] Deploying DisciplineVault...");
    // Lấy địa chỉ admin (backend) là chính người deploy nếu không set trong env
    const backendAddress = account.address;

    const vaultHash = await walletClient.deployContract({
        abi: vaultArtifact.abi,
        bytecode: vaultArtifact.bytecode as `0x${string}`,
        args: [backendAddress, logAddress] // Constructor: [admin, logAddress]
    });
    console.log(`   👉 Tx Hash: ${vaultHash}`);
    console.log("   ⏳ Đang chờ confirm...");
    const vaultReceipt = await publicClient.waitForTransactionReceipt({ hash: vaultHash });
    const vaultAddress = vaultReceipt.contractAddress!;
    console.log(`✅ OK: ${vaultAddress}`);

    // 5. LIÊN KẾT (HANDSHAKE)
    console.log("\n🔄 [3/3] Đang liên kết contracts...");
    const { request } = await publicClient.simulateContract({
        address: logAddress,
        abi: logArtifact.abi,
        functionName: 'setVaultAddress',
        args: [vaultAddress],
        account
    });
    const linkHash = await walletClient.writeContract(request);
    console.log(`   👉 Tx Hash: ${linkHash}`);
    await publicClient.waitForTransactionReceipt({ hash: linkHash });

    console.log("\n🎉 --- HOÀN TẤT 100% ---");
    console.log(`DecisionLog:     ${logAddress}`);
    console.log(`DisciplineVault: ${vaultAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});