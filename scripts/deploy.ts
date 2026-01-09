import hre from "hardhat";
import { formatEther } from "viem";
import "dotenv/config";

async function main() {
    console.log("🚀 STARTING DEPLOYMENT...");

    // 1. Lấy thông tin ví & Client
    // Nếu chạy trên v3 EDR, đôi khi cần connect()
    let viemObj = hre.viem;
    if (!viemObj && (hre as any).network && (hre as any).network.connect) {
        const conn = await (hre as any).network.connect();
        viemObj = conn.viem;
    }

    const [deployer] = await viemObj.getWalletClients();
    const publicClient = await viemObj.getPublicClient();

    console.log(`👨‍💻 Deployer: ${deployer.account.address}`);

    const balance = await publicClient.getBalance({ address: deployer.account.address });
    console.log(`💰 Balance:  ${formatEther(balance)} ETH`);

    // 2. Xác định địa chỉ Backend (Admin)
    // Nếu không có trong .env thì lấy chính ví đang deploy làm Admin
    const backendAddress = process.env.BACKEND_ADDRESS
        ? (process.env.BACKEND_ADDRESS as `0x${string}`)
        : deployer.account.address;

    console.log(`🤖 Backend Admin set to: ${backendAddress}`);

    // ===========================================
    // A. DEPLOY DECISION LOG
    // ===========================================
    console.log("\n📦 [1/3] Deploying DecisionLog...");

    const decisionLog = await viemObj.deployContract("DecisionLog", []);
    console.log(`✅ DecisionLog deployed: ${decisionLog.address}`);

    // ===========================================
    // B. DEPLOY DISCIPLINE VAULT
    // ===========================================
    console.log("\n📦 [2/3] Deploying DisciplineVault...");

    // Constructor: (address _backendSystem, address _decisionLogAddress)
    const vault = await viemObj.deployContract("DisciplineVault", [
        backendAddress,
        decisionLog.address
    ]);
    console.log(`✅ DisciplineVault deployed: ${vault.address}`);

    // ===========================================
    // C. KẾT NỐI (HANDSHAKE)
    // ===========================================
    console.log("\n🔄 [3/3] Linking Contracts...");

    // Gọi hàm setVaultAddress trên DecisionLog để cấp quyền ghi
    const hash = await decisionLog.write.setVaultAddress([vault.address]);

    // Chờ xác nhận
    await publicClient.waitForTransactionReceipt({ hash });

    console.log("🎉 SUCCESS! Deployment Complete.");
    console.log("-------------------------------------");
    console.log(`👉 DecisionLog:     ${decisionLog.address}`);
    console.log(`👉 DisciplineVault: ${vault.address}`);
    console.log("-------------------------------------");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ DEPLOY ERROR:", error);
        process.exit(1);
    });