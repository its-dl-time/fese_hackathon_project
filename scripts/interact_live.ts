import hre from "hardhat"; // Dùng để lấy ABI
import { createPublicClient, createWalletClient, http, getContract, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as readline from "readline";
import "dotenv/config";

// --- CẤU HÌNH ĐỊA CHỈ CONTRACT (Lấy từ kết quả deploy của bạn) ---
const LOG_ADDRESS = "0x0430c7ad3e81fa9d5a25a25f0eb3c3936d285ea0";
const VAULT_ADDRESS = "0x98941835d1661ab622e43f4d79e5f91572161be3";

// --- CẤU HÌNH MENU ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const askQuestion = (q: string) => new Promise<string>((resolve) => rl.question(q, resolve));

async function main() {
    console.log("\n🚀 KẾT NỐI VÀO MẠNG SEPOLIA (DIRECT VIEM)...");

    // 1. Setup Client (Thủ công - Bao chạy)
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

    if (!rpcUrl || !privateKey) throw new Error("❌ Thiếu file .env");

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });
    const publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });

    console.log(`👤 User: ${account.address}`);
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`💰 Balance: ${formatEther(balance)} ETH`);

    // 2. Load Contracts (Kết nối vào contract đã deploy)
    console.log("\n📚 Đang tải ABI và kết nối Contract...");
    const logArtifact = await hre.artifacts.readArtifact("DecisionLog");
    const vaultArtifact = await hre.artifacts.readArtifact("DisciplineVault");

    const decisionLog = getContract({
        address: LOG_ADDRESS,
        abi: logArtifact.abi,
        client: { public: publicClient, wallet: walletClient }
    });

    const vault = getContract({
        address: VAULT_ADDRESS,
        abi: vaultArtifact.abi,
        client: { public: publicClient, wallet: walletClient }
    });

    console.log(`✅ Đã kết nối DecisionLog tại:   ${LOG_ADDRESS}`);
    console.log(`✅ Đã kết nối DisciplineVault tại: ${VAULT_ADDRESS}`);

    // --- MENU LOOP ---
    while (true) {
        console.log("\n------------------------------------------------");
        console.log("👇 CHỌN HÀNH ĐỘNG (SEPOLIA REAL-TIME):");
        console.log("1. [SETUP] Cài mức phạt & Nạp Credit (Admin nạp cho chính mình)");
        console.log("2. [BACKEND] Trigger Cool-off (Chặn lệnh)");
        console.log("3. [USER] Force Execute (Chấp nhận phạt tiền)");
        console.log("4. [USER] Free Execute (Kiên nhẫn chờ - Check time)");
        console.log("5. [CHECK] Xem trạng thái ví & Lệnh treo");
        console.log("6. [LOGS] Xem Lịch sử trên Blockchain");
        console.log("0. Thoát");

        const choice = await askQuestion("👉 Nhập số: ");

        try {
            switch (choice.trim()) {
                case "1": // SETUP
                    console.log("\n--- THIẾT LẬP ---");
                    // Set mức phạt
                    const pInput = await askQuestion("Nhập mức phạt (VND) [Enter = 50k]: ");
                    const fee = pInput ? BigInt(pInput) : 50000n;

                    console.log("⏳ Đang gửi lệnh setMyPenaltyFee...");
                    const tx1 = await vault.write.setMyPenaltyFee([fee]);
                    console.log(`   Tx Hash: ${tx1} (Chờ confirm...)`);
                    await publicClient.waitForTransactionReceipt({ hash: tx1 });
                    console.log("✅ Đã set mức phạt xong.");

                    // Nạp tiền (Tự nạp cho mình vì Admin = User trong ví test)
                    const tInput = await askQuestion("Nhập tiền nạp (Credit) [Enter = 1tr]: ");
                    const topup = tInput ? BigInt(tInput) : 1000000n;

                    console.log("⏳ Đang gửi lệnh adminTopUpCredit...");
                    const tx2 = await vault.write.adminTopUpCredit([account.address, topup]);
                    console.log(`   Tx Hash: ${tx2} (Chờ confirm...)`);
                    await publicClient.waitForTransactionReceipt({ hash: tx2 });
                    console.log("✅ Đã nạp tiền xong.");
                    break;

                case "2": // TRIGGER
                    console.log("\n--- TRIGGER COOL-OFF ---");
                    const hash = `ORDER_${Date.now()}`;
                    const time = 60n; // 60 giây cho nhanh test
                    console.log(`⏳ Đang chặn lệnh ${hash} trong ${time}s...`);

                    const tx3 = await vault.write.triggerCoolOff(
                        [account.address, hash, time, 85n, "Test Sepolia"],
                        { account }
                    );
                    console.log(`   Tx Hash: ${tx3}`);
                    await publicClient.waitForTransactionReceipt({ hash: tx3 });
                    console.log("⛔ ĐÃ CHẶN LỆNH THÀNH CÔNG TRÊN BLOCKCHAIN!");
                    break;

                case "3": // FORCE EXECUTE
                    console.log("\n--- FORCE EXECUTE (PHẠT) ---");
                    console.log("⏳ Đang gửi transaction...");
                    const tx4 = await vault.write.executeForce();
                    console.log(`   Tx Hash: ${tx4}`);
                    await publicClient.waitForTransactionReceipt({ hash: tx4 });
                    console.log("✅ ĐÃ TRỪ TIỀN VÀ MỞ KHÓA LỆNH!");
                    break;

                case "4": // FREE EXECUTE
                    console.log("\n--- FREE EXECUTE (CHỜ) ---");
                    try {
                        console.log("⏳ Đang thử mở khóa...");
                        const tx5 = await vault.write.executeFree();
                        console.log(`   Tx Hash: ${tx5}`);
                        await publicClient.waitForTransactionReceipt({ hash: tx5 });
                        console.log("✅ THÀNH CÔNG! (Không mất tiền)");
                    } catch (e: any) {
                        // Bắt lỗi từ Smart Contract trả về
                        console.log("❌ THẤT BẠI: Có thể chưa hết giờ.");
                        console.log("Chi tiết:", e.shortMessage || e.message);
                    }
                    break;

                case "5": // CHECK
                    const credit = await vault.read.fiatCredit([account.address]);
                    const pending = await vault.read.pendingOrders([account.address]);
                    const now = Math.floor(Date.now() / 1000);
                    const unlockTime = Number(pending[1]);

                    console.log(`\n💰 Credit: ${credit}`);
                    console.log(`🔒 Active: ${pending[4]}`);
                    if (pending[4]) {
                        console.log(`⏰ Unlock Time: ${new Date(unlockTime * 1000).toLocaleTimeString()}`);
                        if (now < unlockTime) console.log(`Wait: Còn phải chờ ${unlockTime - now} giây.`);
                        else console.log("✅ Đã hết giờ chờ! Có thể chọn mục 4.");
                    }
                    break;

                case "6": // LOGS
                    console.log("\n--- LỊCH SỬ ON-CHAIN ---");
                    const history = await decisionLog.read.getUserHistory([account.address]);
                    if (history.length === 0) console.log("📭 Chưa có log nào.");
                    history.forEach((h: any, i: number) => {
                        console.log(`Log #${i}: Action=${h.actionType}, Paid=${h.penaltyPaid}`);
                    });
                    break;

                case "0":
                    process.exit(0);
            }
        } catch (error: any) {
            console.error("\n❌ LỖI GIAO DỊCH:");
            console.error(error.shortMessage || error.message);
        }
    }
}

main().catch((e) => { console.error(e); process.exit(1); });